"""Canonical Pydantic models & deterministic stat aggregation for Toasty FC."""

from __future__ import annotations

from collections import defaultdict
from typing import Literal, Optional

from pydantic import BaseModel, Field

EventType = Literal[
    "goal",
    "own_goal",
    "shot_on_target",
    "shot_off_target",
    "save",
    "block",
    "foul",
    "yellow_card",
    "red_card",
    "corner",
    "highlight_chance",
    "halftime",
    "kickoff",
]

TeamSide = Literal["toasty", "opponent"]


class RosterPlayer(BaseModel):
    player_id: str
    name: str
    number: Optional[int] = None
    position: str = "Midfielder"
    is_captain: bool = False
    attended: bool = True


class MatchContext(BaseModel):
    match_id: str
    season_id: str = ""
    season_name: str = ""
    date: str = ""
    time: str = ""
    opponent: str = "Opponent"
    opponent_code: str = "OPP"
    opponent_color: str = "#3B82F6"
    toasty_code: str = "TOA"
    toasty_color: str = "#cabba2"
    match_type: str = "Season"
    location: str = ""
    toasty_score: Optional[int] = None
    opponent_score: Optional[int] = None
    own_goals_for: int = 0
    player_of_the_match: str = ""
    attendees: list[RosterPlayer] = Field(default_factory=list)


class MatchConfig(BaseModel):
    match_id: str
    camera_setup: Literal["veo", "mevo", "hybrid"] = "veo"
    primary_videos: list[str] = Field(default_factory=list)
    bonus_angles: list[str] = Field(default_factory=list)
    opponent_code: Optional[str] = None
    opponent_color: Optional[str] = None
    toasty_kit_override: Optional[str] = None  # e.g., "#ffffff" if white backup kit used
    notes: str = ""


class MatchEvent(BaseModel):
    event_id: str
    match_id: str
    source_video: str = ""  # relative path inside game folder (e.g. raw/veo.mp4)
    half: str = "1"
    video_time_sec: float = 0.0
    clip_start_sec: float = 0.0
    clip_end_sec: float = 0.0
    match_minute: Optional[int] = None
    event_type: EventType = "highlight_chance"
    team: TeamSide = "toasty"
    player_id: Optional[str] = None
    player_name: Optional[str] = None
    assist_player_id: Optional[str] = None
    assist_player_name: Optional[str] = None
    on_court_ids: list[str] = Field(default_factory=list)
    keep_in_highlight: bool = True
    star_for_shorts: bool = False
    confidence: float = 0.75
    needs_review: bool = True
    review_reason: str = ""
    verified: bool = False
    notes: str = ""


class TeamStatTotals(BaseModel):
    goals: int = 0
    shots_off_target: int = 0
    shots_on_target: int = 0
    blocks: int = 0
    fouls: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    saves: int = 0
    corners: int = 0

    @property
    def total_shots(self) -> int:
        return self.shots_off_target + self.shots_on_target


class PlayerStatRow(BaseModel):
    match_id: str
    player_id: str
    player_name: str
    goals: int = 0
    assists: int = 0
    shots_off_target: int = 0
    shots_on_target: int = 0
    blocks: int = 0
    plus_minus: int = 0
    fouls: int = 0
    yellows: int = 0
    reds: int = 0
    potm: bool = False
    saves: int = 0
    goals_allowed: int = 0
    clean_sheet: bool = False

    @property
    def total_shots(self) -> int:
        return self.shots_off_target + self.shots_on_target


class MatchDraft(BaseModel):
    schema_version: int = 1
    match_folder: str
    context: MatchContext
    config: MatchConfig
    events: list[MatchEvent] = Field(default_factory=list)
    team_stats_toasty: TeamStatTotals = Field(default_factory=TeamStatTotals)
    team_stats_opponent: TeamStatTotals = Field(default_factory=TeamStatTotals)
    player_stats: list[PlayerStatRow] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    status: Literal["analyzed", "approved", "rendered"] = "analyzed"


def format_timestamp(seconds: float) -> str:
    sec = max(0, int(round(seconds)))
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def default_opponent_code(opponent: str) -> str:
    cleaned = "".join(ch for ch in opponent.upper() if ch.isalnum() or ch.isspace()).strip()
    words = [w for w in cleaned.split() if w not in {"FC", "SC", "CF", "AC", "THE"}]
    if not words:
        words = cleaned.split() or ["OPP"]
    if len(words) == 1:
        return words[0][:3].ljust(3, "X")
    if len(words) == 2:
        return (words[0][:2] + words[1][:1])[:3]
    return "".join(w[0] for w in words[:3])


