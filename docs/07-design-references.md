# 07 — Design References and Skill Workflow

The project request named Awesome DESIGN.md, Impeccable, Taste, Web Design Guidelines and UI UX Pro Max. These are useful references for design-system authoring, interface critique and implementation quality. They are not all installed in the current coding environment; this document records how to use them when available. Do not claim a skill was executed unless it was actually installed and invoked.

## 1. Awesome DESIGN.md
Reference: https://github.com/VoltAgent/awesome-design-md

Use it to study how a design system document describes:
- Visual theme and atmosphere.
- Semantic color roles.
- Typography hierarchy.
- Component styles and states.
- Layout, spacing and elevation.
- Responsive behavior.
- Do/don't rules and prompts for agents.

For FixFlow, `DESIGN.md` in this repository is the original product-specific design source of truth. Do not copy a competitor's entire brand system.

## 2. Impeccable
Reference: https://github.com/pbakaus/impeccable

Use for:
- Design critique and polish.
- Stronger hierarchy and layout.
- Better typography and color decisions.
- UX copy and interaction refinement.
- Accessibility and responsive review.
- Capturing and maintaining design-system rules.

Workflow:
1. Ask the skill to audit a screen.
2. Review findings against FixFlow's actual user tasks.
3. Implement a bounded set of high-impact fixes.
4. Inspect desktop and mobile together.
5. Stop after defects are corrected; avoid endless decorative polishing.

## 3. Taste
The exact “Taste” skill/repository was not identified from the supplied name alone. Do not invent its source or claim it was used. If the user provides the exact repository or installs the intended skill, review its license and instructions and add it to the workflow. Until then, use the quality principles in this brief: distinctive visual point of view, restraint, hierarchy, coherent details and user-first craft.

## 4. Web Design Guidelines
Use current web platform and accessibility guidance:
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- MDN Web Docs: https://developer.mozilla.org/
- web.dev performance guidance: https://web.dev/
- OWASP Cheat Sheet Series for security-sensitive UI flows: https://cheatsheetseries.owasp.org/

Validate semantic HTML, keyboard support, focus visibility, contrast, reduced motion, responsive behavior, performance and secure form handling.

## 5. UI UX Pro Max
Reference: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Use it, when installed, as a searchable design decision aid for:
- Product-specific UI patterns.
- Palette and typography exploration.
- UX guidelines.
- Chart selection.
- Stack-specific implementation recommendations.

Treat generated recommendations as candidates, not truth. Validate against FixFlow's users, design tokens, accessibility and real device constraints.

## 6. Recommended design workflow

1. Read `DESIGN.md` and this brief.
2. Inspect existing screens and code.
3. Define user, task and success state.
4. Select a visual pattern; avoid generic dashboard templates.
5. Apply design tokens and accessible components.
6. Implement all interaction states.
7. Review at 360px, tablet and desktop.
8. Run accessibility and performance checks.
9. Record any new design-system decision in `DESIGN.md`.

## 7. Licensing and attribution

Check each tool's current license and installation instructions before adding it to a project. Do not copy paid/proprietary skill content into this repository. Link to upstream references and write original FixFlow-specific rules.
