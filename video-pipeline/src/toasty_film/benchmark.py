"""Benchmark harness comparing AI draft stats against hand-tracked Google Sheets ground truth."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .models import MatchDraft, TeamStatTotals


@dataclass
class BenchmarkMetric:
    name: str
    ai_value: int
    ground_truth: int

    @property
    def delta(self) -> int:
        return self.ai_value - self.ground_truth

    @property
    def exact_match(self) -> bool:
        return self.ai_value == self.ground_truth


def _to_int(v: Any) -> int:
    if v is None or str(v).strip() == "":
        return 0
    try:
        return int(float(v))
    except (ValueError, TypeError):
        return 0


def compare_draft_to_ground_truth(
    draft: MatchDraft,
    ground_truth_match_row: dict[str, str],
    ground_truth_player_rows: list[dict[str, str]],
) -> dict[str, Any]:
    """Computes team-level (both teams) and Toasty player-level accuracy vs. hand-tracked stats."""
    gt_toasty = TeamStatTotals(
        goals=_to_int(ground_truth_match_row.get("toastyScore")),
        shots_off_target=_to_int(
            ground_truth_match_row.get("stats_shotsOffTarget_toasty")
            or ground_truth_match_row.get("stats_shots_toasty")
        ),
        shots_on_target=_to_int(ground_truth_match_row.get("stats_shotsOnTarget_toasty")),
        blocks=_to_int(ground_truth_match_row.get("stats_blocks_toasty")),
        fouls=_to_int(ground_truth_match_row.get("stats_fouls_toasty")),
        yellow_cards=_to_int(ground_truth_match_row.get("stats_yellowCards_toasty")),
        red_cards=_to_int(ground_truth_match_row.get("stats_redCards_toasty")),
        saves=_to_int(ground_truth_match_row.get("stats_saves_toasty")),
        corners=_to_int(ground_truth_match_row.get("stats_corners_toasty")),
    )
    gt_opp = TeamStatTotals(
        goals=_to_int(ground_truth_match_row.get("opponentScore")),
        shots_off_target=_to_int(
            ground_truth_match_row.get("stats_shotsOffTarget_opponent")
            or ground_truth_match_row.get("stats_shots_opponent")
        ),
        shots_on_target=_to_int(ground_truth_match_row.get("stats_shotsOnTarget_opponent")),
        blocks=_to_int(ground_truth_match_row.get("stats_blocks_opponent")),
        fouls=_to_int(ground_truth_match_row.get("stats_fouls_opponent")),
        yellow_cards=_to_int(ground_truth_match_row.get("stats_yellowCards_opponent")),
        red_cards=_to_int(ground_truth_match_row.get("stats_redCards_opponent")),
        saves=_to_int(ground_truth_match_row.get("stats_saves_opponent")),
        corners=_to_int(ground_truth_match_row.get("stats_corners_opponent")),
    )

    fields = [
        "goals",
        "shots_off_target",
        "shots_on_target",
        "blocks",
        "fouls",
        "yellow_cards",
        "red_cards",
        "saves",
        "corners",
    ]
    team_metrics: list[dict[str, Any]] = []
    for side_label, ai_t, gt_t in [
        ("toasty", draft.team_stats_toasty, gt_toasty),
        ("opponent", draft.team_stats_opponent, gt_opp),
    ]:
        for f in fields:
            m = BenchmarkMetric(f"{side_label}.{f}", getattr(ai_t, f), getattr(gt_t, f))
            team_metrics.append(
                {
                    "metric": m.name,
                    "ai": m.ai_value,
                    "ground_truth": m.ground_truth,
                    "delta": m.delta,
                    "exact": m.exact_match,
                }
            )

    ai_by_pid = {p.player_id: p for p in draft.player_stats}
    player_diffs: list[dict[str, Any]] = []
    for gt_p in ground_truth_player_rows:
        pid = gt_p.get("playerId", "")
        if not pid:
            continue
        ai_p = ai_by_pid.get(pid)
        gt_goals = _to_int(gt_p.get("goals"))
        gt_assists = _to_int(gt_p.get("assists"))
        gt_saves = _to_int(gt_p.get("saves"))
        ai_goals = ai_p.goals if ai_p else 0
        ai_assists = ai_p.assists if ai_p else 0
        ai_saves = ai_p.saves if ai_p else 0
        player_diffs.append(
            {
                "player_id": pid,
                "player_name": gt_p.get("playerName", pid),
                "goals": {"ai": ai_goals, "gt": gt_goals, "delta": ai_goals - gt_goals},
                "assists": {"ai": ai_assists, "gt": gt_assists, "delta": ai_assists - gt_assists},
                "saves": {"ai": ai_saves, "gt": gt_saves, "delta": ai_saves - gt_saves},
            }
        )

    flagged = sum(1 for e in draft.events if e.needs_review)
    exact_team_count = sum(1 for m in team_metrics if m["exact"])

    return {
        "match_id": draft.context.match_id,
        "total_events_detected": len(draft.events),
        "events_flagged_for_review": flagged,
        "team_exact_matches": f"{exact_team_count}/{len(team_metrics)}",
        "team_metrics": team_metrics,
        "player_diffs": player_diffs,
    }


def format_benchmark_report(report: dict[str, Any]) -> str:
    lines = [
        f"=== Toasty FC AI Benchmark Report: {report['match_id']} ===",
        f"Events detected: {report['total_events_detected']} (flagged for human review: {report['events_flagged_for_review']})",
        f"Team exact matches (both squads): {report['team_exact_matches']}",
        "",
        "Team Comparison (AI vs Hand-Tracked Ground Truth):",
    ]
    for m in report["team_metrics"]:
        mark = "OK" if m["exact"] else f"DELTA {m['delta']:+d}"
        lines.append(f"  {m['metric']:<28} AI={m['ai']:>2}  GT={m['ground_truth']:>2}  [{mark}]")

    lines.append("\nPlayer Attribution (Toasty FC):")
    for p in report["player_diffs"]:
        g, a, s = p["goals"], p["assists"], p["saves"]
        lines.append(
            f"  {p['player_name']:<20} G: {g['ai']}/{g['gt']} ({g['delta']:+d})  "
            f"A: {a['ai']}/{a['gt']} ({a['delta']:+d})  Sv: {s['ai']}/{s['gt']} ({s['delta']:+d})"
        )
    return "\n".join(lines)
