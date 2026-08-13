#!/usr/bin/env python3
"""Validate the coverage table and render a dependency-free SVG chart."""

from __future__ import annotations

import csv
import html
from pathlib import Path


HERE = Path(__file__).resolve().parent
INPUT = HERE / "coverage.csv"
PENDING_INPUT = HERE / "tmp_coverage.csv"
OUTPUT = HERE / "coverage.svg"

WIDTH = 1440
HEIGHT = 900
BAR_X = 360
BAR_WIDTH = 900
BAR_HEIGHT = 54
MAX_TOTAL = 163

COLORS = {
    "background": "#FAF6EC",
    "ink": "#1C1C1C",
    "muted": "#6B6459",
    "coded": "#6B1E2E",
    "pending": "#E8D4D7",
    "gold": "#B8892B",
    "grid": "#D8CCB9",
}

FIELDS = ["regime", "total_items", "coded_items", "pending_items", "coverage_pct"]


def load_rows(path: Path) -> list[dict[str, int | float | str]]:
    """Load and validate the compact analytical contract."""
    with path.open(newline="", encoding="utf-8") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != FIELDS:
            raise ValueError(f"Unexpected columns: {reader.fieldnames}")
        rows = []
        for raw in reader:
            row = {
                "regime": raw["regime"],
                "total_items": int(raw["total_items"]),
                "coded_items": int(raw["coded_items"]),
                "pending_items": int(raw["pending_items"]),
                "coverage_pct": float(raw["coverage_pct"]),
            }
            if row["coded_items"] + row["pending_items"] != row["total_items"]:
                raise ValueError(f"Invalid arithmetic for {row['regime']}")
            rows.append(row)

    if sum(int(row["total_items"]) for row in rows) != 335:
        raise ValueError("Expected 335 corpus items")
    if sum(int(row["coded_items"]) for row in rows) != 286:
        raise ValueError("Expected 286 coded items")
    return rows


def svg_text(x: int, y: int, content: object, **attrs: object) -> str:
    """Build one escaped SVG text element."""
    attributes = " ".join(
        f'{key.replace("_", "-")}="{value}"' for key, value in attrs.items()
    )
    return f'<text x="{x}" y="{y}" {attributes}>{html.escape(str(content))}</text>'


def render(rows: list[dict[str, int | float | str]]) -> str:
    """Render a fixed-layout chart suitable for slides and notebooks."""
    total = sum(int(row["total_items"]) for row in rows)
    coded = sum(int(row["coded_items"]) for row in rows)
    pending = total - coded
    overall_pct = 100 * coded / total

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">',
        f'<rect width="100%" height="100%" fill="{COLORS["background"]}"/>',
        '<style>text{font-family:Inter,Avenir,Helvetica,Arial,sans-serif}</style>',
        svg_text(
            92,
            100,
            "ICONOCRACIA · VISÃO COMPUTACIONAL",
            fill=COLORS["gold"],
            font_size=22,
            font_weight=700,
            letter_spacing=2,
        ),
        svg_text(
            92,
            158,
            "Cobertura de codificação por regime",
            fill=COLORS["ink"],
            font_size=43,
            font_weight=700,
        ),
        svg_text(
            92,
            202,
            "Snapshot público do Hugging Face · 13 ago. 2026",
            fill=COLORS["muted"],
            font_size=23,
        ),
        svg_text(92, 276, coded, fill=COLORS["coded"], font_size=52, font_weight=750),
        svg_text(
            204,
            274,
            f"de {total} codificados",
            fill=COLORS["ink"],
            font_size=26,
            font_weight=600,
        ),
        svg_text(
            92,
            311,
            f"{overall_pct:.1f}% de cobertura geral · {pending} pendentes",
            fill=COLORS["muted"],
            font_size=20,
        ),
    ]

    y_start = 390
    for index, row in enumerate(rows):
        y = y_start + index * 112
        total_items = int(row["total_items"])
        coded_items = int(row["coded_items"])
        pending_items = int(row["pending_items"])
        coverage_pct = float(row["coverage_pct"])
        full_width = BAR_WIDTH * total_items / MAX_TOTAL
        coded_width = full_width * coded_items / total_items

        parts.extend(
            [
                svg_text(
                    92,
                    y + 36,
                    row["regime"],
                    fill=COLORS["ink"],
                    font_size=25,
                    font_weight=650,
                ),
                f'<rect x="{BAR_X}" y="{y}" width="{full_width:.1f}" height="{BAR_HEIGHT}" rx="8" fill="{COLORS["pending"]}"/>',
                f'<rect x="{BAR_X}" y="{y}" width="{coded_width:.1f}" height="{BAR_HEIGHT}" rx="8" fill="{COLORS["coded"]}"/>',
                svg_text(
                    BAR_X + BAR_WIDTH + 30,
                    y + 36,
                    f"{coverage_pct:.1f}%",
                    fill=COLORS["ink"],
                    font_size=25,
                    font_weight=700,
                ),
                svg_text(
                    BAR_X,
                    y + 82,
                    f"{coded_items} codificados",
                    fill=COLORS["muted"],
                    font_size=18,
                ),
                svg_text(
                    BAR_X + 190,
                    y + 82,
                    f"{pending_items} pendentes",
                    fill=COLORS["muted"],
                    font_size=18,
                ),
            ]
        )

    parts.extend(
        [
            f'<line x1="92" y1="826" x2="1348" y2="826" stroke="{COLORS["grid"]}"/>',
            svg_text(
                92,
                866,
                "Fonte: warholana/iconocracy-corpus · análise agregada por regime",
                fill=COLORS["muted"],
                font_size=17,
            ),
            f'<rect x="1040" y="852" width="18" height="18" rx="3" fill="{COLORS["coded"]}"/>',
            svg_text(1068, 867, "codificado", fill=COLORS["muted"], font_size=17),
            f'<rect x="1190" y="852" width="18" height="18" rx="3" fill="{COLORS["pending"]}"/>',
            svg_text(1218, 867, "pendente", fill=COLORS["muted"], font_size=17),
            "</svg>",
        ]
    )
    return "\n".join(parts) + "\n"


def main() -> None:
    """Promote fresh query output when present, validate it, and render SVG."""
    source = PENDING_INPUT if PENDING_INPUT.exists() else INPUT
    rows = load_rows(source)
    if source == PENDING_INPUT:
        PENDING_INPUT.replace(INPUT)
        print(f"Updated {INPUT.name} from query output")
    OUTPUT.write_text(render(rows), encoding="utf-8")
    print(f"Rendered {OUTPUT.name}")


if __name__ == "__main__":
    main()
