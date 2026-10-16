# Agent Guidelines & Invariants

## Line Geometry & Spacing Invariant
- **Immutable Line Heights**: The text lines (`#result, .result-text`) use a rigid CSS Grid architecture with fixed row tracks:
  - 72pt (large / 2 ô ly): `grid-auto-rows: calc(var(--grid-unit) * 8);` (153.6px)
  - 37pt (small / 1 ô ly): `grid-auto-rows: calc(var(--grid-unit) * 4);` (76.8px)
- **Rigid Line Capping**: `<p class="line">` inside `#result` and `.result-text` must have explicit capped height and `min-height: 0 !important;`:
  - 72pt: `height: calc(var(--grid-unit) * 8) !important; max-height: calc(var(--grid-unit) * 8) !important; min-height: 0 !important;`
  - 37pt: `height: calc(var(--grid-unit) * 4) !important; max-height: calc(var(--grid-unit) * 4) !important; min-height: 0 !important;`
  - This prevents CSS Grid items from defaulting to `min-height: auto`, which otherwise expands row tracks when tall font ascenders or Vietnamese accents exceed the track height in certain browser rendering engines.
- **Integer-Period Background Tiling (384px Invariant)**:
  - Canvas background tile vertical period MUST be set to `calc(var(--grid-unit) * 20)` (384px = 5 blocks = 20 ô ly), NEVER `var(--grid-size)` (76.8px).
  - $19.2\text{px} \times 4 = 76.8\text{px}$ is a non-integer pixel value that causes GPU rasterizers (Chrome Skia, Firefox WebRender, Safari CoreGraphics) to round tile heights to 77px, accumulating $+0.4\text{px}$ downward drift per line ($+8\text{px}$ over 20 lines).
  - In contrast, $19.2\text{px} \times 20 = 384.0\text{px}$ is an exact integer across all DPR displays (1x: 384px, 1.25x: 480px, 1.5x: 576px, 2x: 768px), permanently eliminating vertical drift across unlimited lines.
- **Child Conformance**: Any new inline child element added inside a line (e.g. `.word`, `.word-space`, handles, toolbars, badges, outlines) MUST conform to the line box and NEVER expand its height:
  - All direct text and spacing elements (`.word`, `.word-text`, `.word-space`) must use `line-height: inherit; vertical-align: baseline;`.
  - `.word-space` must be `display: inline-block;` (never unconstrained `display: inline`, which causes font-leading inflation with tall Vietnamese diacritics).
  - Floating controls, popovers, and outline/dot layers must be positioned absolutely (`position: absolute`) with `pointer-events` properly scoped.
  - `<p class="line">` must have `box-sizing: border-box; margin: 0; padding: 0;`.
- **Guideline Centering Invariant**: The bottom edge/curve of glyphs (baseline) MUST sit directly in the middle (vertical midpoint) of the 1.5px major horizontal guideline across all layouts (72pt and 37pt), never on its top or bottom edge. Container `padding-top` calibrations (`calc(var(--grid-unit) * 0.7 - 1px)` for 72pt, `calc(var(--grid-unit) * 3.32 - 0.15px)` for 37pt on normal infinite boards; and `calc(var(--grid-unit) * 0.2 + 9px)` / `calc(var(--grid-unit) * 3.34 - 0.15px)` on 11x14) are calibrated to center the stroke through the guideline stroke thickness. Do not arbitrarily alter these calibrations.

## Blackboard Layout & Isolation Invariant
- **Single-Line Absolute Architecture**: The mini blackboard (`.board.blackboard`) does NOT use CSS Grid row tracks. It renders 1 line of text per board anchored on Line 1 ($y = 408.05\text{px}$) inside an 842px x 595px SVG vector frame.
- **Uncapped Single-Line Metrics**:
  - `#result, .result-text` inside `.board.blackboard` must have `display: block !important; position: absolute !important; left: 96.09px !important; line-height: 1 !important; height: auto !important; min-width: 0 !important;`.
  - `<p class="line">` inside `.board.blackboard` must have `height: auto !important; max-height: none !important; min-height: 0 !important; line-height: 1 !important;`.
  - `.word, .word-text, .word-space` inside `.board.blackboard` must have `line-height: 1 !important; vertical-align: baseline !important;`.
  - **Never apply CSS Grid multiline line-height capping (`76.8px` or `153.6px`) to `.board.blackboard`**, as this applies negative half-leading to the large font ($144.66\text{px}$ / $281.5\text{px}$), shifting the text $34\text{px}$–$68\text{px}$ above the guideline and displacing italicized text horizontally.

## Browser Testing Priority
When testing layout, rendering, or features, prioritize browser compatibility in this order:
1. **Google Chrome** (Primary target)
2. **Mozilla Firefox** (Secondary target)
3. **Apple Safari / WebKit** (Tertiary target)

## Deployment Rule
- Deploy changes to Docker container `chudep` on `127.0.0.1:8080`.
- Commit changes locally to git, but **DO NOT PUSH** to remote unless explicitly requested.
