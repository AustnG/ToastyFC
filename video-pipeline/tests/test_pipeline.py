"""End-to-end unit & FFmpeg integration tests for Toasty FC video-pipeline."""

from __future__ import annotations

import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

from fastapi.testclient import TestClient

from toasty_film.analyzer import deduplicate_seam_events, parse_gemini_events_json
from toasty_film.benchmark import compare_draft_to_ground_truth, format_benchmark_report
from toasty_film.calibration import CalibrationStore
from toasty_film.config import (
    PipelineSettings,
    infer_match_id_from_folder,
    load_or_create_match_config,
)
from toasty_film.fcpxml import export_davinci_fcpxml
from toasty_film.models import (
    MatchConfig,
    MatchContext,
    MatchDraft,
    MatchEvent,
    RosterPlayer,
    aggregate_match_stats,
)
from toasty_film.proxy import build_proxy_chunks, probe_video
from toasty_film.renderer import render_highlight_reel
from toasty_film.review_server import create_app


def _sample_context() -> MatchContext:
    return MatchContext(
        match_id="m999",
        season_id="s12",
        season_name="2026 Winter - BG Futsal",
        date="2026-11-29",
        opponent="Semline",
        opponent_code="SEM",
        opponent_color="#2563EB",
        toasty_code="TOA",
        toasty_color="#cabba2",
        toasty_score=2,
        opponent_score=1,
        attendees=[
            RosterPlayer(player_id="p1", name="Austin Greer", number=0, position="Midfielder"),
            RosterPlayer(player_id="p2", name="Goran Omerdic", number=1, position="Goalkeeper"),
            RosterPlayer(player_id="p3", name="Zac Lechler", number=6, position="Forward"),
            RosterPlayer(player_id="p4", name="David Parra", number=18, position="Midfielder"),
            RosterPlayer(player_id="p5", name="Clay Pendleton", number=21, position="Defender"),
            RosterPlayer(player_id="p13", name="Jake Martin", number=12, position="Defender"),
        ],
    )


def _sample_events() -> list[MatchEvent]:
    return [
        MatchEvent(
            event_id="m999_e001",
            match_id="m999",
            source_video="raw/veo.mp4",
            half="1",
            video_time_sec=4.0,
            clip_start_sec=1.0,
            clip_end_sec=5.5,
            match_minute=8,
            event_type="goal",
            team="toasty",
            player_id="p3",
            player_name="Zac Lechler",
            assist_player_id="p1",
            assist_player_name="Austin Greer",
            on_court_ids=["p1", "p2", "p3", "p4", "p5"],
            keep_in_highlight=True,
            star_for_shorts=True,
            confidence=0.88,
            notes="Top-corner finish",
        ),
        MatchEvent(
            event_id="m999_e002",
            match_id="m999",
            source_video="raw/veo.mp4",
            half="1",
            video_time_sec=8.0,
            clip_start_sec=6.0,
            clip_end_sec=9.0,
            match_minute=14,
            event_type="shot_on_target",
            team="opponent",
            keep_in_highlight=False,
            confidence=0.96,
        ),
        MatchEvent(
            event_id="m999_e003",
            match_id="m999",
            source_video="raw/veo.mp4",
            half="1",
            video_time_sec=8.2,
            clip_start_sec=6.5,
            clip_end_sec=9.5,
            match_minute=14,
            event_type="save",
            team="toasty",
            player_id="p2",
            player_name="Goran Omerdic",
            keep_in_highlight=True,
            confidence=0.97,
        ),
        MatchEvent(
            event_id="m999_e004",
            match_id="m999",
            source_video="raw/veo.mp4",
            half="2",
            video_time_sec=12.0,
            clip_start_sec=10.0,
            clip_end_sec=13.5,
            match_minute=27,
            event_type="goal",
            team="opponent",
            on_court_ids=["p1", "p2", "p3", "p4", "p13"],
            keep_in_highlight=True,
            confidence=0.92,
        ),
        MatchEvent(
            event_id="m999_e005",
            match_id="m999",
            source_video="raw/veo.mp4",
            half="2",
            video_time_sec=15.0,
            clip_start_sec=14.0,
            clip_end_sec=17.5,
            match_minute=36,
            event_type="goal",
            team="toasty",
            player_id="p1",
            player_name="Austin Greer",
            on_court_ids=["p1", "p2", "p4", "p5", "p13"],
            keep_in_highlight=True,
            confidence=0.98,
        ),
        MatchEvent(
            event_id="m999_e006",
            match_id="m999",
            source_video="raw/veo.mp4",
            half="2",
            video_time_sec=16.5,
            clip_start_sec=15.5,
            clip_end_sec=18.0,
            match_minute=38,
            event_type="shot_off_target",
            team="toasty",
            player_id="p4",
            player_name="David Parra",
            keep_in_highlight=False,
            confidence=0.96,
        ),
    ]


