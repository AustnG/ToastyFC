"""Local feedback & calibration loop so AI accuracy improves after each reviewed match."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_RULES = [
    "Toasty FC wears #cabba2 (tan/beige) primary jerseys (occasional white backup shirt).",
    "shotsOffTarget means shots that miss the goal frame; shotsOnTarget includes goals and keeper saves.",
    "Track team-level stats for BOTH Toasty FC and the Opponent; track player-level stats for Toasty FC players ONLY.",
    "In indoor futsal (F.O. Moxley gym), wall/board rebounds remain live play unless the referee blows the whistle.",
]


class CalibrationStore:
    def __init__(self, calibration_dir: Path):
        self.calibration_dir = calibration_dir
        self.log_path = calibration_dir / "calibration_log.json"
        self.refs_dir = calibration_dir / "player_refs"
        self.calibration_dir.mkdir(parents=True, exist_ok=True)
        self.refs_dir.mkdir(parents=True, exist_ok=True)

    def load(self) -> dict[str, Any]:
        if not self.log_path.exists():
            data = {
                "version": 1,
                "rules": list(DEFAULT_RULES),
                "corrections": [],
                "confidence_threshold": 0.95,
            }
            self.save(data)
            return data
        return json.loads(self.log_path.read_text(encoding="utf-8"))

    def save(self, data: dict[str, Any]) -> None:
        self.log_path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    def add_rule(self, rule: str) -> None:
        rule = rule.strip()
        if not rule:
            return
        data = self.load()
        if rule not in data["rules"]:
            data["rules"].append(rule)
            self.save(data)

    def record_correction(
        self,
        match_id: str,
        event_id: str,
        field: str,
        ai_value: Any,
        human_value: Any,
        ai_confidence: float,
        note: str = "",
    ) -> None:
        if ai_value == human_value:
            return
        data = self.load()
        data["corrections"].append(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "match_id": match_id,
                "event_id": event_id,
                "field": field,
                "ai_value": ai_value,
                "human_value": human_value,
                "ai_confidence": round(ai_confidence, 3),
                "note": note,
            }
        )
        # Keep most recent 500 corrections
        data["corrections"] = data["corrections"][-500:]
        self.save(data)

    def format_prompt_guidance(self, max_recent_corrections: int = 12) -> str:
        """Formats accumulated club rules and recent human corrections into prompt guidance."""
        data = self.load()
        lines = ["CLUB-SPECIFIC RULES & LEARNED CALIBRATION:"]
        for r in data.get("rules", []):
            lines.append(f"- {r}")

        recent = data.get("corrections", [])[-max_recent_corrections:]
        if recent:
            lines.append("\nRECENT HUMAN CORRECTIONS TO AVOID REPEATING:")
            for c in recent:
                extra = f" ({c['note']})" if c.get("note") else ""
                lines.append(
                    f"- [{c['match_id']}] {c['field']}: AI guessed '{c['ai_value']}', "
                    f"human corrected to '{c['human_value']}'{extra}"
                )
        return "\n".join(lines)

    def get_player_reference_images(self, player_ids: list[str]) -> list[tuple[str, Path]]:
        """Returns any saved visual reference crop images for attending players."""
        found: list[tuple[str, Path]] = []
        for pid in player_ids:
            for ext in (".jpg", ".jpeg", ".png", ".webp"):
                matches = sorted(self.refs_dir.glob(f"{pid}*{ext}"))
                if matches:
                    found.append((pid, matches[0]))
                    break
        return found
