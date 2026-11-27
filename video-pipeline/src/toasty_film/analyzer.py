"""Gemini multimodal video analyzer with overnight pacing, seam dedup, and math checks."""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Optional

from .calibration import CalibrationStore
from .config import PipelineSettings, load_or_create_match_config
from .models import (
    MatchContext,
    MatchDraft,
    MatchEvent,
    aggregate_match_stats,
)
from .proxy import ProxyChunk, build_proxy_chunks


def build_chunk_prompt(
    context: MatchContext,
    chunk: ProxyChunk,
    calibration_guidance: str,
    toasty_kit_override: Optional[str] = None,
) -> str:
    toasty_kit = toasty_kit_override or context.toasty_color
    roster_lines = []
    for p in context.attendees:
        num = f"#{p.number}" if p.number is not None else "#?"
        roster_lines.append(f"  - {p.player_id}: {p.name} ({num}, {p.position})")
    roster_block = "\n".join(roster_lines) if roster_lines else "  - (No attendance pre-logged)"

    score_hint = (
        f"Ground-truth full-match final score: {context.toasty_code} {context.toasty_score} - "
        f"{context.opponent_score} {context.opponent} (use this to calibrate goal detection)."
        if context.toasty_score is not None and context.opponent_score is not None
        else "Final score not pre-logged."
    )

    return f"""You are a meticulous soccer/futsal video analyst reviewing a match chunk for Toasty FC ({context.toasty_code}).

MATCH CONTEXT:
- Match ID: {context.match_id} ({context.date}, {context.season_name})
- Teams: Toasty FC ({context.toasty_code}, jersey color: {toasty_kit} tan/beige or occasional white backup) vs. {context.opponent} ({context.opponent_code}, jersey color: {context.opponent_color})
- {score_hint}
- Chunk window: {int(chunk.start_sec)}s to {int(chunk.end_sec)}s of source file `{chunk.source_video}`. Report timestamps as SECONDS OFFSET FROM THE START OF THIS CHUNK (0 to {int(chunk.end_sec - chunk.start_sec)}).

TOASTY FC PLAYERS WHO ATTENDED THIS MATCH (match player_id ONLY from this list):
{roster_block}

{calibration_guidance}

WHAT TO DETECT (return a JSON array of event objects ONLY):
1. Goals (`goal`, `own_goal`) for BOTH teams — include 6s buildup before and 5s celebration after in clip_start_offset/clip_end_offset, identify Toasty scorer & assist (if Toasty goal), and list your best guess of the 5 Toasty player_ids visible on the court (`on_court_ids`) for plus/minus!
2. Shots on target (`shot_on_target`), Shots off target (`shot_off_target`), Goalkeeper saves (`save`), Blocks (`block`), Fouls (`foul`), Cards (`yellow_card`, `red_card`), Corners (`corner`) for BOTH teams.
3. Exciting near-misses or key chances (`highlight_chance`) worth keeping in a 5–8 minute traditional soccer highlight reel (skip dead air and routine restarts).
4. `halftime` whistle / half switch if it occurs in this chunk.

STRICT RULES:
- For `shotsOffTarget` vs `shotsOnTarget`: a shot that misses the goal frame is `shot_off_target`. A shot saved by the keeper is `shot_on_target` (for shooting team) AND a `save` (for defending team). A goal counts as `goal` (do NOT double-emit a separate `shot_on_target` for the same goal).
- For opponent events, leave `player_id` and `assist_player_id` null.
- Be honest with `confidence` (0.0 to 1.0). If jersey number or attribution isn't 100% clear, set confidence < 0.90 so the human reviewer verifies that clip!

Return ONLY valid JSON matching this schema:
{{
  "events": [
    {{
      "half": "1" | "2",
      "chunk_offset_sec": 124.5,
      "clip_start_offset_sec": 118.0,
      "clip_end_offset_sec": 130.0,
      "match_minute": 14,
      "event_type": "goal" | "own_goal" | "shot_on_target" | "shot_off_target" | "save" | "block" | "foul" | "yellow_card" | "red_card" | "corner" | "highlight_chance" | "halftime" | "kickoff",
      "team": "toasty" | "opponent",
      "player_id": "p1" | null,
      "assist_player_id": "p3" | null,
      "on_court_ids": ["p1", "p2", "p3", "p4", "p5"],
      "keep_in_highlight": true,
      "star_for_shorts": false,
      "confidence": 0.85,
      "notes": "Brief description of the play"
    }}
  ]
}}
"""


