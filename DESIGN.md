# FixFlow — Design System

> This document is the visual source of truth for all FixFlow interfaces. Read it before building or changing UI. Do not introduce one-off colors, spacing, typography or component styles without updating this document.

## 1. Product feel

**Direction:** Precision Workshop — calm, capable, modern operational software.

FixFlow should feel like a carefully crafted workshop tool: organized, durable and easy to scan. Use a light-first canvas, crisp borders, clear typography and a small number of purposeful accents.

Do not imitate another brand. The references listed in `docs/07-design-references.md` are process and quality references, not a license to copy their visual identity.

## 2. Color tokens

Use semantic tokens rather than hardcoded colors in components.

| Token | Hex | Role |
|---|---|---|
| `--color-ink-950` | `#101828` | Primary text / dark navigation |
| `--color-ink-800` | `#243247` | Secondary dark surface |
| `--color-blue-700` | `#2457C5` | Primary action |
| `--color-blue-600` | `#316BE8` | Hover/active accent |
| `--color-blue-50` | `#EFF5FF` | Selected/soft accent surface |
| `--color-teal-700` | `#087E78` | Positive operational accent |
| `--color-teal-50` | `#E9F8F5` | Success surface |
| `--color-amber-700` | `#9A5B08` | Waiting/attention |
| `--color-amber-50` | `#FFF6E5` | Warning surface |
| `--color-red-700` | `#B42318` | Destructive/error |
| `--color-red-50` | `#FEF3F2` | Error surface |
| `--color-slate-950` | `#172033` | Body text |
| `--color-slate-700` | `#475467` | Secondary text |
| `--color-slate-500` | `#667085` | Muted text |
| `--color-slate-300` | `#D0D5DD` | Borders |
| `--color-slate-200` | `#E4E7EC` | Dividers |
| `--color-slate-100` | `#F2F4F7` | Subtle surface |
| `--color-slate-50` | `#F8FAFC` | App background |
| `--color-white` | `#FFFFFF` | Cards / inputs |

Dark mode may be added later. Do not implement a partial dark theme that produces unreadable third-party components.

## 3. Typography

Preferred font: **Inter** with system sans-serif fallback. If Inter is unavailable, use a neutral system sans stack.

| Role | Desktop | Mobile | Weight |
|---|---:|---:|---:|
| Page title | 28–32px | 24–28px | 650–700 |
| Section title | 20–22px | 18–20px | 600 |
| Card title | 16px | 16px | 600 |
| Body | 14–16px | 14–16px | 400 |
| Supporting | 13px | 13px | 400 |
| Label | 12–13px | 12–13px | 550 |
| Metric | 28–36px | 26–32px | 650 |

Use a comfortable line height (1.45–1.6 for body). Avoid all-caps labels except compact metadata.

## 4. Spacing and layout

Base spacing unit: 4px.

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

- Desktop content max width: 1440px.
- Sidebar: 240–256px expanded; 72px collapsed.
- Main content padding: 28–32px desktop, 16–20px tablet, 16px mobile.
- Card padding: 20–24px desktop, 16px mobile.
- Use a 12-column grid only where it adds value; prefer simple flexible layouts.

## 5. Shape, borders and elevation

- Inputs and buttons: 8–10px radius.
- Cards: 12–14px radius.
- Dialogs: 16px radius.
- Pills: full radius, reserved for status/filter chips.
- Default border: 1px solid `--color-slate-200`.
- Shadows should be subtle and rare. Use elevation to clarify overlays, not decorate every card.
- Avoid heavy outlines and nested card-in-card layouts.

## 6. Components

### Buttons
- Primary: blue fill, white text; one primary action per visual region.
- Secondary: white/slate surface with clear border.
- Tertiary: text button for low-priority actions.
- Destructive: red treatment and confirmation for irreversible actions.
- Heights: 40px compact, 44px standard, 48px prominent.
- Include hover, focus-visible, active, disabled and pending states.
- Pending state keeps width/position stable and uses text such as “Saving…”, not a spinning loader.

### Inputs
- Height 44–48px.
- Persistent label above input.
- Helpful hint below where necessary.
- Error text directly below the field.
- Use input masks only when they improve entry without blocking valid formats.
- Never rely on placeholder text as the only label.

### Cards
- White surface, subtle border, restrained radius.
- Use consistent internal spacing.
- Avoid decorative gradients and excessive shadows.

### Tables and lists
- Clear column labels, aligned numeric values and predictable row height.
- Keep primary identifier and status easy to scan.
- On narrow screens, convert to structured cards or use a clearly indicated horizontal scroll.
- Provide empty, loading and no-results states.

### Status badges
- Received: neutral slate.
- Diagnosing / in progress: blue.
- Waiting for approval / parts: amber.
- Completed / ready for pickup / collected: teal.
- Cancelled / blocked: red or neutral with clear text.
- Always include text; color is supplementary.

### Dialogs
- Use for focused decisions only.
- State the consequence in plain language.
- Keep primary action and cancel action in stable positions.
- Do not use dialogs for long forms.

## 7. Navigation

- Desktop: fixed/consistent left sidebar plus top utility bar.
- Mobile: compact bottom navigation or drawer; keep New repair prominent.
- Active route is indicated by subtle blue surface and stronger text.
- Keep labels visible; avoid icon-only navigation unless accessible labels exist.

## 8. Data visualization

- Dashboard should prioritize actionable queues and counts.
- Use charts only when they answer a real business question.
- Use direct labels and accessible contrast.
- Avoid 3D charts, excessive colors, unnecessary gauges and decorative trend lines.

## 9. Motion and feedback

- Use restrained transitions (120–180ms) for hover, focus and menu state.
- Respect `prefers-reduced-motion`.
- Do not use full-page spinners.
- Use skeletons that match known page geometry.
- Use inline progress text for unknown-duration operations.
- Provide immediate pressed/disabled feedback and clear completion messages.
- Do not shift onboarding buttons or primary controls between steps.

## 10. Responsive behavior

- Support 360px mobile width and up.
- No horizontal page overflow.
- Forms become one column on mobile.
- Keep primary actions reachable.
- Respect safe areas on mobile devices.
- Tables may transform to cards.
- Avoid hover-only actions.

## 11. UX laws

- Jakob’s Law: familiar patterns and conventions.
- Hick’s Law: fewer, grouped choices.
- Proximity: related information stays together.
- Miller’s Law: chunk long workflows and reduce memory burden.
- Von Restorff: emphasize only one or two genuinely important elements.
- Goal-gradient: show meaningful progress in multi-step tasks.
- Reciprocity: deliver immediate useful value.
- Endowment: preserve drafts and support data portability.
- Loss aversion: explain consequences and support recovery.

## 12. Anti-patterns

- Generic purple gradient SaaS dashboard.
- Every metric inside a colorful card.
- Multiple competing primary buttons.
- Icon-only buttons without accessible names.
- Skeletons that do not match final content.
- Moving buttons during onboarding.
- Toast-only validation for form errors.
- Optimistic confirmation of payments.
- Fake charts or fabricated data in production.
- Hardcoded tenant/customer information.
- Raw backend errors shown to users.
