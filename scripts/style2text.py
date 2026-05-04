""" 
Write a Python script that accepts on stdin an html fragment of syntax highlighted code from vscode(monaco) and outputs on stdout a textual representation of the styles.

Principles

- Extract all divs which are direct parents of spans. Those are our lines of code.
- 1st pass: Discover, parse, and sort distinct syntax highlighting styles in all spans
- 2nd pass: Output each div's concatenation of its spans' text as a line of code, starting each span with the unicode exponent digits that represent the index of the style

Input rules

- Make sure HTML entities are parsed
- Ignore empty spans
- Merge consecutive spans with an identical style
- Replace non-breaking spaces by regular spaces in span text.

Output rules

- Sort discovered styles by hsl color(hue, saturation, lightness), then alphabetically
- Convert colors to hsl or hsla if alpha != 1
- Always put the annotation exponentiated number behind the first non-whitespace character of a span

Example output(plaintext)

```
⁰ color: hsl(90, 59 %, 66%)
¹ color: hsl(90, 59 %, 66%); font-style: italic
² color: hsl(186, 51 %, 69%)
³ color: hsl(60, 30 %, 96%)
⁴ ...
⁵ ...
⁶ ...
⁷ ...
⁸ ...
⁹ ...
¹⁰ ...
...

²type ⁰Result < ¹T³, ¹E ³ = ⁰Error > ³ =
  ³ | {ok: ⁰true³; value: ¹T ³}
  ³ | {ok: ⁰false³; error: ¹E ³;
...
```

Example input

```html
<div>
    <div style="
            color:#f8f8f2;
            background-color:#272822;
            font-family:'JetBrains Mono', Consolas, 'Courier New', monospace;
            font-weight:normal;
            font-size:14px;
            line-height:22px;
            white-space:pre;
        ">
        <div>
            <span style="color:#88d0d8">type</span><span style="color:#f8f8f2"> </span><span style="color:#a8db75">Result</span><span style="color:#a8db75">&lt;</span><span style="color:#a8db75; font-style:italic">T</span><span style="color:#f8f8f2">, </span><span style="color:#a8db75; font-style:italic">E</span><span style="color:#f8f8f2"> = </span><span style="color:#a8db75">Error</span><span style="color:#a8db75">&gt;</span><span style="color:#f8f8f2"> =</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; | { </span><span style="color:#f8f8f2">ok</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">true</span><span style="color:#f8f8f2">; </span><span style="color:#f8f8f2">value</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75; font-style:italic">T</span><span style="color:#f8f8f2"> }</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; | { </span><span style="color:#f8f8f2">ok</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">false</span><span style="color:#f8f8f2">; </span><span style="color:#f8f8f2">error</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75; font-style:italic">E</span><span style="color:#f8f8f2"> };</span>
        </div>
        <br />
        <div>
            <span style="color:#88d0d8">async</span><span style="color:#f8f8f2"> </span><span style="color:#88d0d8">function</span><span style="color:#f8f8f2"> </span><span style="color:#debad6">loadJson</span><span style="color:#a8db75">&lt;</span><span style="color:#a8db75; font-style:italic">T</span><span style="color:#a8db75">&gt;</span><span style="color:#f8f8f2">(</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; </span><span style="color:#f8f8f2; font-style:italic">url</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">string</span><span style="color:#f8f8f2">,</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; </span><span style="color:#debad6">parse</span><span style="color:#f8f8f2">: (</span><span style="color:#f8f8f2; font-style:italic">input</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">unknown</span><span style="color:#f8f8f2">) </span><span style="color:#f8f8f2">=&gt;</span><span style="color:#f8f8f2"> </span><span style="color:#a8db75; font-style:italic">T</span>
        </div>
        <div>
            <span style="color:#f8f8f2">): </span><span style="color:#a8db75">Promise</span><span style="color:#a8db75">&lt;</span><span style="color:#a8db75">Result</span><span style="color:#a8db75">&lt;</span><span style="color:#a8db75; font-style:italic">T</span><span style="color:#a8db75">&gt;&gt;</span><span style="color:#f8f8f2"> {</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; </span><span style="color:#fcb369">// Fetch, validate, and normalize remote data.</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; </span><span style="color:#88d0d8">const</span><span style="color:#f8f8f2"> </span><span style="color:#f8f8f2">response</span><span style="color:#f8f8f2"> = </span><span style="color:#f2958c">await</span><span style="color:#f8f8f2"> </span><span style="color:#debad6">fetch</span><span style="color:#f8f8f2">(</span><span style="color:#f8f8f2; font-style:italic">url</span><span style="color:#f8f8f2">);</span>
        </div>
        <br />
        <div>
            <span style="color:#f8f8f2">&nbsp; </span><span style="color:#88d0d8">if</span><span style="color:#f8f8f2"> (!</span><span style="color:#f8f8f2">response</span><span style="color:#f8f8f2">.</span><span style="color:#f8f8f2">ok</span><span style="color:#f8f8f2">) {</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; &nbsp; </span><span style="color:#f2958c">return</span><span style="color:#f8f8f2"> { </span><span style="color:#f8f8f2">ok</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">false</span><span style="color:#f8f8f2">, </span><span style="color:#f8f8f2">error</span><span style="color:#f8f8f2">: </span><span style="color:#88d0d8">new</span><span style="color:#f8f8f2"> </span><span style="color:#a8db75">Error</span><span style="color:#f8f8f2">(</span><span style="color:#eccf79">`HTTP </span><span style="color:#f8f8f2">${</span><span style="color:#f8f8f2">response</span><span style="color:#f8f8f2">.</span><span style="color:#f8f8f2">status</span><span style="color:#f8f8f2">}</span><span style="color:#eccf79">`</span><span style="color:#f8f8f2">) };</span>
        </div>
        <div><span style="color:#f8f8f2">&nbsp; }</span></div>
        <br />
        <div>
            <span style="color:#f8f8f2">&nbsp; </span><span style="color:#88d0d8">let</span><span style="color:#f8f8f2"> </span><span style="color:#f8f8f2">payload</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">unknown</span><span style="color:#f8f8f2"> = </span><span style="color:#f2958c">await</span><span style="color:#f8f8f2"> </span><span style="color:#f8f8f2">response</span><span style="color:#f8f8f2">.</span><span style="color:#debad6">json</span><span style="color:#f8f8f2">();</span>
        </div>
        <br />
        <div>
            <span style="color:#f8f8f2">&nbsp; </span><span style="color:#88d0d8">try</span><span style="color:#f8f8f2"> {</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; &nbsp; </span><span style="color:#f8f8f2">payload</span><span style="color:#f8f8f2"> = </span><span style="color:#debad6">parse</span><span style="color:#f8f8f2">(</span><span style="color:#f8f8f2">payload</span><span style="color:#f8f8f2">);</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; &nbsp; </span><span style="color:#f2958c">return</span><span style="color:#f8f8f2"> { </span><span style="color:#f8f8f2">ok</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">true</span><span style="color:#f8f8f2">, </span><span style="color:#f8f8f2">value</span><span style="color:#f8f8f2">: </span><span style="color:#f8f8f2">payload</span><span style="color:#f8f8f2"> </span><span style="color:#88d0d8">as</span><span style="color:#f8f8f2"> </span><span style="color:#a8db75; font-style:italic">T</span><span style="color:#f8f8f2"> };</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; } </span><span style="color:#88d0d8">catch</span><span style="color:#f8f8f2"> (</span><span style="color:#f8f8f2">error</span><span style="color:#f8f8f2">) {</span>
        </div>
        <div>
            <span style="color:#f8f8f2">&nbsp; &nbsp; </span><span style="color:#f2958c">return</span><span style="color:#f8f8f2"> { </span><span style="color:#f8f8f2">ok</span><span style="color:#f8f8f2">: </span><span style="color:#a8db75">false</span><span style="color:#f8f8f2">, </span><span style="color:#f8f8f2">error</span><span style="color:#f8f8f2">: </span><span style="color:#f8f8f2">error</span><span style="color:#f8f8f2"> </span><span style="color:#88d0d8">instanceof</span><span style="color:#f8f8f2"> </span><span style="color:#a8db75">Error</span><span style="color:#f8f8f2"> ? </span><span style="color:#f8f8f2">error</span><span style="color:#f8f8f2"> : </span><span style="color:#88d0d8">new</span><span style="color:#f8f8f2"> </span><span style="color:#a8db75">Error</span><span style="color:#f8f8f2">(</span><span style="color:#eccf79">"Invalid payload"</span><span style="color:#f8f8f2">) };</span>
        </div>
        <div><span style="color:#f8f8f2">&nbsp; }</span></div>
        <div><span style="color:#f8f8f2">}</span></div>
    </div>
    <br />
</div>
```
"""

