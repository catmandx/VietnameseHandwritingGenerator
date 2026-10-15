# Agent Guidelines & Invariants

## Line Geometry & Spacing Invariant
- **Immutable Line Heights**: The text lines (`#result, .result-text`) use a rigid CSS Grid architecture with fixed row tracks:
  - 72pt (large / 2 ô ly): `grid-auto-rows: calc(var(--grid-unit) * 8);` (153.6px)
  - 37pt (small / 1 ô ly): `grid-auto-rows: calc(var(--grid-unit) * 4);` (76.8px)
- **Child Conformance**: Any new inline child element added inside a line (e.g. `.word`, `.word-space`, handles, toolbars, badges, outlines) MUST conform to the line box and NEVER expand its height:
  - All direct text and spacing elements (`.word`, `.word-text`, `.word-space`) must use `line-height: inherit; vertical-align: baseline;`.
  - `.word-space` must be `display: inline-block;` (never unconstrained `display: inline`, which causes font-leading inflation with tall Vietnamese diacritics).
  - Floating controls, popovers, and outline/dot layers must be positioned absolutely (`position: absolute`) with `pointer-events` properly scoped.
  - `<p class="line">` must have `height: 100%; max-height: 100%; box-sizing: border-box; margin: 0; padding: 0;`.
- **Baseline Calibrations**: Never arbitrarily adjust container `padding-top` calibrations unless specifically requested by the user.

## Browser Testing Priority
When testing layout, rendering, or features, prioritize browser compatibility in this order:
1. **Google Chrome** (Primary target)
2. **Mozilla Firefox** (Secondary target)
3. **Apple Safari / WebKit** (Tertiary target)

## Deployment Rule
- Deploy changes to Docker container `chudep` on `127.0.0.1:8080`.
- Commit changes locally to git, but **DO NOT PUSH** to remote unless explicitly requested.
