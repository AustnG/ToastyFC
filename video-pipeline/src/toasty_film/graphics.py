"""Programmatic 1080p broadcast graphics (Intro, Live Scoreboard Bug, Halftime, Outro Stat Card)."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from PIL import Image, ImageDraw, ImageFont

from .models import MatchDraft, format_timestamp

OBSIDIAN = (13, 13, 15, 255)
OBSIDIAN_CARD = (24, 24, 28, 242)
TOASTY_TAN = (202, 187, 162, 255)  # #cabba2
TOASTY_RED = (185, 28, 28, 255)    # #b91c1c
WHITE = (255, 255, 255, 255)
MUTED = (161, 161, 170, 255)
BORDER = (52, 52, 60, 255)

NAMED_COLORS = {
    "red": "#DC2626",
    "blue": "#2563EB",
    "navy": "#1E3A8A",
    "green": "#16A34A",
    "yellow": "#EAB308",
    "gold": "#CA8A04",
    "orange": "#EA580C",
    "purple": "#7C3AED",
    "black": "#18181B",
    "white": "#F4F4F5",
    "gray": "#71717A",
    "grey": "#71717A",
    "pink": "#DB2777",
    "teal": "#0D9488",
    "tan": "#cabba2",
}


def parse_hex_rgba(color_str: Optional[str], fallback: str = "#3B82F6") -> tuple[int, int, int, int]:
    raw = (color_str or "").strip().lower()
    if raw in NAMED_COLORS:
        raw = NAMED_COLORS[raw]
    if not raw.startswith("#"):
        raw = fallback
    hex_val = raw.lstrip("#")
    if len(hex_val) == 3:
        hex_val = "".join(c * 2 for c in hex_val)
    if len(hex_val) != 6:
        hex_val = fallback.lstrip("#")
    try:
        return (int(hex_val[0:2], 16), int(hex_val[2:4], 16), int(hex_val[4:6], 16), 255)
    except ValueError:
        return (59, 130, 246, 255)


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        [
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/segoeuib.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        ]
        if bold
        else [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def render_scoreboard_bug(
    out_path: Path,
    toasty_code: str,
    toasty_color: str,
    toasty_score: int,
    opp_code: str,
    opp_color: str,
    opp_score: int,
    half_label: str = "1ST",
) -> Path:
    """Renders a transparent 1920x1080 overlay with top-left broadcast scoreboard bug."""
    img = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Top-left pill coordinates
    x0, y0, w, h = 48, 38, 420, 62
    draw.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=10, fill=OBSIDIAN_CARD, outline=BORDER, width=2)

    f_code = _load_font(26, bold=True)
    f_score = _load_font(32, bold=True)
    f_half = _load_font(18, bold=True)

    # Half badge on left
    draw.rounded_rectangle([x0 + 8, y0 + 10, x0 + 78, y0 + h - 10], radius=6, fill=TOASTY_RED)
    draw.text((x0 + 43, y0 + h // 2), half_label, fill=WHITE, font=f_half, anchor="mm")

    # Toasty side: jersey color bar + TOA + score
    toa_rgba = parse_hex_rgba(toasty_color, "#cabba2")
    draw.rounded_rectangle([x0 + 92, y0 + 12, x0 + 104, y0 + h - 12], radius=3, fill=toa_rgba)
    draw.text((x0 + 116, y0 + h // 2), toasty_code.upper()[:3], fill=WHITE, font=f_code, anchor="lm")
    draw.text((x0 + 218, y0 + h // 2), str(toasty_score), fill=TOASTY_TAN, font=f_score, anchor="mm")

    # Divider dash
    draw.text((x0 + 245, y0 + h // 2), "-", fill=MUTED, font=f_score, anchor="mm")

    # Opponent side: score + OPP + jersey color bar
    opp_rgba = parse_hex_rgba(opp_color, "#3B82F6")
    draw.text((x0 + 272, y0 + h // 2), str(opp_score), fill=WHITE, font=f_score, anchor="mm")
    draw.text((x0 + 382, y0 + h // 2), opp_code.upper()[:3], fill=WHITE, font=f_code, anchor="rm")
    draw.rounded_rectangle([x0 + 394, y0 + 12, x0 + 406, y0 + h - 12], radius=3, fill=opp_rgba)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG")
    return out_path


def render_intro_plate(draft: MatchDraft, out_path: Path) -> Path:
    """Renders a 1920x1080 matchday intro plate (Toasty FC vs Opponent)."""
    img = Image.new("RGBA", (1920, 1080), OBSIDIAN)
    draw = ImageDraw.Draw(img)
    ctx = draft.context

    # Top & bottom accent bars
    draw.rectangle([0, 0, 1920, 14], fill=TOASTY_RED)
    draw.rectangle([0, 1066, 1920, 1080], fill=TOASTY_TAN)

    f_sub = _load_font(28, bold=True)
    f_team = _load_font(76, bold=True)
    f_vs = _load_font(44, bold=True)
    f_meta = _load_font(30, bold=False)

    header = f"{ctx.season_name or 'TOASTY FC MATCHDAY'}  ·  {ctx.match_type.upper()}"
    draw.text((960, 210), header, fill=TOASTY_TAN, font=f_sub, anchor="mm")

    # Home card (Toasty FC)
    toa_rgba = parse_hex_rgba(ctx.toasty_color, "#cabba2")
    draw.rounded_rectangle([160, 340, 840, 680], radius=20, fill=OBSIDIAN_CARD, outline=BORDER, width=3)
    draw.rectangle([160, 340, 184, 680], fill=toa_rgba)
    draw.text((510, 480), "TOASTY FC", fill=WHITE, font=f_team, anchor="mm")
    draw.text((510, 565), f"HOME  ·  {ctx.toasty_code.upper()}", fill=TOASTY_TAN, font=f_sub, anchor="mm")

    # VS badge
    draw.rounded_rectangle([890, 465, 1030, 555], radius=16, fill=TOASTY_RED)
    draw.text((960, 510), "VS", fill=WHITE, font=f_vs, anchor="mm")

    # Away card (Opponent)
    opp_rgba = parse_hex_rgba(ctx.opponent_color, "#3B82F6")
    draw.rounded_rectangle([1080, 340, 1760, 680], radius=20, fill=OBSIDIAN_CARD, outline=BORDER, width=3)
    draw.rectangle([1736, 340, 1760, 680], fill=opp_rgba)
    opp_name = ctx.opponent.upper()
    opp_font = _load_font(56 if len(opp_name) > 13 else 72, bold=True)
    draw.text((1410, 480), opp_name, fill=WHITE, font=opp_font, anchor="mm")
    draw.text((1410, 565), f"AWAY  ·  {ctx.opponent_code.upper()}", fill=MUTED, font=f_sub, anchor="mm")

    footer = "  ·  ".join([x for x in [ctx.date, ctx.location, "ToastyFC.com"] if x])
    draw.text((960, 860), footer, fill=MUTED, font=f_meta, anchor="mm")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_path, "PNG")
    return out_path


def render_halftime_plate(
    draft: MatchDraft, ht_toasty: int, ht_opp: int, out_path: Path
) -> Path:
    """Renders a crisp 1920x1080 halftime transition graphic."""
    img = Image.new("RGBA", (1920, 1080), OBSIDIAN)
    draw = ImageDraw.Draw(img)
    ctx = draft.context

    draw.rectangle([0, 0, 1920, 12], fill=TOASTY_TAN)
    draw.rectangle([0, 1068, 1920, 1080], fill=TOASTY_RED)

    f_title = _load_font(84, bold=True)
    f_score = _load_font(64, bold=True)
    f_sub = _load_font(28, bold=True)

    draw.text((960, 380), "HALFTIME", fill=TOASTY_TAN, font=f_title, anchor="mm")
    score_line = f"{ctx.toasty_code.upper()}   {ht_toasty}  -  {ht_opp}   {ctx.opponent_code.upper()}"
    draw.text((960, 540), score_line, fill=WHITE, font=f_score, anchor="mm")
    draw.text((960, 650), f"TOASTY FC vs {ctx.opponent.upper()}", fill=MUTED, font=f_sub, anchor="mm")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_path, "PNG")
    return out_path


def render_outro_stats_plate(draft: MatchDraft, out_path: Path) -> Path:
    """
    Renders a 1920x1080 Full-Time Outro Card showing:
      - Final score (both teams)
      - Side-by-side comparison stats for BOTH squads
      - Goal scorers + match minutes
    """
    img = Image.new("RGBA", (1920, 1080), OBSIDIAN)
    draw = ImageDraw.Draw(img)
    ctx = draft.context
    t = draft.team_stats_toasty
    o = draft.team_stats_opponent

    final_t = ctx.toasty_score if ctx.toasty_score is not None else t.goals
    final_o = ctx.opponent_score if ctx.opponent_score is not None else o.goals

    draw.rectangle([0, 0, 1920, 12], fill=TOASTY_RED)
    draw.rectangle([0, 1068, 1920, 1080], fill=TOASTY_TAN)

    f_label = _load_font(22, bold=True)
    f_hdr = _load_font(54, bold=True)
    f_score = _load_font(72, bold=True)
    f_stat = _load_font(26, bold=True)
    f_scorer = _load_font(22, bold=False)

    # Full-time banner
    draw.text((960, 72), "FULL TIME  ·  MATCH STATISTICS", fill=TOASTY_TAN, font=f_label, anchor="mm")
    toa_rgba = parse_hex_rgba(ctx.toasty_color, "#cabba2")
    opp_rgba = parse_hex_rgba(ctx.opponent_color, "#3B82F6")

    draw.rounded_rectangle([140, 110, 1780, 240], radius=16, fill=OBSIDIAN_CARD, outline=BORDER, width=2)
    draw.rectangle([140, 110, 160, 240], fill=toa_rgba)
    draw.rectangle([1760, 110, 1780, 240], fill=opp_rgba)

    draw.text((220, 175), f"TOASTY FC ({ctx.toasty_code.upper()})", fill=WHITE, font=f_hdr, anchor="lm")
    draw.text((960, 175), f"{final_t}  -  {final_o}", fill=TOASTY_TAN, font=f_score, anchor="mm")
    opp_lbl = f"{ctx.opponent.upper()} ({ctx.opponent_code.upper()})"
    opp_hdr_font = _load_font(38 if len(opp_lbl) > 18 else 50, bold=True)
    draw.text((1700, 175), opp_lbl, fill=WHITE, font=opp_hdr_font, anchor="rm")

    # Left panel: Side-by-side team stats (BOTH teams)
    draw.rounded_rectangle([140, 275, 1140, 995], radius=16, fill=OBSIDIAN_CARD, outline=BORDER, width=2)
    draw.text((640, 318), "TEAM COMPARISON", fill=TOASTY_TAN, font=f_label, anchor="mm")

    stat_rows = [
        ("TOTAL SHOTS", t.total_shots, o.total_shots),
        ("SHOTS ON TARGET", t.shots_on_target, o.shots_on_target),
        ("GOALKEEPER SAVES", t.saves, o.saves),
        ("CORNERS", t.corners, o.corners),
        ("BLOCKS", t.blocks, o.blocks),
        ("FOULS", t.fouls, o.fouls),
        ("YELLOW CARDS", t.yellow_cards, o.yellow_cards),
        ("RED CARDS", t.red_cards, o.red_cards),
    ]

    y = 372
    for label, tv, ov in stat_rows:
        draw.text((210, y), str(tv), fill=TOASTY_TAN, font=f_stat, anchor="lm")
        draw.text((640, y), label, fill=MUTED, font=f_label, anchor="mm")
        draw.text((1070, y), str(ov), fill=WHITE, font=f_stat, anchor="rm")

        # Bar below
        bar_y = y + 26
        bar_x0, bar_x1 = 210, 1070
        bar_w = bar_x1 - bar_x0
        total = tv + ov
        split_x = bar_x0 + int(bar_w * (tv / total if total > 0 else 0.5))
        draw.rounded_rectangle([bar_x0, bar_y, bar_x1, bar_y + 10], radius=5, fill=(45, 45, 52, 255))
        if tv > 0:
            draw.rounded_rectangle([bar_x0, bar_y, max(bar_x0 + 8, split_x), bar_y + 10], radius=5, fill=TOASTY_RED)
        if ov > 0:
            draw.rounded_rectangle([min(bar_x1 - 8, split_x), bar_y, bar_x1, bar_y + 10], radius=5, fill=opp_rgba)
        y += 74

    # Right panel: Goal Scorers & Minutes
    draw.rounded_rectangle([1180, 275, 1780, 995], radius=16, fill=OBSIDIAN_CARD, outline=BORDER, width=2)
    draw.text((1480, 318), "GOAL SCORERS", fill=TOASTY_TAN, font=f_label, anchor="mm")

    toasty_goals = [e for e in draft.events if e.event_type in ("goal", "own_goal") and e.team == "toasty"]
    opp_goals = [e for e in draft.events if e.event_type in ("goal", "own_goal") and e.team == "opponent"]

    gy = 370
    draw.text((1220, gy), f"TOASTY FC ({len(toasty_goals)})", fill=TOASTY_TAN, font=f_label, anchor="lm")
    gy += 34
    if toasty_goals:
        for g in toasty_goals[:10]:
            min_str = f"{g.match_minute}'" if g.match_minute is not None else format_timestamp(g.video_time_sec)
            who = "Own Goal" if g.event_type == "own_goal" else (g.player_name or g.player_id or "Toasty FC")
            ast = f" (A: {g.assist_player_name})" if g.assist_player_name else ""
            draw.text((1220, gy), f"• {min_str}  {who}{ast}"[:42], fill=WHITE, font=f_scorer, anchor="lm")
            gy += 32
    else:
        draw.text((1220, gy), "No goals logged", fill=MUTED, font=f_scorer, anchor="lm")
        gy += 32

    gy = max(gy + 26, 700)
    draw.text((1220, gy), f"{ctx.opponent.upper()} ({len(opp_goals)})", fill=MUTED, font=f_label, anchor="lm")
    gy += 34
    if opp_goals:
        for g in opp_goals[:8]:
            min_str = f"{g.match_minute}'" if g.match_minute is not None else format_timestamp(g.video_time_sec)
            lbl = f"{ctx.opponent_code.upper()} Goal" if g.event_type == "goal" else "Toasty OG"
            draw.text((1220, gy), f"• {min_str}  {lbl}", fill=WHITE, font=f_scorer, anchor="lm")
            gy += 32
    else:
        draw.text((1220, gy), "Clean Sheet!", fill=TOASTY_TAN, font=f_scorer, anchor="lm")

    draw.text((960, 1035), "ToastyFC.com  ·  youtube.com/@toastyfc", fill=MUTED, font=f_label, anchor="mm")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_path, "PNG")
    return out_path