#!/usr/bin/env python3

import colorsys
import re
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser

SUPERSCRIPT_DIGITS: dict[str, str] = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
}


@dataclass(slots=True)
class Span:
    style: str
    text: str


@dataclass(slots=True)
class DivNode:
    tag: str
    style: str = ""
    has_direct_span: bool = False
    spans: list[Span] = field(default_factory=list)


@dataclass(slots=True)
class ActiveSpan:
    style: str
    parent: DivNode | None
    text_parts: list[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        return "".join(self.text_parts).replace("\xa0", " ")


RGBA = tuple[float, float, float, float]
HSLA = tuple[int, int, int, float]
StyleSortKey = tuple[float, float, float, str]


def superscript_number(value: int) -> str:
    return "".join(SUPERSCRIPT_DIGITS[digit] for digit in str(value))


def split_style(style: str) -> dict[str, str]:
    declarations: dict[str, str] = {}

    for part in style.split(";"):
        if ":" not in part:
            continue

        key, value = part.split(":", 1)
        key = key.strip().lower()
        value = " ".join(value.strip().split())

        if key:
            declarations[key] = value

    return declarations


def parse_css_color(value: str) -> RGBA | None:
    value = value.strip().lower()

    if value.startswith("#"):
        return parse_hex_color(value)

    if value.startswith("rgb(") or value.startswith("rgba("):
        return parse_rgb_color(value)

    if value.startswith("hsl(") or value.startswith("hsla("):
        return parse_hsl_color(value)

    return None


def parse_hex_color(value: str) -> RGBA | None:
    hex_value = value[1:]

    try:
        if len(hex_value) == 3:
            r = int(hex_value[0] * 2, 16)
            g = int(hex_value[1] * 2, 16)
            b = int(hex_value[2] * 2, 16)
            a = 255
        elif len(hex_value) == 4:
            r = int(hex_value[0] * 2, 16)
            g = int(hex_value[1] * 2, 16)
            b = int(hex_value[2] * 2, 16)
            a = int(hex_value[3] * 2, 16)
        elif len(hex_value) == 6:
            r = int(hex_value[0:2], 16)
            g = int(hex_value[2:4], 16)
            b = int(hex_value[4:6], 16)
            a = 255
        elif len(hex_value) == 8:
            r = int(hex_value[0:2], 16)
            g = int(hex_value[2:4], 16)
            b = int(hex_value[4:6], 16)
            a = int(hex_value[6:8], 16)
        else:
            return None
    except ValueError:
        return None

    return r / 255, g / 255, b / 255, a / 255


def parse_rgb_color(value: str) -> RGBA | None:
    match = re.fullmatch(r"rgba?\((.*)\)", value)
    if not match:
        return None

    parts, alpha = split_css_color_function_args(match.group(1))

    if len(parts) != 3:
        return None

    try:
        r = parse_rgb_channel(parts[0])
        g = parse_rgb_channel(parts[1])
        b = parse_rgb_channel(parts[2])
    except ValueError:
        return None

    return r, g, b, alpha


def parse_hsl_color(value: str) -> RGBA | None:
    match = re.fullmatch(r"hsla?\((.*)\)", value)
    if not match:
        return None

    parts, alpha = split_css_color_function_args(match.group(1))

    if len(parts) != 3:
        return None

    try:
        hue = parse_hue(parts[0])
        saturation = parse_percent(parts[1])
        lightness = parse_percent(parts[2])
    except ValueError:
        return None

    r, g, b = colorsys.hls_to_rgb(hue / 360, lightness, saturation)

    return r, g, b, alpha


def split_css_color_function_args(content: str) -> tuple[list[str], float]:
    content = content.strip()
    alpha = 1.0

    if "/" in content:
        left, alpha_text = content.split("/", 1)
        parts = split_css_components(left)

        try:
            alpha = parse_alpha(alpha_text)
        except ValueError:
            alpha = 1.0

        return parts, alpha

    parts = [part.strip() for part in content.split(",")]

    if len(parts) == 1:
        parts = split_css_components(content)

    if len(parts) == 4:
        try:
            alpha = parse_alpha(parts[3])
        except ValueError:
            alpha = 1.0

        parts = parts[:3]

    return parts, alpha


def split_css_components(content: str) -> list[str]:
    return [part for part in re.split(r"[\s,]+", content.strip()) if part]


def parse_rgb_channel(value: str) -> float:
    value = value.strip()

    if value.endswith("%"):
        return clamp(float(value[:-1]) / 100)

    return clamp(float(value) / 255)


def parse_alpha(value: str) -> float:
    value = value.strip()

    if value.endswith("%"):
        return clamp(float(value[:-1]) / 100)

    return clamp(float(value))


def parse_hue(value: str) -> float:
    value = value.strip().lower()

    if value.endswith("deg"):
        return float(value[:-3]) % 360

    if value.endswith("turn"):
        return float(value[:-4]) * 360 % 360

    if value.endswith("rad"):
        return float(value[:-3]) * 180 / 3.141592653589793 % 360

    if value.endswith("grad"):
        return float(value[:-4]) * 0.9 % 360

    return float(value) % 360


def parse_percent(value: str) -> float:
    value = value.strip()

    if not value.endswith("%"):
        raise ValueError(f"expected percentage, got {value!r}")

    return clamp(float(value[:-1]) / 100)


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def rgba_to_hsla(r: float, g: float, b: float, a: float) -> HSLA:
    hue, lightness, saturation = colorsys.rgb_to_hls(r, g, b)

    return (
        round(hue * 360) % 360,
        round(saturation * 100),
        round(lightness * 100),
        a,
    )


def format_alpha(alpha: float) -> str:
    text = f"{alpha:.6f}".rstrip("0").rstrip(".")
    return text or "0"


def normalize_style(style_text: str) -> str:
    declarations = split_style(style_text)
    normalized: list[str] = []

    for key in sorted(declarations):
        value = declarations[key]

        if key == "color":
            color = parse_css_color(value)

            if color is not None:
                hue, saturation, lightness, alpha = rgba_to_hsla(*color)

                if alpha == 1.0:
                    value = f"hsl({hue}, {saturation} %, {lightness}%)"
                else:
                    value = (
                        f"hsla({hue}, {saturation} %, "
                        f"{lightness}%, {format_alpha(alpha)})"
                    )

        normalized.append(f"{key}: {value}")

    return "; ".join(normalized)


def style_sort_key(style_text: str) -> StyleSortKey:
    declarations = split_style(style_text)
    color_text = declarations.get("color")

    if color_text is None:
        return float("inf"), float("inf"), float("inf"), style_text

    color = parse_css_color(color_text)

    if color is None:
        return float("inf"), float("inf"), float("inf"), style_text

    hue, saturation, lightness, _alpha = rgba_to_hsla(*color)

    return hue, saturation, lightness, style_text


class MonacoFragmentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[DivNode] = []
        self.lines: list[list[Span]] = []
        self.active_span: ActiveSpan | None = None

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        tag = tag.lower()
        attr_map = {
            key.lower(): value or ""
            for key, value in attrs
        }

        node = DivNode(
            tag=tag,
            style=attr_map.get("style", ""),
        )

        if tag == "span":
            parent = self.stack[-1] if self.stack else None

            if parent is not None and parent.tag == "div":
                parent.has_direct_span = True

            self.active_span = ActiveSpan(
                style=node.style,
                parent=parent,
            )

        self.stack.append(node)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()

        if tag == "span":
            self.close_active_span()

        while self.stack:
            node = self.stack.pop()

            if node.tag == "div" and node.has_direct_span:
                self.lines.append(node.spans)

            if node.tag == tag:
                break

    def handle_data(self, data: str) -> None:
        if self.active_span is not None:
            self.active_span.text_parts.append(data)

    def close_active_span(self) -> None:
        if self.active_span is None:
            return

        text = self.active_span.text

        if text:
            parent = self.active_span.parent

            if parent is not None:
                parent.spans.append(
                    Span(
                        style=normalize_style(self.active_span.style),
                        text=text,
                    )
                )

        self.active_span = None


def merge_consecutive_spans(spans: list[Span]) -> list[Span]:
    merged: list[Span] = []

    for span in spans:
        if not span.text:
            continue

        if merged and merged[-1].style == span.style:
            previous = merged[-1]
            merged[-1] = Span(
                style=previous.style,
                text=previous.text + span.text,
            )
        else:
            merged.append(span)

    return merged


def annotate_span(text: str, style_index: int) -> str:
    marker = superscript_number(style_index)
    match = re.search(r"\S", text)

    if match is None:
        return text

    index = match.start()
    return text[:index] + marker + text[index:]


def parse_fragment(html: str) -> list[list[Span]]:
    parser = MonacoFragmentParser()
    parser.feed(html)
    parser.close()

    return [
        merge_consecutive_spans(line)
        for line in parser.lines
    ]


def discover_styles(lines: list[list[Span]]) -> list[str]:
    styles = {
        span.style
        for line in lines
        for span in line
        if span.text
    }

    return sorted(styles, key=style_sort_key)


def print_styles(styles: list[str]) -> None:
    for index, style in enumerate(styles):
        print(f"{superscript_number(index)} {style}")


def print_lines(lines: list[list[Span]], style_indexes: dict[str, int]) -> None:
    for line in lines:
        print(
            "".join(
                annotate_span(span.text, style_indexes[span.style])
                for span in line
            )
        )


def main() -> int:
    html = sys.stdin.read()
    lines = parse_fragment(html)

    styles = discover_styles(lines)
    style_indexes = {
        style: index
        for index, style in enumerate(styles)
    }

    print_styles(styles)

    if styles:
        print()

    print_lines(lines, style_indexes)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
