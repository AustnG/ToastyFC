"""Option A: Upload-ready 1080p YouTube highlight reel renderer (RTX 3070 NVENC + raw audio)."""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Optional

from .config import PipelineSettings
from .graphics import (
    render_halftime_plate,
    render_intro_plate,
    render_outro_stats_plate,
    render_scoreboard_bug,
)
from .models import MatchDraft, MatchEvent, format_timestamp
from .proxy import has_nvenc


def _vcodec_args(nvenc: bool) -> list[str]:
    if nvenc:
        return ["-c:v", "h264_nvenc", "-preset", "p5", "-cq", "20", "-pix_fmt", "yuv420p"]
    return ["-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p"]


def _image_to_clip(
    image_path: Path,
    out_clip: Path,
    duration_sec: float,
    nvenc: bool,
    fps: int = 30,
) -> Path:
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-loop",
        "1",
        "-t",
        f"{duration_sec:.2f}",
        "-i",
        str(image_path),
        "-f",
        "lavfi",
        "-t",
        f"{duration_sec:.2f}",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-r",
        str(fps),
        "-vf",
        "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
        *_vcodec_args(nvenc),
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-shortest",
        str(out_clip),
    ]
    subprocess.run(cmd, check=True)
    return out_clip


def _cut_highlight_clip(
    src_video: Path,
    scoreboard_png: Path,
    out_clip: Path,
    start_sec: float,
    end_sec: float,
    nvenc: bool,
    fps: int = 30,
) -> Path:
    duration = max(1.0, end_sec - start_sec)
    filter_complex = (
        "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,"
        "pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps="
        f"{fps}[bg];[bg][1:v]overlay=0:0[v]"
    )
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        f"{start_sec:.2f}",
        "-t",
        f"{duration:.2f}",
        "-i",
        str(src_video),
        "-i",
        str(scoreboard_png),
        "-filter_complex",
        filter_complex,
        "-map",
        "[v]",
        "-map",
        "0:a?",
        *_vcodec_args(nvenc),
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        str(out_clip),
    ]
    subprocess.run(cmd, check=True)
    return out_clip


