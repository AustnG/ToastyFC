"""Command-line interface (`toasty-film`) for overnight batch analysis, Review UI, rendering, and benchmarking."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .analyzer import analyze_match_folder
from .benchmark import compare_draft_to_ground_truth, format_benchmark_report
from .config import (
    PipelineSettings,
    discover_match_folders,
    infer_match_id_from_folder,
    load_or_create_match_config,
)
from .fcpxml import export_davinci_fcpxml
from .models import MatchDraft
from .renderer import render_highlight_reel
from .sheets_client import SheetsClient


def cmd_analyze(args: argparse.Namespace, settings: PipelineSettings) -> int:
    target = Path(args.path)
    folders = [target] if ((target / "raw").is_dir() or (target / "match_config.json").exists()) else discover_match_folders(target)
    if not folders:
        print(f"No match folders found under {target}", file=sys.stderr)
        return 1

    sheets = SheetsClient(settings)
    for folder in folders:
        draft_file = folder / "draft_review.json"
        if draft_file.exists() and not args.force:
            print(f"[SKIP] {folder.name} already has draft_review.json (use --force to re-run)")
            continue
        cfg = load_or_create_match_config(folder, match_id=args.match_id)
        mid = args.match_id or cfg.match_id or infer_match_id_from_folder(folder)
        if not mid:
            print(f"[SKIP] Could not infer matchId for {folder}", file=sys.stderr)
            continue
        print(f"\n=== Analyzing {folder.name} ({mid}) ===")
        ctx = sheets.load_match_context(mid)
        draft = analyze_match_folder(folder, ctx, settings)
        flagged = sum(1 for e in draft.events if e.needs_review)
        print(
            f"Done: {len(draft.events)} events detected ({flagged} flagged for review). "
            f"Saved {folder / 'draft_review.json'}"
        )
        for w in draft.warnings:
            print(f"  WARN: {w}")
    return 0


def cmd_review(args: argparse.Namespace, settings: PipelineSettings) -> int:
    import uvicorn
    from .review_server import create_app

    extra = [Path(p) for p in (args.folders or [])]
    app = create_app(settings=settings, extra_folders=extra)
    port = args.port or settings.review_ui_port
    print(f"Opening Toasty FC Film Room Review UI at http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port)
    return 0


def cmd_render(args: argparse.Namespace, settings: PipelineSettings) -> int:
    folder = Path(args.folder)
    draft_path = folder / "draft_review.json"
    if not draft_path.exists():
        print(f"Missing {draft_path}. Run `toasty-film analyze` first.", file=sys.stderr)
        return 1
    draft = MatchDraft.model_validate_json(draft_path.read_text(encoding="utf-8"))
    mp4, chapters = render_highlight_reel(draft, settings)
    fcpxml = export_davinci_fcpxml(draft)
    print(f"Option A (1080p MP4):      {mp4}")
    print(f"YouTube Chapters:          {chapters}")
    print(f"Option B (DaVinci FCPXML): {fcpxml}")
    return 0


def cmd_benchmark(args: argparse.Namespace, settings: PipelineSettings) -> int:
    folder = Path(args.folder)
    draft_path = folder / "draft_review.json"
    if not draft_path.exists():
        print(f"Missing {draft_path}. Run `toasty-film analyze` first.", file=sys.stderr)
        return 1
    draft = MatchDraft.model_validate_json(draft_path.read_text(encoding="utf-8"))
    sheets = SheetsClient(settings)
    raw = sheets.read_tabs(["Matches", "MatchStats"])
    matches = sheets._rows_to_dicts(raw.get("Matches", []))
    mstats = sheets._rows_to_dicts(raw.get("MatchStats", []))

    mid = draft.context.match_id.lower()
    gt_match = next((m for m in matches if m.get("id", "").lower() == mid), None)
    if not gt_match:
        print(f"Ground-truth match {mid} not found in Sheets.", file=sys.stderr)
        return 1
    gt_players = [r for r in mstats if r.get("matchId", "").lower() == mid]

    report = compare_draft_to_ground_truth(draft, gt_match, gt_players)
    print(format_benchmark_report(report))
    if args.json_out:
        Path(args.json_out).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="toasty-film",
        description="Toasty FC local RTX 3070 AI video review, Review UI, and 1080p highlight pipeline.",
    )
    parser.add_argument("--env", type=Path, default=None, help="Path to .env file")
    sub = parser.add_subparsers(dest="command", required=True)

    p_an = sub.add_parser("analyze", help="Run unattended overnight AI pass on one match folder or NAS queue")
    p_an.add_argument("path", help="Match folder (or parent season folder on V:\\) to analyze")
    p_an.add_argument("--match-id", default=None, help="Explicit matchId (otherwise inferred from folder name)")
    p_an.add_argument("--force", action="store_true", help="Re-run even if draft_review.json exists")

    p_rev = sub.add_parser("review", help="Launch local browser Review UI on localhost")
    p_rev.add_argument("folders", nargs="*", help="Optional explicit match folder(s) to include")
    p_rev.add_argument("--port", type=int, default=None)

    p_ren = sub.add_parser("render", help="Render Option A 1080p MP4 + YouTube Chapters + Option B DaVinci FCPXML")
    p_ren.add_argument("folder", help="Match folder containing draft_review.json")

    p_bm = sub.add_parser("benchmark", help="Compare AI draft stats against hand-tracked Sheets ground truth")
    p_bm.add_argument("folder", help="Match folder containing draft_review.json")
    p_bm.add_argument("--json-out", default=None, help="Optional path to save benchmark JSON")

    args = parser.parse_args(argv)
    settings = PipelineSettings.load(args.env)

    if args.command == "analyze":
        return cmd_analyze(args, settings)
    if args.command == "review":
        return cmd_review(args, settings)
    if args.command == "render":
        return cmd_render(args, settings)
    if args.command == "benchmark":
        return cmd_benchmark(args, settings)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
