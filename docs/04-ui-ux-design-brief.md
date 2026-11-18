# 04 — UI/UX Design Brief

## 1. Design objective

Create a premium, calm and highly usable business tool. It should feel dependable and fast—not flashy, generic or like a consumer social app.

The product is used in busy repair shops, often on mid-range Android phones, small laptop screens and inconsistent networks. Prioritize task completion, legibility and clear status over decoration.

## 2. Brand personality

- **Trustworthy:** financial and device records feel safe.
- **Practical:** every screen helps complete a real task.
- **Precise:** status, money and ownership are unambiguous.
- **Approachable:** plain language, helpful feedback, no intimidating enterprise jargon.
- **Efficient:** low interaction cost and fast search.

## 3. Visual direction

Use a light-first interface with a deep ink/navy foundation, crisp neutral surfaces and a restrained blue/teal accent. Reserve warm amber for waiting/attention and red for destructive or critical states. Avoid excessive gradients, glassmorphism, giant empty hero panels and decorative charts.

See root `DESIGN.md` for exact tokens and component rules.

## 4. Information hierarchy

Most screens should follow:
1. Page title and short context.
2. One primary action.
3. High-priority status or task summary.
4. Main working content.
5. Secondary metadata and less frequent actions.

Use progressive disclosure for advanced settings and rarely used fields.

## 5. UX laws and principles

Apply the requested laws where they improve the task:

- **Jakob’s Law** (interpreting “Kabob’s law” as a likely typo): use familiar patterns for navigation, search, forms, tables and status chips. Do not invent unusual interactions.
- **Hick’s Law:** limit visible choices; group advanced actions into contextual menus.
- **Proximity Law:** visually group fields and information that belong together.
- **Miller’s Law:** chunk long forms and lists; do not force users to remember many values across steps.
- **Von Restorff Effect:** emphasize one primary action or genuinely critical state; avoid making every card colorful.
- **Goal-gradient effect:** show progress in onboarding and multi-step tasks.
- **Reciprocity:** provide immediate value such as a usable receipt and clear history before asking for optional profile enrichment.
- **Endowment effect:** preserve user-created drafts and make business data exportable.
- **Loss aversion:** confirm destructive actions, explain consequences and offer recovery where possible.

Do not apply psychology to manipulate users into purchases, unnecessary data sharing or unwanted notifications.

## 6. Required interaction rules

- No full-screen spinning loader for known content. Use skeletons that match the final layout.
- For unknown-duration actions, use stable inline progress text or a progress bar where measurable.
- Every interactive control gives immediate feedback: pressed, disabled, success, validation or failure state.
- Do not move buttons during onboarding or form submission. Reserve space for feedback.
- Never expose stack traces, SQL errors, provider responses or internal error identifiers to users.
- Keep optimistic updates limited to safe, reversible operations. Reconcile or roll back when server rejects the action.
- Do not optimistically mark a payment as settled or a sensitive transition as complete.
- Use smart defaults only when safe and explainable; never silently assume a payment amount or customer consent.
- Keep the interface simple, consistent and fast.
- Avoid large uncompressed JSON responses and unnecessary client bundles.
- Use responsive, CDN-served frontend assets where architecture permits; keep the authenticated API dynamic and secure.

## 7. Accessibility

- Target WCAG 2.2 AA.
- Maintain visible keyboard focus.
- Label every form control.
- Associate validation messages with fields.
- Do not use color alone to communicate status.
- Support keyboard operation and screen readers.
- Respect reduced-motion preferences.
- Maintain sufficient text/background contrast.
- Use semantic headings, landmarks and table headers.
- Ensure touch targets are comfortably usable.

## 8. Content design

Use short, direct labels:
- “New repair”
- “Waiting for parts”
- “Ready for pickup”
- “Balance due”
- “Record payment”
- “Assign technician”

Avoid:
- “Oops! Something went wrong!!!”
- Technical error codes in user-facing copy.
- Vague success messages that do not identify what was saved.
- Blame-oriented language.

## 9. Screen quality checklist

- Is the main action obvious?
- Can a receptionist complete the task quickly?
- Are related fields grouped?
- Does the screen work at 360px width?
- Are loading, empty, error, disabled and success states designed?
- Are permissions reflected in available actions?
- Is sensitive information hidden from unauthorized roles?
- Does the design remain clear with long names and Ethiopian phone numbers?
- Are ETB values and dates formatted consistently?
- Does the UI remain stable when network latency increases?
