# Contributing to CampusPilot

Thanks for contributing.

## Development Workflow

1. Fork and clone the repository.
2. Create a feature branch from `master`.
3. Keep changes scoped and atomic.
4. Run checks locally:

```bash
npm run typecheck
npm run lint
npm run build
```

5. Open a pull request with clear summary, testing notes, and screenshots for UI changes.

## Commit Guidelines

Use clear conventional-style commit messages when possible, for example:
- `feat(ui): redesign dashboard quick actions`
- `fix(sync): prevent duplicate queue replay`
- `docs: improve setup section`

## Pull Request Checklist

- [ ] Change is focused and backward-safe
- [ ] Types, lint, and build pass locally
- [ ] No secrets in code or config
- [ ] Docs updated when behavior/config changed
- [ ] UI changes include screenshots or video

## Coding Standards

- TypeScript-first with strict typing
- Validate untrusted input with Zod
- Keep server secrets server-side only
- Favor reusable components over page-local duplication
- Keep offline-first behavior intact for core CRUD

## Reporting Bugs

Use the bug report issue template and include:
- Reproduction steps
- Expected vs actual behavior
- Browser/device details
- Screenshots or logs
