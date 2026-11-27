"""Environment settings, Synology NAS folder discovery, and match_config.json helpers."""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

from .models import MatchConfig

VIDEO_EXTENSIONS = {".mp4", ".mov", ".mkv", ".avi", ".m4v"}
MATCH_ID_PATTERN = re.compile(r"(?:^|[_\-\s])(m\d+)(?:$|[_\-\s])", re.IGNORECASE)


@dataclass
class PipelineSettings:
    gemini_api_key: str
    gemini_model: str
    spreadsheet_id: str
    service_account_json_path: Optional[str]
    nas_root: Path
    nvme_scratch: Path
    toasty_shorthand: str
    toasty_kit_color: str
    chunk_seconds: int
    chunk_overlap_seconds: int
    proxy_fps: int
    gemini_rpm_delay_seconds: int
    review_ui_port: int
    calibration_dir: Path
    assets_dir: Path

    @classmethod
    def load(cls, env_file: Optional[Path] = None) -> "PipelineSettings":
        if env_file and env_file.exists():
            load_dotenv(env_file)
        else:
            load_dotenv()

        pkg_root = Path(__file__).resolve().parents[2]
        return cls(
            gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            spreadsheet_id=os.getenv(
                "TOASTY_SPREADSHEET_ID", "1194eXv6isWkB-UYZejnki6I3J25FguxVMJZS26PgdeM"
            ),
            service_account_json_path=os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON_PATH") or None,
            nas_root=Path(os.getenv("NAS_ROOT", "V:/ToastyFC")),
            nvme_scratch=Path(os.getenv("NVME_SCRATCH", str(pkg_root / "scratch"))),
            toasty_shorthand=os.getenv("TOASTY_SHORTHAND", "TOA"),
            toasty_kit_color=os.getenv("TOASTY_KIT_COLOR", "#cabba2"),
            chunk_seconds=int(os.getenv("CHUNK_SECONDS", "360")),
            chunk_overlap_seconds=int(os.getenv("CHUNK_OVERLAP_SECONDS", "10")),
            proxy_fps=int(os.getenv("PROXY_FPS", "2")),
            gemini_rpm_delay_seconds=int(os.getenv("GEMINI_RPM_DELAY_SECONDS", "15")),
            review_ui_port=int(os.getenv("REVIEW_UI_PORT", "8765")),
            calibration_dir=Path(os.getenv("CALIBRATION_DIR", str(pkg_root / "calibration"))),
            assets_dir=Path(os.getenv("ASSETS_DIR", str(pkg_root / "assets"))),
        )


def infer_match_id_from_folder(folder: Path) -> Optional[str]:
    m = MATCH_ID_PATTERN.search(folder.name)
    if m:
        return m.group(1).lower()
    return None


def discover_raw_videos(match_folder: Path) -> list[str]:
    """Finds raw video clips in raw/ subfolder (or directly inside match_folder)."""
    raw_dir = match_folder / "raw"
    search_dir = raw_dir if raw_dir.is_dir() else match_folder
    files = sorted(
        p
        for p in search_dir.iterdir()
        if p.is_file() and p.suffix.lower() in VIDEO_EXTENSIONS
    )
    return [p.relative_to(match_folder).as_posix() for p in files]


def load_or_create_match_config(match_folder: Path, match_id: Optional[str] = None) -> MatchConfig:
    """Loads match_config.json if present, or auto-generates a sensible default."""
    cfg_path = match_folder / "match_config.json"
    if cfg_path.exists():
        return MatchConfig.model_validate_json(cfg_path.read_text(encoding="utf-8"))

    resolved_id = match_id or infer_match_id_from_folder(match_folder) or match_folder.name
    raw_videos = discover_raw_videos(match_folder)

    # Heuristics: single file or 'veo' in filename -> veo; multiple files -> mevo (first file primary by default)
    if len(raw_videos) == 1 or any("veo" in v.lower() for v in raw_videos):
        veo_files = [v for v in raw_videos if "veo" in v.lower()]
        if veo_files and len(raw_videos) > len(veo_files):
            camera_setup = "hybrid"
            primary = veo_files
            bonus = [v for v in raw_videos if v not in veo_files]
        else:
            camera_setup = "veo"
            primary = raw_videos
            bonus = []
    else:
        camera_setup = "mevo"
        # Put non-goal-cam files as primary, goal cam as bonus angle for v2
        goal_cams = [v for v in raw_videos if "goal" in v.lower()]
        non_goal = [v for v in raw_videos if v not in goal_cams]
        primary = non_goal if non_goal else raw_videos[:1]
        bonus = goal_cams

    cfg = MatchConfig(
        match_id=resolved_id,
        camera_setup=camera_setup,
        primary_videos=primary,
        bonus_angles=bonus,
    )
    cfg_path.write_text(cfg.model_dump_json(indent=2) + "\n", encoding="utf-8")
    return cfg


def discover_match_folders(root: Path) -> list[Path]:
    """Recursively locates match folders containing a raw/ folder or match_config.json."""
    if not root.exists():
        return []
    found: list[Path] = []
    for p in sorted(root.rglob("*")):
        if not p.is_dir():
            continue
        if (p / "match_config.json").exists() or (p / "raw").is_dir():
            if p not in found:
                found.append(p)
    return found
