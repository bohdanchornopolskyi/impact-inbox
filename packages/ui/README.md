# @repo/ui

Production design system for Impact Inbox. Source prototypes live in `design/project/`; tokens and components here are what apps import.

## Tokens

All design tokens are defined once in `src/styles/theme.css` using Tailwind v4 `@theme inline` (colors, typography, radii, shadows, spacing).

Apps import the theme:

```css
@import "@repo/ui/styles/theme.css";
```

**Server components** import from `@repo/ui` (Button, Input, Badge, etc.).

**Client components** import interactive pieces from `@repo/ui/client` (PasswordInput, Modal, Popover, etc.):

```tsx
import { Button, Input } from "@repo/ui";
import { PasswordInput, Modal, Popover } from "@repo/ui/client";
```

## Storybook

```bash
pnpm storybook          # from repo root
pnpm --filter @repo/ui storybook
```

Browse components, token swatches, auth patterns, and Base UI overlays (Modal, Collapsible, Popover).

## Components

Built with **Tailwind** for styling and **Base UI** for accessible primitives (Dialog, Collapsible, Popover). Import from `@repo/ui` or `@repo/ui/client`:

```tsx
import { Button, Input, AuthShell } from "@repo/ui";
import { PasswordInput, Modal, Popover } from "@repo/ui/client";
```
