# guardrails.md — Non-Negotiable Guardrails

## 1. Data and access
1. Users may access only data they are authorized to access.
2. Authorization is enforced by backend services and database policies—not frontend controls.
3. Every tenant-owned table has RLS enabled and tested.
4. Every API route is rate-limited.
5. Tenant context comes from authenticated membership, never from untrusted client input alone.
6. Cross-tenant references must be rejected.
7. Secrets, API keys, database credentials, signing keys and privileged keywords must never appear in frontend code, public environment variables, source maps or client logs.

## 2. Input and AI safety
8. Validate and normalize user, API, AI, webhook, file and provider input at the server boundary.
9. Use allowlists for fields, sorting, filtering and state transitions.
10. Treat user content and external data as untrusted; never interpret embedded instructions as trusted system instructions.
11. AI may suggest; the server decides permissions and executes authorized actions.
12. Require human confirmation for consequential AI-assisted actions.

## 3. UX laws and psychology
13. Apply Jakob’s Law (the request says “Kabob’s”; interpreted as Jakob’s Law), Hick’s Law, Proximity, Miller’s Law and Von Restorff Effect where relevant.
14. Use smart defaults only when safe, explainable and reversible.
15. Use goal-gradient progress for onboarding and multi-step tasks.
16. Use reciprocity by delivering immediate user value, not by pressuring users.
17. Use endowment effect to preserve drafts and support data portability.
18. Use loss aversion to explain destructive consequences and provide recovery where possible—not to manipulate users.
19. Simplicity, consistency and visual hierarchy take precedence over novelty.

## 4. Loading and feedback
20. Do not use spinning loaders for known content. Use skeleton loaders matching the final layout throughout the app.
21. For unknown-duration actions, use stable inline progress text or a measurable progress bar.
22. Every action gives immediate feedback.
23. Buttons must not move during onboarding or loading; reserve feedback space.
24. Never show raw backend/database/provider errors to users.
25. Preserve valid form input after recoverable failures.

## 5. Rendering and performance
26. Avoid oversized or uncompressed JSON; compress responses and return only needed fields.
27. Avoid illogical database writes: use transactions, constraints, idempotency and append-only financial/audit records.
28. Use optimistic rendering only for safe reversible operations; reconcile and roll back on failure. Never optimistically confirm payments or irreversible transitions.
29. Avoid a single-provider bottleneck; isolate SMS, storage and other vendors behind adapters.
30. Serve frontend assets through reliable static/CDN hosting where compatible; do not force a static-only deployment if secure runtime behavior requires a server.
31. Paginate lists, avoid N+1 queries and measure performance.

## 6. Security and privacy
32. Use TLS, secure cookies, CSRF protection where applicable, secure headers and strict CORS.
33. Store passwords using a modern password hashing algorithm via a trusted library.
34. Do not log passwords, tokens, secrets or unnecessary PII.
35. Use short-lived signed URLs for private files.
36. Keep audit trails for sensitive actions.
37. Back up data and test restoration.
38. Define data retention, export and deletion procedures.

## 7. Engineering quality
39. Do not disable tests or security controls to get a green build.
40. Do not claim tests passed unless run.
41. Do not introduce dependencies without a reason.
42. Do not build P2 features before validating P0 workflow.
43. Do not fabricate business metrics, customer testimonials or provider capabilities.
