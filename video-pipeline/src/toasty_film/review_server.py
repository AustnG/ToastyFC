"""Local FastAPI Review UI server (http://localhost:8765) with HTTP Range video streaming."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel

from .calibration import CalibrationStore
from .config import PipelineSettings, discover_match_folders
from .fcpxml import export_davinci_fcpxml
from .models import MatchDraft, MatchEvent, aggregate_match_stats
from .renderer import render_highlight_reel
from .sheets_client import SheetsClient


class ApproveRequest(BaseModel):
    dry_run: bool = True
    player_of_the_match: Optional[str] = None


class AddRuleRequest(BaseModel):
    rule: str


def _recompute_and_save(draft: MatchDraft, calibration_dir: Path) -> MatchDraft:
    cal = CalibrationStore(calibration_dir).load()
    t_stats, o_stats, p_stats, warnings = aggregate_match_stats(
        draft.context,
        draft.events,
        confidence_threshold=float(cal.get("confidence_threshold", 0.95)),
    )
    draft.team_stats_toasty = t_stats
    draft.team_stats_opponent = o_stats
    draft.player_stats = p_stats
    draft.warnings = warnings
    draft_path = Path(draft.match_folder) / "draft_review.json"
    draft_path.write_text(draft.model_dump_json(indent=2) + "\n", encoding="utf-8")
    return draft


def create_app(
    settings: Optional[PipelineSettings] = None,
    extra_folders: Optional[list[Path]] = None,
) -> FastAPI:
    cfg = settings or PipelineSettings.load()
    app = FastAPI(title="Toasty FC Film Room — Local Review UI")
    ui_html_path = Path(__file__).parent / "review_ui" / "index.html"

    def find_drafts() -> dict[str, Path]:
        folders = list(extra_folders or [])
        if cfg.nas_root.exists():
            folders.extend(discover_match_folders(cfg.nas_root))
        by_id: dict[str, Path] = {}
        for folder in folders:
            dp = folder / "draft_review.json"
            if dp.exists():
                try:
                    d = MatchDraft.model_validate_json(dp.read_text(encoding="utf-8"))
                    by_id[d.context.match_id] = dp
                except Exception:
                    continue
        return by_id

    def load_draft(match_id: str) -> MatchDraft:
        drafts = find_drafts()
        if match_id not in drafts:
            raise HTTPException(status_code=404, detail=f"No draft_review.json found for {match_id}")
        return MatchDraft.model_validate_json(drafts[match_id].read_text(encoding="utf-8"))

    @app.get("/", response_class=HTMLResponse)
    def index() -> str:
        return ui_html_path.read_text(encoding="utf-8")

    @app.get("/api/matches")
    def list_matches() -> list[dict[str, Any]]:
        out = []
        for mid, dp in sorted(find_drafts().items()):
            d = MatchDraft.model_validate_json(dp.read_text(encoding="utf-8"))
            flagged = sum(1 for e in d.events if e.needs_review)
            out.append(
                {
                    "match_id": mid,
                    "date": d.context.date,
                    "opponent": d.context.opponent,
                    "score": f"{d.context.toasty_score if d.context.toasty_score is not None else d.team_stats_toasty.goals}-{d.context.opponent_score if d.context.opponent_score is not None else d.team_stats_opponent.goals}",
                    "status": d.status,
                    "events_total": len(d.events),
                    "events_flagged": flagged,
                    "warnings_count": len(d.warnings),
                }
            )
        return out

    @app.get("/api/matches/{match_id}")
    def get_match(match_id: str) -> dict[str, Any]:
        return load_draft(match_id).model_dump()

    @app.put("/api/matches/{match_id}/events/{event_id}")
    def update_event(match_id: str, event_id: str, updated: MatchEvent) -> dict[str, Any]:
        draft = load_draft(match_id)
        cal = CalibrationStore(cfg.calibration_dir)
        player_names = {p.player_id: p.name for p in draft.context.attendees}
        if updated.player_id:
            updated.player_name = player_names.get(updated.player_id, updated.player_name)
        else:
            updated.player_name = None
        if updated.assist_player_id:
            updated.assist_player_name = player_names.get(
                updated.assist_player_id, updated.assist_player_name
            )
        else:
            updated.assist_player_name = None

        found = False
        for i, ev in enumerate(draft.events):
            if ev.event_id == event_id:
                # Record AI -> Human corrections in calibration_log.json
                for field in ("event_type", "team", "player_id", "assist_player_id", "keep_in_highlight"):
                    old_val = getattr(ev, field)
                    new_val = getattr(updated, field)
                    if old_val != new_val:
                        cal.record_correction(
                            match_id=match_id,
                            event_id=event_id,
                            field=field,
                            ai_value=old_val,
                            human_value=new_val,
                            ai_confidence=ev.confidence,
                            note=updated.notes,
                        )
                draft.events[i] = updated
                found = True
                break
        if not found:
            raise HTTPException(status_code=404, detail=f"Event {event_id} not found")

        return _recompute_and_save(draft, cfg.calibration_dir).model_dump()

    @app.post("/api/matches/{match_id}/events")
    def add_event(match_id: str, event: MatchEvent) -> dict[str, Any]:
        draft = load_draft(match_id)
        if not event.event_id:
            event.event_id = f"{match_id}_e{len(draft.events)+1:03d}"
        event.match_id = match_id
        draft.events.append(event)
        draft.events.sort(key=lambda e: (e.half, e.video_time_sec))
        return _recompute_and_save(draft, cfg.calibration_dir).model_dump()

    @app.delete("/api/matches/{match_id}/events/{event_id}")
    def delete_event(match_id: str, event_id: str) -> dict[str, Any]:
        draft = load_draft(match_id)
        before = len(draft.events)
        draft.events = [e for e in draft.events if e.event_id != event_id]
        if len(draft.events) == before:
            raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
        return _recompute_and_save(draft, cfg.calibration_dir).model_dump()

    @app.post("/api/matches/{match_id}/approve")
    def approve_match(match_id: str, body: ApproveRequest) -> dict[str, Any]:
        draft = load_draft(match_id)
        if body.player_of_the_match is not None:
            draft.context.player_of_the_match = body.player_of_the_match
        if not body.dry_run:
            for ev in draft.events:
                ev.verified = True
            draft.status = "approved"
            draft = _recompute_and_save(draft, cfg.calibration_dir)

        client = SheetsClient(cfg)
        result = client.push_approved_draft(draft, dry_run=body.dry_run)
        return {"draft": draft.model_dump(), "sheets_result": result}

    @app.post("/api/matches/{match_id}/render")
    def render_match(match_id: str) -> dict[str, Any]:
        draft = load_draft(match_id)
        mp4_path, chapters_path = render_highlight_reel(draft, cfg)
        fcpxml_path = export_davinci_fcpxml(draft)
        draft.status = "rendered"
        _recompute_and_save(draft, cfg.calibration_dir)
        return {
            "mp4": str(mp4_path),
            "chapters": str(chapters_path),
            "fcpxml": str(fcpxml_path),
        }

    @app.post("/api/calibration/rules")
    def add_calibration_rule(body: AddRuleRequest) -> dict[str, Any]:
        cal = CalibrationStore(cfg.calibration_dir)
        cal.add_rule(body.rule)
        return cal.load()

    @app.get("/api/video/{match_id}")
    def stream_video(match_id: str, file: str, request: Request) -> StreamingResponse:
        """Streams local PC/NAS video files with HTTP Byte-Range support for instant seeking."""
        draft = load_draft(match_id)
        base = Path(draft.match_folder).resolve()
        target = (base / file).resolve()
        if not str(target).startswith(str(base)) or not target.is_file():
            raise HTTPException(status_code=404, detail="Video file not found")

        file_size = target.stat().st_size
        range_header = request.headers.get("range")
        start = 0
        end = file_size - 1
        status_code = 200
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Type": "video/mp4",
        }

        if range_header and range_header.startswith("bytes="):
            parts = range_header.replace("bytes=", "").split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else min(start + 4 * 1024 * 1024, file_size - 1)
            end = min(end, file_size - 1)
            status_code = 206
            headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"

        length = end - start + 1
        headers["Content-Length"] = str(length)

        def iter_file():
            with target.open("rb") as f:
                f.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = f.read(min(256 * 1024, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        return StreamingResponse(iter_file(), status_code=status_code, headers=headers)

    return app
