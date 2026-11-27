"""Google Sheets client for reading match context and writing human-approved stats."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any, Optional

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from .config import PipelineSettings
from .models import (
    MatchContext,
    MatchDraft,
    RosterPlayer,
    default_opponent_code,
    format_timestamp,
)

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


class SheetsClient:
    def __init__(self, settings: PipelineSettings):
        self.settings = settings
        self.spreadsheet_id = settings.spreadsheet_id
        self._creds = None

    def _get_token(self) -> str:
        sa_path = self.settings.service_account_json_path
        if not sa_path or not Path(sa_path).exists():
            raise RuntimeError(
                "GOOGLE_SERVICE_ACCOUNT_JSON_PATH is not set or file not found. "
                "Set it in video-pipeline/.env to connect to your private Google Sheet."
            )
        if self._creds is None:
            self._creds = service_account.Credentials.from_service_account_file(
                sa_path, scopes=SCOPES
            )
        if not self._creds.valid:
            self._creds.refresh(Request())
        return self._creds.token

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._get_token()}",
            "Content-Type": "application/json",
        }

    def read_tabs(self, tabs: list[str], use_cli_fallback: bool = True) -> dict[str, list[list[str]]]:
        """Reads unbounded tab ranges via Service Account API (or local gsheets CLI if configured)."""
        if self.settings.service_account_json_path and Path(self.settings.service_account_json_path).exists():
            ranges = [f"'{t}'!A:AZ" for t in tabs]
            params = [("ranges", r) for r in ranges] + [("valueRenderOption", "FORMATTED_VALUE")]
            url = f"https://sheets.googleapis.com/v4/spreadsheets/{self.spreadsheet_id}/values:batchGet"
            res = requests.get(url, headers=self._headers(), params=params, timeout=30)
            res.raise_for_status()
            payload = res.json()
            return {
                tabs[i]: vr.get("values", [])
                for i, vr in enumerate(payload.get("valueRanges", []))
            }

        if use_cli_fallback:
            out: dict[str, list[list[str]]] = {}
            for t in tabs:
                raw = subprocess.check_output(
                    ["gsheets", "readonly", "read", self.spreadsheet_id, f"'{t}'!A1:AZ2000", "--json"],
                    text=True,
                )
                out[t] = json.loads(raw)
            return out

        raise RuntimeError("No Google Sheets credentials available.")

    @staticmethod
    def _rows_to_dicts(rows: list[list[str]]) -> list[dict[str, str]]:
        if not rows or len(rows) <= 1:
            return []
        headers = [str(h).strip() for h in rows[0]]
        records: list[dict[str, str]] = []
        for idx, r in enumerate(rows[1:], start=2):
            if not any(str(c).strip() for c in r):
                continue
            d = {headers[i]: (str(r[i]).strip() if i < len(r) else "") for i in range(len(headers)) if headers[i]}
            d["_row"] = str(idx)
            records.append(d)
        return records

    def load_match_context(self, match_id: str) -> MatchContext:
        """Pulls match metadata, final score, opponent color, and exact attendee roster from Sheets."""
        raw = self.read_tabs(["Matches", "Roster", "MatchStats", "Players"])
        matches = self._rows_to_dicts(raw.get("Matches", []))
        roster = self._rows_to_dicts(raw.get("Roster", []))
        mstats = self._rows_to_dicts(raw.get("MatchStats", []))
        players = self._rows_to_dicts(raw.get("Players", []))

        match_row = next((m for m in matches if m.get("id", "").lower() == match_id.lower()), None)
        if not match_row:
            raise ValueError(f"Match '{match_id}' not found in Matches tab.")

        season_id = match_row.get("seasonId", "")
        player_names = {p.get("id", ""): p.get("name", "") for p in players if p.get("id")}

        # Map season roster entries
        season_roster: dict[str, RosterPlayer] = {}
        for r in roster:
            if r.get("seasonId") != season_id or not r.get("playerId"):
                continue
            pid = r["playerId"]
            num_str = r.get("number", "")
            num = int(num_str) if num_str.isdigit() else None
            season_roster[pid] = RosterPlayer(
                player_id=pid,
                name=r.get("playerName") or player_names.get(pid, pid),
                number=num,
                position=r.get("position") or "Midfielder",
                is_captain=r.get("isCaptain", "").lower() == "true",
                attended=False,
            )

        # Narrow to logged attendees on MatchStats if present
        logged_attendees = [
            s.get("playerId", "") for s in mstats if s.get("matchId", "").lower() == match_id.lower() and s.get("playerId")
        ]
        attendees: list[RosterPlayer] = []
        if logged_attendees:
            for pid in dict.fromkeys(logged_attendees):
                if pid in season_roster:
                    rp = season_roster[pid].model_copy(update={"attended": True})
                    attendees.append(rp)
                else:
                    attendees.append(
                        RosterPlayer(
                            player_id=pid,
                            name=player_names.get(pid, pid),
                            attended=True,
                        )
                    )
        else:
            # Fallback to full season roster if attendance wasn't pre-logged
            attendees = [rp.model_copy(update={"attended": True}) for rp in season_roster.values()]

        def parse_int(v: str) -> Optional[int]:
            try:
                return int(float(v)) if v != "" else None
            except ValueError:
                return None

        opp = match_row.get("opponent") or "Opponent"
        return MatchContext(
            match_id=match_row["id"],
            season_id=season_id,
            season_name=match_row.get("seasonName", ""),
            date=match_row.get("date", ""),
            time=match_row.get("time", ""),
            opponent=opp,
            opponent_code=default_opponent_code(opp),
            opponent_color=match_row.get("opponentColor") or "#3B82F6",
            toasty_code=self.settings.toasty_shorthand,
            toasty_color=self.settings.toasty_kit_color,
            match_type=match_row.get("type") or "Season",
            location=match_row.get("location", ""),
            toasty_score=parse_int(match_row.get("toastyScore", "")),
            opponent_score=parse_int(match_row.get("opponentScore", "")),
            own_goals_for=parse_int(match_row.get("ownGoalsFor", "")) or 0,
            player_of_the_match=match_row.get("playerOfTheMatch", ""),
            attendees=attendees,
        )

    def build_approval_updates(self, draft: MatchDraft) -> dict[str, Any]:
        """
        Builds exact Google Sheets batch updates (never touching ARRAYFORMULA columns B/D in MatchStats).
        Returns a preview dict suitable for dry-run inspection or live execution.
        """
        raw = self.read_tabs(["Matches", "MatchStats", "MatchEvents"])
        matches = self._rows_to_dicts(raw.get("Matches", []))
        mstats = self._rows_to_dicts(raw.get("MatchStats", []))
        mevents = self._rows_to_dicts(raw.get("MatchEvents", []))

        match_id = draft.context.match_id
        match_row = next((m for m in matches if m.get("id", "").lower() == match_id.lower()), None)
        if not match_row:
            raise ValueError(f"Match {match_id} not found in Matches tab.")
        m_row_num = int(match_row["_row"])

        t = draft.team_stats_toasty
        o = draft.team_stats_opponent

        # Matches cols T..AK (18 cols): toasty 9 stats + opponent 9 stats, plus AL (statsStatus)
        team_stat_values = [
            t.goals, t.shots_off_target, t.shots_on_target, t.blocks, t.fouls,
            t.yellow_cards, t.red_cards, t.saves, t.corners,
            o.goals, o.shots_off_target, o.shots_on_target, o.blocks, o.fouls,
            o.yellow_cards, o.red_cards, o.saves, o.corners,
        ]

        updates: list[dict[str, Any]] = [
            {"range": f"'Matches'!T{m_row_num}:AK{m_row_num}", "values": [team_stat_values]},
            {"range": f"'Matches'!AL{m_row_num}", "values": [["Full Stats"]]},
        ]
        if draft.context.player_of_the_match:
            updates.append(
                {"range": f"'Matches'!R{m_row_num}", "values": [[draft.context.player_of_the_match]]}
            )

        # MatchStats: update existing rows in cols E..Q (leaving col A/C and ARRAYFORMULA cols B/D untouched)
        existing_ms = {
            (r.get("matchId", "").lower(), r.get("playerId", "")): int(r["_row"])
            for r in mstats
        }
        next_ms_row = max([int(r["_row"]) for r in mstats], default=1) + 1

        for ps in draft.player_stats:
            stat_cells = [
                ps.goals,
                ps.assists,
                ps.shots_off_target,
                ps.shots_on_target,
                ps.blocks,
                ps.plus_minus,
                ps.fouls,
                ps.yellows,
                ps.reds,
                "TRUE" if ps.potm else "FALSE",
                ps.saves if ps.saves else "",
                ps.goals_allowed if ps.goals_allowed else "",
                "TRUE" if ps.clean_sheet else "",
            ]
            key = (match_id.lower(), ps.player_id)
            if key in existing_ms:
                row_num = existing_ms[key]
                updates.append({"range": f"'MatchStats'!E{row_num}:Q{row_num}", "values": [stat_cells]})
            else:
                # Write cols A, C, and E..Q separately so B & D ARRAYFORMULAs remain intact!
                updates.append({"range": f"'MatchStats'!A{next_ms_row}", "values": [[match_id]]})
                updates.append({"range": f"'MatchStats'!C{next_ms_row}", "values": [[ps.player_id]]})
                updates.append({"range": f"'MatchStats'!E{next_ms_row}:Q{next_ms_row}", "values": [stat_cells]})
                next_ms_row += 1

        # MatchEvents: append verified events not already present by eventId
        existing_event_ids = {r.get("eventId", "") for r in mevents}
        new_event_rows: list[list[Any]] = []
        for ev in draft.events:
            if not ev.verified or ev.event_id in existing_event_ids:
                continue
            new_event_rows.append([
                ev.event_id,
                match_id,
                ev.half,
                format_timestamp(ev.video_time_sec),
                ev.match_minute if ev.match_minute is not None else "",
                ev.event_type,
                ev.team,
                ev.player_id or "",
                ev.assist_player_id or "",
                ",".join(ev.on_court_ids),
                "TRUE" if ev.keep_in_highlight else "FALSE",
                "TRUE" if ev.star_for_shorts else "FALSE",
                round(ev.confidence, 2),
                "TRUE",
                ev.notes,
            ])

        next_ev_row = max([int(r["_row"]) for r in mevents], default=1) + 1
        if new_event_rows:
            updates.append({
                "range": f"'MatchEvents'!A{next_ev_row}:O{next_ev_row + len(new_event_rows) - 1}",
                "values": new_event_rows,
            })

        return {
            "match_id": match_id,
            "matches_row": m_row_num,
            "player_rows_count": len(draft.player_stats),
            "new_events_count": len(new_event_rows),
            "updates": updates,
        }

    def push_approved_draft(self, draft: MatchDraft, dry_run: bool = False) -> dict[str, Any]:
        """Writes human-verified stats & events to Google Sheets (or returns dry-run preview)."""
        plan = self.build_approval_updates(draft)
        if dry_run:
            return {"dry_run": True, **plan}

        url = f"https://sheets.googleapis.com/v4/spreadsheets/{self.spreadsheet_id}/values:batchUpdate"
        res = requests.post(
            url,
            headers=self._headers(),
            json={"valueInputOption": "USER_ENTERED", "data": plan["updates"]},
            timeout=30,
        )
        res.raise_for_status()
        return {"dry_run": False, "api_response": res.json(), **plan}
