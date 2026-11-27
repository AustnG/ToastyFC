"""Option B: DaVinci Resolve Free FCPXML 1.9 pre-cut timeline exporter."""

from __future__ import annotations

from pathlib import Path
from urllib.parse import quote
import xml.etree.ElementTree as ET

from .models import MatchDraft
from .proxy import probe_video


def _to_rational(seconds: float, fps: int = 30) -> str:
    frames = max(0, int(round(seconds * fps)))
    return f"{frames}/{fps}s"


def _file_uri(path: Path) -> str:
    resolved = path.resolve().as_posix()
    if not resolved.startswith("/"):
        resolved = "/" + resolved
    return "file://" + quote(resolved, safe="/:")


def export_davinci_fcpxml(draft: MatchDraft, fps: int = 30) -> Path:
    r"""
    Exports a DaVinci Resolve Free compatible FCPXML 1.9 timeline linked straight to the
    original high-res source videos on V:\ with dead air cut out and event markers placed.
    """
    match_folder = Path(draft.match_folder)
    out_dir = match_folder / "output"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{draft.context.match_id}_davinci.fcpxml"

    kept_events = [
        e for e in sorted(draft.events, key=lambda x: (x.half, x.video_time_sec))
        if e.keep_in_highlight and e.event_type != "halftime"
    ]

    fcpxml = ET.Element("fcpxml", version="1.9")
    resources = ET.SubElement(fcpxml, "resources")
    ET.SubElement(
        resources,
        "format",
        id="r1",
        name=f"FFVideoFormat1080p{fps}",
        frameDuration=f"1/{fps}s",
        width="1920",
        height="1080",
    )

    # Register each unique source video as an asset
    asset_ids: dict[str, str] = {}
    for ev in kept_events:
        rel = ev.source_video or (draft.config.primary_videos[0] if draft.config.primary_videos else "")
        if not rel or rel in asset_ids:
            continue
        src_path = match_folder / rel
        aid = f"a{len(asset_ids) + 1}"
        asset_ids[rel] = aid
        dur = probe_video(src_path).duration_sec if src_path.exists() else 3600.0
        ET.SubElement(
            resources,
            "asset",
            id=aid,
            name=src_path.name,
            src=_file_uri(src_path),
            start="0s",
            duration=_to_rational(dur, fps),
            hasVideo="1",
            hasAudio="1",
            format="r1",
        )

    library = ET.SubElement(fcpxml, "library")
    event_el = ET.SubElement(library, "event", name=f"Toasty FC - {draft.context.match_id}")
    project_name = f"{draft.context.date}_{draft.context.match_id}_vs_{draft.context.opponent}_Highlights"
    project = ET.SubElement(event_el, "project", name=project_name)

    total_dur = sum(max(1.0, e.clip_end_sec - e.clip_start_sec) for e in kept_events)
    sequence = ET.SubElement(
        project,
        "sequence",
        format="r1",
        duration=_to_rational(total_dur, fps),
        tcStart="0s",
        tcFormat="NDF",
    )
    spine = ET.SubElement(sequence, "spine")

    timeline_offset = 0.0
    for ev in kept_events:
        rel = ev.source_video or (draft.config.primary_videos[0] if draft.config.primary_videos else "")
        aid = asset_ids.get(rel)
        if not aid:
            continue
        clip_start = max(0.0, ev.clip_start_sec)
        clip_dur = max(1.0, ev.clip_end_sec - clip_start)
        clip_name = f"{ev.event_type.upper()} - {ev.player_name or ev.team.upper()}"

        asset_clip = ET.SubElement(
            spine,
            "asset-clip",
            name=clip_name,
            ref=aid,
            offset=_to_rational(timeline_offset, fps),
            start=_to_rational(clip_start, fps),
            duration=_to_rational(clip_dur, fps),
            format="r1",
            tcFormat="NDF",
        )

        # Marker inside the clip at the exact event moment
        marker_time = max(clip_start, ev.video_time_sec)
        marker_note = f"{ev.event_type.upper()} ({ev.team.upper()})"
        if ev.player_name:
            marker_note += f" - {ev.player_name}"
        if ev.assist_player_name:
            marker_note += f" (A: {ev.assist_player_name})"
        if ev.star_for_shorts:
            marker_note += " [SHORTS]"

        ET.SubElement(
            asset_clip,
            "marker",
            start=_to_rational(marker_time, fps),
            duration=f"1/{fps}s",
            value=marker_note,
            note=ev.notes or "",
        )
        timeline_offset += clip_dur

    ET.indent(fcpxml, space="  ")
    tree = ET.ElementTree(fcpxml)
    tree.write(out_path, encoding="utf-8", xml_declaration=True)
    return out_path