def test_both_teams_aggregation_and_plus_minus():
    ctx = _sample_context()
    events = _sample_events()
    toasty, opp, p_rows, warnings = aggregate_match_stats(ctx, events)

    # Team totals (BOTH teams)
    assert toasty.goals == 2
    assert toasty.shots_off_target == 1
    assert toasty.shots_on_target == 2
    assert toasty.total_shots == 3
    assert toasty.saves == 1

    assert opp.goals == 1
    assert opp.shots_on_target == 2  # 1 saved shot + 1 goal
    assert opp.total_shots == 2

    # Exact plusMinus from 5-player goal checkboxes:
    # p1: +1 (e1), -1 (e4), +1 (e5) => +1
    # p5: +1 (e1), +1 (e5) => +2
    # p13: -1 (e4), +1 (e5) => 0
    # p3: +1 (e1), -1 (e4) => 0
    by_pid = {p.player_id: p for p in p_rows}
    assert by_pid["p1"].goals == 1
    assert by_pid["p1"].assists == 1
    assert by_pid["p1"].plus_minus == 1
    assert by_pid["p5"].plus_minus == 2
    assert by_pid["p13"].plus_minus == 0
    assert by_pid["p3"].goals == 1
    assert by_pid["p3"].plus_minus == 0
    assert by_pid["p2"].saves == 1
    assert by_pid["p2"].goals_allowed == 1
    assert by_pid["p2"].clean_sheet is False
    assert by_pid["p4"].shots_off_target == 1
    assert by_pid["p4"].total_shots == 1

    # Goals and Opponent SOT cross-check pass with zero warnings!
    assert warnings == []


def test_parse_gemini_and_seam_dedup():
    raw = """```json
    {"events": [{"event_type": "goal", "team": "toasty", "chunk_offset_sec": 10}]}
    ```"""
    parsed = parse_gemini_events_json(raw)
    assert len(parsed) == 1

    evs = [
        MatchEvent(
            event_id="a", match_id="m21", source_video="raw/veo.mp4",
            video_time_sec=355.0, event_type="goal", team="toasty", confidence=0.72
        ),
        MatchEvent(
            event_id="b", match_id="m21", source_video="raw/veo.mp4",
            video_time_sec=356.5, event_type="goal", team="toasty", confidence=0.94
        ),
    ]
    deduped = deduplicate_seam_events(evs, seam_window_sec=4.0)
    assert len(deduped) == 1
    assert deduped[0].confidence == 0.94
    assert deduped[0].event_id == "m21_e001"


def test_folder_inference_and_benchmark():
    assert infer_match_id_from_folder(Path("2026-11-29_m95_Semline")) == "m95"
    ctx = _sample_context()
    events = _sample_events()
    t, o, p_rows, warnings = aggregate_match_stats(ctx, events)
    draft = MatchDraft(
        match_folder="/tmp/test",
        context=ctx,
        config=MatchConfig(match_id="m999", primary_videos=["raw/veo.mp4"]),
        events=events,
        team_stats_toasty=t,
        team_stats_opponent=o,
        player_stats=p_rows,
        warnings=warnings,
    )
    gt_match = {
        "toastyScore": "2",
        "opponentScore": "1",
        "stats_shotsOffTarget_toasty": "1",
        "stats_shotsOnTarget_toasty": "2",
        "stats_saves_toasty": "1",
        "stats_shotsOnTarget_opponent": "2",
    }
    gt_players = [
        {"playerId": "p1", "playerName": "Austin Greer", "goals": "1", "assists": "1", "saves": ""},
        {"playerId": "p2", "playerName": "Goran Omerdic", "goals": "", "assists": "", "saves": "1"},
    ]
    report = compare_draft_to_ground_truth(draft, gt_match, gt_players)
    assert report["team_exact_matches"] == "18/18"
    text = format_benchmark_report(report)
    assert "Team exact matches (both squads): 18/18" in text