def render_highlight_reel(
    draft: MatchDraft,
    settings: PipelineSettings,
    use_nvenc: Optional[bool] = None,
    intro_sec: float = 3.5,
    halftime_sec: float = 2.0,
    outro_sec: float = 8.0,
) -> tuple[Path, Path]:
    """
    Renders Option A: upload-ready 1080p .mp4 highlight reel (raw gym/field audio, no slow-mo,
    intro graphic, live TOA #cabba2 top-corner scoreboard bug, halftime wipe, outro both-teams stat card)
    plus copy-pasteable youtube_chapters.txt.
    """
    match_folder = Path(draft.match_folder)
    out_dir = match_folder / "output"
    work_dir = settings.nvme_scratch / match_folder.name / "render_parts"
    out_dir.mkdir(parents=True, exist_ok=True)
    work_dir.mkdir(parents=True, exist_ok=True)

    nvenc = has_nvenc() if use_nvenc is None else use_nvenc
    ctx = draft.context

    kept_events = [
        e for e in sorted(draft.events, key=lambda x: (x.half, x.video_time_sec))
        if e.keep_in_highlight and e.event_type != "halftime"
    ]
    if not kept_events:
        raise ValueError("No events marked keep_in_highlight=True to render.")

    parts: list[Path] = []
    chapters: list[str] = []
    timeline_cursor = 0.0

    # 1. Intro graphic (or custom assets/intro_stinger.mp4 if user dropped one in)
    custom_intro = settings.assets_dir / "intro_stinger.mp4"
    intro_clip = work_dir / "000_intro.mp4"
    if custom_intro.exists():
        parts.append(custom_intro)
    else:
        intro_png = render_intro_plate(draft, work_dir / "intro.png")
        _image_to_clip(intro_png, intro_clip, intro_sec, nvenc=nvenc)
        parts.append(intro_clip)
    chapters.append(f"{format_timestamp(timeline_cursor)} Match Intro — TOA vs {ctx.opponent}")
    timeline_cursor += intro_sec

    # 2. Chronological highlight clips with live-updating scoreboard bug & halftime transition
    score_t = 0
    score_o = 0
    inserted_halftime = False
    has_second_half = any(str(e.half) == "2" for e in kept_events)
    has_first_half = any(str(e.half) == "1" for e in kept_events)

    bug_cache: dict[tuple[int, int, str], Path] = {}

    def get_bug(st: int, so: int, half: str) -> Path:
        h_lbl = "1ST" if str(half) == "1" else ("2ND" if str(half) == "2" else str(half).upper())
        key = (st, so, h_lbl)
        if key not in bug_cache:
            bug_cache[key] = render_scoreboard_bug(
                work_dir / f"bug_{st}_{so}_{h_lbl}.png",
                toasty_code=ctx.toasty_code,
                toasty_color=draft.config.toasty_kit_override or ctx.toasty_color,
                toasty_score=st,
                opp_code=ctx.opponent_code,
                opp_color=ctx.opponent_color,
                opp_score=so,
                half_label=h_lbl,
            )
        return bug_cache[key]

    for idx, ev in enumerate(kept_events, start=1):
        if has_first_half and has_second_half and not inserted_halftime and str(ev.half) == "2":
            ht_png = render_halftime_plate(draft, score_t, score_o, work_dir / "halftime.png")
            ht_clip = work_dir / f"{idx:03d}_halftime.mp4"
            _image_to_clip(ht_png, ht_clip, halftime_sec, nvenc=nvenc)
            parts.append(ht_clip)
            chapters.append(
                f"{format_timestamp(timeline_cursor)} Halftime ({ctx.toasty_code} {score_t}-{score_o} {ctx.opponent_code})"
            )
            timeline_cursor += halftime_sec
            inserted_halftime = True

        src_rel = ev.source_video or (draft.config.primary_videos[0] if draft.config.primary_videos else "")
        src_path = match_folder / src_rel
        if not src_path.exists():
            raise FileNotFoundError(f"Source clip missing for event {ev.event_id}: {src_path}")

        # Increment score on goal events so scoreboard reflects updated score cleanly
        if ev.event_type in ("goal", "own_goal"):
            if ev.team == "toasty":
                score_t += 1
            else:
                score_o += 1
            who = (
                "Own Goal"
                if ev.event_type == "own_goal"
                else (ev.player_name or (ctx.toasty_code if ev.team == "toasty" else ctx.opponent))
            )
            chapters.append(
                f"{format_timestamp(timeline_cursor)} GOAL — {who} ({score_t}-{score_o})"
            )
        elif ev.event_type == "save":
            who = ev.player_name or ("GK" if ev.team == "toasty" else f"{ctx.opponent_code} GK")
            chapters.append(f"{format_timestamp(timeline_cursor)} Save — {who}")

        bug_png = get_bug(score_t, score_o, ev.half)
        clip_out = work_dir / f"{idx:03d}_{ev.event_id}.mp4"
        clip_start = max(0.0, ev.clip_start_sec)
        clip_end = max(clip_start + 1.0, ev.clip_end_sec)
        _cut_highlight_clip(src_path, bug_png, clip_out, clip_start, clip_end, nvenc=nvenc)
        parts.append(clip_out)
        timeline_cursor += (clip_end - clip_start)

    # 3. Outro Statistics & Goal-Scorer Card
    outro_png = render_outro_stats_plate(draft, work_dir / "outro.png")
    outro_clip = work_dir / "999_outro.mp4"
    _image_to_clip(outro_png, outro_clip, outro_sec, nvenc=nvenc)
    parts.append(outro_clip)
    chapters.append(f"{format_timestamp(timeline_cursor)} Full-Time Stats & Scorers")

    # 4. Concatenate all normalized 1080p parts losslessly via ffmpeg concat demuxer
    concat_list = work_dir / "concat.txt"
    concat_lines = [f"file '{p.resolve().as_posix()}'" for p in parts]
    concat_list.write_text("\n".join(concat_lines) + "\n", encoding="utf-8")

    final_mp4 = out_dir / f"{ctx.match_id}_highlights_1080p.mp4"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-c",
            "copy",
            "-movflags",
            "+faststart",
            str(final_mp4),
        ],
        check=True,
    )

    chapters_path = out_dir / "youtube_chapters.txt"
    chapters_path.write_text("\n".join(chapters) + "\n", encoding="utf-8")
    return final_mp4, chapters_path