def aggregate_match_stats(
    context: MatchContext,
    events: list[MatchEvent],
    confidence_threshold: float = 0.95,
) -> tuple[TeamStatTotals, TeamStatTotals, list[PlayerStatRow], list[str]]:
    """
    Deterministically computes:
      1. Both teams' 9 team-level stat categories (Matches + Outro Stat Card)
      2. Toasty FC player-level stats (including exact plusMinus from goal on_court_ids)
      3. Consistency warnings & per-event review flags
    """
    toasty = TeamStatTotals()
    opp = TeamStatTotals()

    player_lookup = {p.player_id: p for p in context.attendees}
    gk_ids = [
        p.player_id
        for p in context.attendees
        if "goalkeeper" in p.position.lower() or p.position.lower() == "gk"
    ]

    p_rows: dict[str, PlayerStatRow] = {
        p.player_id: PlayerStatRow(
            match_id=context.match_id,
            player_id=p.player_id,
            player_name=p.name,
            potm=(context.player_of_the_match.strip().lower() == p.name.strip().lower()),
        )
        for p in context.attendees
    }

    def ensure_player(pid: Optional[str], pname: Optional[str] = None) -> Optional[PlayerStatRow]:
        if not pid:
            return None
        if pid not in p_rows:
            resolved_name = pname or (player_lookup[pid].name if pid in player_lookup else pid)
            p_rows[pid] = PlayerStatRow(
                match_id=context.match_id,
                player_id=pid,
                player_name=resolved_name,
            )
        return p_rows[pid]

    for ev in events:
        reasons: list[str] = []
        if ev.event_type in ("goal", "own_goal"):
            reasons.append("Goal event (confirm scorer, assist & 5 on-court +/-)")
        if ev.confidence < confidence_threshold:
            reasons.append(f"AI confidence {int(ev.confidence * 100)}% < {int(confidence_threshold * 100)}%")

        side = toasty if ev.team == "toasty" else opp

        if ev.event_type == "goal":
            side.goals += 1
            side.shots_on_target += 1
            if ev.team == "toasty":
                scorer = ensure_player(ev.player_id, ev.player_name)
                if scorer:
                    scorer.goals += 1
                    scorer.shots_on_target += 1
                else:
                    reasons.append("Missing Toasty scorer player_id")
                if ev.assist_player_id:
                    assister = ensure_player(ev.assist_player_id, ev.assist_player_name)
                    if assister:
                        assister.assists += 1
                for pid in ev.on_court_ids:
                    row = ensure_player(pid)
                    if row:
                        row.plus_minus += 1
            else:
                # Opponent scored -> -1 for Toasty players on court, +1 goalsAllowed for Toasty GK
                for pid in ev.on_court_ids:
                    row = ensure_player(pid)
                    if row:
                        row.plus_minus -= 1
                gk_on = [pid for pid in ev.on_court_ids if pid in gk_ids]
                target_gk = gk_on[0] if gk_on else (gk_ids[0] if len(gk_ids) == 1 else None)
                if target_gk:
                    gk_row = ensure_player(target_gk)
                    if gk_row:
                        gk_row.goals_allowed += 1

        elif ev.event_type == "own_goal":
            # team = benefiting team
            side.goals += 1
            if ev.team == "toasty":
                for pid in ev.on_court_ids:
                    row = ensure_player(pid)
                    if row:
                        row.plus_minus += 1
            else:
                for pid in ev.on_court_ids:
                    row = ensure_player(pid)
                    if row:
                        row.plus_minus -= 1
                gk_on = [pid for pid in ev.on_court_ids if pid in gk_ids]
                target_gk = gk_on[0] if gk_on else (gk_ids[0] if len(gk_ids) == 1 else None)
                if target_gk:
                    gk_row = ensure_player(target_gk)
                    if gk_row:
                        gk_row.goals_allowed += 1

        elif ev.event_type == "shot_on_target":
            side.shots_on_target += 1
            if ev.team == "toasty":
                p = ensure_player(ev.player_id, ev.player_name)
                if p:
                    p.shots_on_target += 1

        elif ev.event_type == "shot_off_target":
            side.shots_off_target += 1
            if ev.team == "toasty":
                p = ensure_player(ev.player_id, ev.player_name)
                if p:
                    p.shots_off_target += 1

        elif ev.event_type == "save":
            side.saves += 1
            if ev.team == "toasty":
                pid = ev.player_id or (gk_ids[0] if len(gk_ids) == 1 else None)
                p = ensure_player(pid, ev.player_name)
                if p:
                    p.saves += 1

        elif ev.event_type == "block":
            side.blocks += 1
            if ev.team == "toasty":
                p = ensure_player(ev.player_id, ev.player_name)
                if p:
                    p.blocks += 1

        elif ev.event_type == "foul":
            side.fouls += 1
            if ev.team == "toasty":
                p = ensure_player(ev.player_id, ev.player_name)
                if p:
                    p.fouls += 1

        elif ev.event_type == "yellow_card":
            side.yellow_cards += 1
            if ev.team == "toasty":
                p = ensure_player(ev.player_id, ev.player_name)
                if p:
                    p.yellows += 1

        elif ev.event_type == "red_card":
            side.red_cards += 1
            if ev.team == "toasty":
                p = ensure_player(ev.player_id, ev.player_name)
                if p:
                    p.reds += 1

        elif ev.event_type == "corner":
            side.corners += 1

        if not ev.verified:
            ev.needs_review = len(reasons) > 0
            ev.review_reason = "; ".join(reasons)
        else:
            ev.needs_review = False
            ev.review_reason = ""

    # Clean sheet for GK if opponent scored 0
    final_opp_goals = context.opponent_score if context.opponent_score is not None else opp.goals
    if final_opp_goals == 0:
        for gk_id in gk_ids:
            if gk_id in p_rows:
                p_rows[gk_id].clean_sheet = True

    # Built-in math cross-checks
    warnings: list[str] = []
    if context.toasty_score is not None and toasty.goals != context.toasty_score:
        warnings.append(
            f"Toasty goals mismatch: detected {toasty.goals} vs sheet score {context.toasty_score}"
        )
    if context.opponent_score is not None and opp.goals != context.opponent_score:
        warnings.append(
            f"Opponent goals mismatch: detected {opp.goals} vs sheet score {context.opponent_score}"
        )
    if opp.shots_on_target != (opp.goals + toasty.saves):
        warnings.append(
            f"Opponent SOT cross-check: opp.shotsOnTarget ({opp.shots_on_target}) != opp.goals ({opp.goals}) + toasty.saves ({toasty.saves})"
        )
    if toasty.shots_on_target != (toasty.goals + opp.saves):
        warnings.append(
            f"Toasty SOT cross-check: toasty.shotsOnTarget ({toasty.shots_on_target}) != toasty.goals ({toasty.goals}) + opp.saves ({opp.saves})"
        )

    return toasty, opp, list(p_rows.values()), warnings