def parse_gemini_events_json(raw_text: str) -> list[dict[str, Any]]:
    """Extracts the events array from a Gemini JSON response (handles optional markdown fences)."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    payload = json.loads(cleaned)
    if isinstance(payload, dict):
        return list(payload.get("events", []))
    if isinstance(payload, list):
        return payload
    return []


def deduplicate_seam_events(events: list[MatchEvent], seam_window_sec: float = 4.0) -> list[MatchEvent]:
    """Removes duplicate detections created by overlapping chunk boundaries."""
    sorted_evs = sorted(events, key=lambda e: (e.source_video, e.video_time_sec))
    deduped: list[MatchEvent] = []
    for ev in sorted_evs:
        is_dup = False
        for prev in reversed(deduped):
            if prev.source_video != ev.source_video:
                break
            if abs(ev.video_time_sec - prev.video_time_sec) > seam_window_sec:
                break
            if prev.event_type == ev.event_type and prev.team == ev.team:
                # Keep higher-confidence detection
                if ev.confidence > prev.confidence:
                    deduped.remove(prev)
                else:
                    is_dup = True
                break
        if not is_dup:
            deduped.append(ev)

    # Re-index event IDs cleanly in chronological order
    for idx, ev in enumerate(deduped, start=1):
        ev.event_id = f"{ev.match_id}_e{idx:03d}"
    return deduped


def _analyze_chunk_with_gemini(
    settings: PipelineSettings,
    chunk: ProxyChunk,
    prompt: str,
    ref_images: list[tuple[str, Path]],
) -> list[dict[str, Any]]:
    from google import genai
    from google.genai import types

    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in video-pipeline/.env")

    client = genai.Client(api_key=settings.gemini_api_key)
    uploaded_video = client.files.upload(file=str(chunk.chunk_path))
    try:
        # Wait for Gemini file processing to reach ACTIVE state
        while getattr(uploaded_video.state, "name", str(uploaded_video.state)) == "PROCESSING":
            time.sleep(2)
            uploaded_video = client.files.get(name=uploaded_video.name)

        contents: list[Any] = [uploaded_video]
        for pid, img_path in ref_images:
            contents.append(f"Visual reference for Toasty FC player {pid}:")
            contents.append(
                types.Part.from_bytes(data=img_path.read_bytes(), mime_type="image/jpeg")
            )
        contents.append(prompt)

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )
        return parse_gemini_events_json(response.text or "{}")
    finally:
        try:
            client.files.delete(name=uploaded_video.name)
        except Exception:
            pass


def analyze_match_folder(
    match_folder: Path,
    context: MatchContext,
    settings: PipelineSettings,
    calibration: Optional[CalibrationStore] = None,
    use_nvenc: Optional[bool] = None,
) -> MatchDraft:
    """
    Runs the full unattended overnight pass on a match folder:
      1. Auto-loads/creates match_config.json
      2. Builds tiny NVENC 720p/2fps overlapping proxy chunks on NVMe scratch
      3. Runs Gemini multimodal review with roster, kit color (#cabba2), & calibration memory
      4. Deduplicates chunk seams, computes both-teams + player stats, flags <100% clips
      5. Saves draft_review.json locally (never mutates Google Sheets directly!)
    """
    cfg = load_or_create_match_config(match_folder, match_id=context.match_id)
    if cfg.opponent_code:
        context.opponent_code = cfg.opponent_code
    if cfg.opponent_color:
        context.opponent_color = cfg.opponent_color

    cal = calibration or CalibrationStore(settings.calibration_dir)
    cal_data = cal.load()
    guidance = cal.format_prompt_guidance()
    ref_images = cal.get_player_reference_images([p.player_id for p in context.attendees])
    player_names = {p.player_id: p.name for p in context.attendees}

    all_events: list[MatchEvent] = []
    for rel_video in cfg.primary_videos:
        chunks = build_proxy_chunks(
            match_folder=match_folder,
            relative_video_path=rel_video,
            scratch_dir=settings.nvme_scratch,
            chunk_seconds=settings.chunk_seconds,
            overlap_seconds=settings.chunk_overlap_seconds,
            proxy_fps=settings.proxy_fps,
            use_nvenc=use_nvenc,
        )
        for c_idx, chunk in enumerate(chunks):
            prompt = build_chunk_prompt(context, chunk, guidance, cfg.toasty_kit_override)
            raw_events = _analyze_chunk_with_gemini(settings, chunk, prompt, ref_images)
            for raw in raw_events:
                offset = float(raw.get("chunk_offset_sec") or 0.0)
                abs_time = chunk.start_sec + offset
                c_start = chunk.start_sec + float(
                    raw.get("clip_start_offset_sec")
                    if raw.get("clip_start_offset_sec") is not None
                    else max(0.0, offset - 6.0)
                )
                c_end = chunk.start_sec + float(
                    raw.get("clip_end_offset_sec")
                    if raw.get("clip_end_offset_sec") is not None
                    else (offset + (5.0 if raw.get("event_type") in ("goal", "own_goal") else 3.0))
                )
                pid = raw.get("player_id")
                aid = raw.get("assist_player_id")
                all_events.append(
                    MatchEvent(
                        event_id=f"{context.match_id}_tmp_{len(all_events)+1}",
                        match_id=context.match_id,
                        source_video=rel_video,
                        half=str(raw.get("half") or "1"),
                        video_time_sec=round(abs_time, 2),
                        clip_start_sec=round(max(0.0, c_start), 2),
                        clip_end_sec=round(max(c_start + 1.0, c_end), 2),
                        match_minute=raw.get("match_minute"),
                        event_type=raw.get("event_type") or "highlight_chance",
                        team=raw.get("team") or "toasty",
                        player_id=pid,
                        player_name=player_names.get(pid) if pid else None,
                        assist_player_id=aid,
                        assist_player_name=player_names.get(aid) if aid else None,
                        on_court_ids=[x for x in (raw.get("on_court_ids") or []) if x in player_names],
                        keep_in_highlight=bool(raw.get("keep_in_highlight", True)),
                        star_for_shorts=bool(raw.get("star_for_shorts", False)),
                        confidence=float(raw.get("confidence", 0.75)),
                        notes=str(raw.get("notes") or ""),
                    )
                )
            if c_idx < len(chunks) - 1 and settings.gemini_rpm_delay_seconds > 0:
                time.sleep(settings.gemini_rpm_delay_seconds)

    events = deduplicate_seam_events(all_events)
    toasty_stats, opp_stats, player_stats, warnings = aggregate_match_stats(
        context,
        events,
        confidence_threshold=float(cal_data.get("confidence_threshold", 0.95)),
    )

    draft = MatchDraft(
        match_folder=str(match_folder),
        context=context,
        config=cfg,
        events=events,
        team_stats_toasty=toasty_stats,
        team_stats_opponent=opp_stats,
        player_stats=player_stats,
        warnings=warnings,
        status="analyzed",
    )
    out_path = match_folder / "draft_review.json"
    out_path.write_text(draft.model_dump_json(indent=2) + "\n", encoding="utf-8")
    return draft
