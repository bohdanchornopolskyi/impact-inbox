# Color picker spec

Rebuild `ColorPickerField` to match `design/impact.pen`. Pixel match the board, not a restyle of the current popover.

The last attempt failed by wrapping `HexColorPicker` / `HexAlphaColorPicker` and forcing layout with CSS. That broke the control. The working square-swatch + hex input is restored. Start from that file. Replace the UI. Keep the hex helpers and tests.

## Source of truth

1. Open `design/impact.pen` in Pencil (the MCP only works when that file is the open editor document).
2. Frames: closed/open field (`color / open` shows the trigger bar with an accent border plus the popover) and the popover internals (saturation square, hue, eyedropper + alpha, hex / opacity, Brand).
3. Tokens in `packages/ui/src/styles/theme.css`.

If Pencil MCP fails, measure from the `.pen` via `execute` / `Get(id, {depth, resolveVariables: true})`. Do not invent spacing.

## Current code

- Component: `apps/web/src/components/template-builder/inspector/color-picker-field.tsx`
- Tests: `apps/web/src/components/template-builder/inspector/color-picker-field.test.ts` (`normalizeHex`, `resolveColorDraft`, `shouldPersistColorDraft`)
- Call sites: inspector `ColorField`, `block-appearance-inspector`, `template-settings-inspector`, `workspace-brand-section`

Keep the public props: `label`, `value`, `fallback`, `onChange`, `disabled`.

## What the control is

One field. Clicking it opens a popover. There is no separate hex text box beside a square.

### Closed field

Full-width bar, height `control-md` (34px), radius `sm` (6px), surface background, `border-strong`.

Left to right:

- 20px rounded square swatch of the current color, 1px `black/10` so white reads
- Hex **without** `#`, uppercase, mono, semibold (`4F46E5`)
- Opacity on the right, `text-3` (`100%`)

Open: same bar, border `accent` (`#4F46E5`). Closed: `border-strong`. Disabled: `neutral-200` border, `neutral-100` fill, no popover.

The field label stays a `FieldRow` `htmlFor` pointing at this button.

### Popover

White surface, large radius (measure in Pencil; visually closer to `xl` / 16px than `sm`), `shadow-pop`, no harsh border if the file uses shadow only. Width ~280px. Padding ~16px. Stack with ~12px gaps.

Top to bottom:

1. **Saturation / brightness square.** Large, nearly square, radius ~8px. White top-left, pure hue top-right, black at the bottom. Thumb: circle, current color fill, 2px white ring, dark outer hairline so it reads on white.
2. **Hue slider.** Full width. Rainbow track, pill height ~12px. Same thumb language. Default hue thumb sits on the selected hue.
3. **Eyedropper + alpha slider.** One row. Eyedropper icon on the left (14–16px, `text-2`). Alpha track is the rest of the row: checkerboard through to the current color. Thumb at the alpha position. Eyedropper is **only** on this row, not beside hue.
4. **Values.** Hex field (flex) and opacity field (narrow). `#` lives **inside** the hex field as a prefix. The hex value has no extra hash. Opacity field is digits only. `%` sits **outside** the opacity field, to its right, `text-3`. Both fields use the shared input chrome (34px, `rounded-sm`, `border-strong`).
5. **Hairline divider.**
6. **BRAND.** Label: 11px, semibold, uppercase, tracked, `text-3`. One row of **seven** 28px (`size-7`) rounded-sm swatches:

| | Hex |
| --- | --- |
| 1 | `#4F46E5` (`brand-500`) |
| 2 | `#A5AAF7` (`brand-300`) |
| 3 | `#E0E4FD` (`brand-100`) |
| 4 | `#0F172A` (`neutral-900`) |
| 5 | `#8A93A0` (`neutral-500`) |
| 6 | `#E5E7EB` (`neutral-200`) |
| 7 | `#FFFFFF` with a visible border |

Selected swatch: white check if the fill is dark, `text` check if the fill is light. Optional `ring-2 ring-accent`.

7. **RECENT.** Same label style. Up to 6 swatches of colors the user actually picked, most recent first, `localStorage` key `impact-inbox.recent-colors`. Hide the section when empty. Do not persist recents on every saturation-drag frame; persist on commit (swatch click, valid hex enter, eyedropper, popover close if the value changed).

If the workspace brand kit has a `primary`, it may replace swatch 1 when it is a valid hex. Do not dump every brand-kit role into the row. The row is a palette, not a settings dump.

## Behavior

- Dragging saturation, hue, or alpha updates the field and the canvas live.
- `onChange` stays **6-digit hex** (`#rrggbb`). Alpha is picker-local. Email HTML does not get `#rrggbbaa`. Closing the popover does not write alpha into the template.
- Typed hex accepts `4F46E5` or `#4F46E5`. Commit when it is a full 6 digits. Invalid partial values stay in the input until blur, then snap back to the last valid color.
- Eyedropper uses `window.EyeDropper`. If the API is missing, omit the icon. Do not ship a dead control.
- Escape and click-outside close the popover. Focus returns to the field.
- Disabled: no open, no eyedropper, no typing.

## How to build it

Compose `react-colorful` primitives (`Saturation`, `Hue`, `Alpha`) with a small HSVA state. `HexColorPicker` is saturation+hue glued together. `HexAlphaColorPicker` is that plus alpha. Neither matches this layout. If those primitives are not public in v5.7, copy the package’s composition pattern. Do not `display: contents` or absolutely position an eyedropper over the default widget.

Use `@repo/ui` `Input` for the two value fields. Prefix `#` with `leadingIcon`. Do not put `%` in `suffix` if the design has it outside; render `%` as a sibling.

Popover: existing `BasePopover` from `@repo/ui/client`.

## Done when

- Closed field matches `color / open` (bar, not square + input).
- Open popover matches the Pencil popover: square, hue, eyedropper+alpha, `#` inside / `%` outside, Brand row of those seven colors.
- Helpers and `color-picker-field.test.ts` still pass.
- Brand settings and the template inspector both use the same control.
- Keyboard: field is a button, popover is dismissible, every swatch has an accessible name, hex and opacity inputs are labelled.
- No `pnpm dev` / `pnpm build`. Verify in the already-running app: builder inspector color field, and workspace Settings → Brand.
