## Commits
- Never commit anything without being asked to.

## Testing
- Always build and test changes before presenting them as complete.
- Run `npm run build` after any npm-related changes and fix any errors. **Exception:** If a dev server (`npm run dev`) is already running, do NOT run `npm run build` — it clobbers the `.next` directory and crashes the dev server. Use `npx tsc --noEmit` to type-check instead.
- Never tell me to run something you haven't run and verified first.
- Test the change you're making in some way - run it, build it, lint it.

## Secrets
- Never commit `.env*` files other than `.env.example`. Secrets live in Secret Manager (see `terraform/README.md`); local values go in `.env.local`.

## Code Style (Anti-Slop)
- Be concise. Avoid verbose explanations and unnecessary prose.
- Don't over-engineer. Only make changes directly requested or clearly necessary.
- Don't add features, refactor surrounding code, or make "improvements" beyond what was asked.
- Don't add error handling, validation, or fallbacks for scenarios that can't happen.
- Don't add fallback paths or retry logic that wasn't requested. If unsure whether a fallback is needed, ask. Unrequested fallbacks are tech debt.
- Don't create abstractions, helpers, or utilities for one-time operations.
- Keep solutions simple and focused. The right amount of complexity is the minimum needed.

## Maintainability
- Prefer simple, readable code over clever code.
- Split code into separate files by concern - one component/module per file.
- Keep files small and focused. If a file is doing too much, split it.
- Use clear, descriptive names. Code should be self-documenting.
- Follow existing patterns in the codebase.