def test_end_to_end_proxy_render_fcpxml_and_review_ui(tmp_path: Path):
    match_dir = tmp_path / "2026-11-29_m999_Semline"
    raw_dir = match_dir / "raw"
    raw_dir.mkdir(parents=True)
    video_path = raw_dir / "veo.mp4"

    # Generate a real 20-second synthetic 1080p video + audio via ffmpeg
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            "testsrc2=size=1920x1080:rate=30:duration=20",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=440:sample_rate=48000:duration=20",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-c:a",
            "aac",
            str(video_path),
        ],
        check=True,
    )

    cfg = load_or_create_match_config(match_dir)
    assert cfg.match_id == "m999"
    assert cfg.camera_setup == "veo"
    assert cfg.primary_videos == ["raw/veo.mp4"]

    # 1. Test proxy chunking (CPU fallback in VM)
    scratch_dir = tmp_path / "scratch"
    chunks = build_proxy_chunks(
        match_dir,
        "raw/veo.mp4",
        scratch_dir,
        chunk_seconds=12,
        overlap_seconds=2,
        proxy_fps=2,
        use_nvenc=False,
    )
    assert len(chunks) == 2
    assert all(c.chunk_path.exists() for c in chunks)

    # 2. Save draft_review.json and test Option A (1080p MP4 + chapters) + Option B (DaVinci FCPXML)
    ctx = _sample_context()
    events = _sample_events()
    t, o, p_rows, warnings = aggregate_match_stats(ctx, events)
    draft = MatchDraft(
        match_folder=str(match_dir),
        context=ctx,
        config=cfg,
        events=events,
        team_stats_toasty=t,
        team_stats_opponent=o,
        player_stats=p_rows,
        warnings=warnings,
    )
    (match_dir / "draft_review.json").write_text(draft.model_dump_json(indent=2), encoding="utf-8")

    settings = PipelineSettings.load()
    settings.nvme_scratch = scratch_dir
    settings.calibration_dir = tmp_path / "calibration"
    settings.nas_root = tmp_path

    mp4_path, chapters_path = render_highlight_reel(
        draft, settings, use_nvenc=False, intro_sec=1.0, halftime_sec=1.0, outro_sec=1.5
    )
    assert mp4_path.exists()
    info = probe_video(mp4_path)
    assert info.width == 1920 and info.height == 1080
    assert info.duration_sec > 10.0

    chapters_text = chapters_path.read_text(encoding="utf-8")
    assert "Match Intro" in chapters_text
    assert "GOAL — Zac Lechler (1-0)" in chapters_text
    assert "Halftime" in chapters_text
    assert "Full-Time Stats & Scorers" in chapters_text

    fcpxml_path = export_davinci_fcpxml(draft)
    assert fcpxml_path.exists()
    root = ET.parse(fcpxml_path).getroot()
    assert root.tag == "fcpxml"
    clips = root.findall(".//asset-clip")
    assert len(clips) == 4  # 4 events marked keep_in_highlight=True

    # 3. Test FastAPI Review UI + calibration correction logging + Byte-Range video streaming
    app = create_app(settings=settings, extra_folders=[match_dir])
    client = TestClient(app)

    assert client.get("/").status_code == 200
    m_list = client.get("/api/matches").json()
    assert len(m_list) == 1 and m_list[0]["match_id"] == "m999"

    # Update event m999_e001: change scorer p3 -> p4 and verify -> logs correction in calibration_log.json
    ev1 = draft.events[0].model_copy(update={"player_id": "p4", "verified": True})
    res = client.put("/api/matches/m999/events/m999_e001", json=ev1.model_dump())
    assert res.status_code == 200
    updated_draft = res.json()
    p4_row = next(p for p in updated_draft["player_stats"] if p["player_id"] == "p4")
    assert p4_row["goals"] == 1

    cal_data = CalibrationStore(settings.calibration_dir).load()
    assert any(
        c["field"] == "player_id" and c["ai_value"] == "p3" and c["human_value"] == "p4"
        for c in cal_data["corrections"]
    )

    # Test Byte-Range streaming from local file
    vid_res = client.get(
        "/api/video/m999",
        params={"file": "raw/veo.mp4"},
        headers={"Range": "bytes=0-1023"},
    )
    assert vid_res.status_code == 206
    assert len(vid_res.content) == 1024
