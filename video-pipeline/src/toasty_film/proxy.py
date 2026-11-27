"""FFmpeg RTX 3070 NVENC proxy & overlapping chunk builder on local NVMe scratch."""

from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class VideoInfo:
    path: Path
    duration_sec: float
    width: int
    height: int
    fps: float


@dataclass
class ProxyChunk:
    chunk_index: int
    source_video: str  # relative path inside match folder
    chunk_path: Path
    start_sec: float
    end_sec: float


def has_nvenc() -> bool:
    """Checks whether ffmpeg supports NVIDIA h264_nvenc on the current machine."""
    try:
        out = subprocess.check_output(
            ["ffmpeg", "-hide_banner", "-encoders"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
        return "h264_nvenc" in out
    except Exception:
        return False


def probe_video(video_path: Path) -> VideoInfo:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,r_frame_rate:format=duration",
        "-of",
        "json",
        str(video_path),
    ]
    data = json.loads(subprocess.check_output(cmd, text=True))
    stream = (data.get("streams") or [{}])[0]
    fmt = data.get("format") or {}
    fps_str = str(stream.get("r_frame_rate", "30/1"))
    if "/" in fps_str:
        num, den = fps_str.split("/", 1)
        fps = float(num) / max(float(den), 1.0)
    else:
        fps = float(fps_str or 30.0)
    return VideoInfo(
        path=video_path,
        duration_sec=float(fmt.get("duration") or 0.0),
        width=int(stream.get("width") or 1920),
        height=int(stream.get("height") or 1080),
        fps=fps,
    )


def build_proxy_chunks(
    match_folder: Path,
    relative_video_path: str,
    scratch_dir: Path,
    chunk_seconds: int = 360,
    overlap_seconds: int = 10,
    proxy_fps: int = 2,
    use_nvenc: Optional[bool] = None,
) -> list[ProxyChunk]:
    """
    Creates lightweight 720p low-FPS overlapping MP4 chunks on fast local NVMe scratch
    so huge 4K Veo / 1080p Mevo files on Synology NAS never need to be uploaded raw.
    """
    src_path = match_folder / relative_video_path
    if not src_path.exists():
        raise FileNotFoundError(f"Source video not found: {src_path}")

    info = probe_video(src_path)
    duration = info.duration_sec
    if duration <= 0:
        raise ValueError(f"Could not determine duration for {src_path}")

    nvenc = has_nvenc() if use_nvenc is None else use_nvenc
    out_dir = scratch_dir / match_folder.name / "proxies"
    out_dir.mkdir(parents=True, exist_ok=True)

    stem = src_path.stem.replace(" ", "_")
    step = max(chunk_seconds - overlap_seconds, 1)
    chunks: list[ProxyChunk] = []

    idx = 0
    start = 0.0
    while start < duration:
        end = min(duration, start + chunk_seconds)
        chunk_file = out_dir / f"{stem}_chunk{idx:02d}_{int(start)}s_{int(end)}s.mp4"

        if not chunk_file.exists():
            vf = f"scale=-2:720,fps={proxy_fps}"
            if nvenc:
                vcodec_args = ["-c:v", "h264_nvenc", "-preset", "p4", "-cq", "30"]
            else:
                vcodec_args = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "30"]

            cmd = [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-ss",
                f"{start:.2f}",
                "-to",
                f"{end:.2f}",
                "-i",
                str(src_path),
                "-vf",
                vf,
                *vcodec_args,
                "-c:a",
                "aac",
                "-b:a",
                "64k",
                "-ac",
                "1",
                "-movflags",
                "+faststart",
                str(chunk_file),
            ]
            subprocess.run(cmd, check=True)

        chunks.append(
            ProxyChunk(
                chunk_index=idx,
                source_video=relative_video_path,
                chunk_path=chunk_file,
                start_sec=start,
                end_sec=end,
            )
        )
        if end >= duration:
            break
        start += step
        idx += 1

    return chunks
