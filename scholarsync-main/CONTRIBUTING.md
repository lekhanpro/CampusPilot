# Contributing to ScholarSync

Thanks for your interest in contributing to ScholarSync! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/scholarsync.git
   cd scholarsync
   ```
3. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```
4. **Set up environment variables** — see the [README](README.md) for details.
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development

Start the dev server:

```bash
npm run dev
```

This runs both the frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

## Code Style

- **TypeScript** is required for all new code (client and server).
- **Tailwind CSS** for styling — avoid writing custom CSS unless absolutely necessary.
- Use **functional components** with hooks in React.
- Keep functions small and focused.
- Name files using PascalCase for components (`FeatureCard.tsx`) and camelCase for utilities (`useChat.ts`).

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add document search filtering
fix: correct page number offset in citations
docs: update setup instructions for Supabase
refactor: extract embedding logic into service
```

Prefixes: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.

## Pull Requests

1. Keep PRs focused — one feature or fix per PR.
2. Update the README if your change affects setup or usage.
3. Make sure the project builds without errors:
   ```bash
   cd client && npx tsc --noEmit && cd ..
   cd server && npx tsc --noEmit && cd ..
   ```
4. Write a clear PR description explaining **what** and **why**.
5. Link any related issues.

## Reporting Bugs

Use the [Bug Report](https://github.com/lekhanpro/scholarsync/issues/new?template=bug_report.md) issue template and include:

- Steps to reproduce
- Expected vs. actual behavior
- Browser/OS/Node version
- Screenshots if applicable

## Suggesting Features

Use the [Feature Request](https://github.com/lekhanpro/scholarsync/issues/new?template=feature_request.md) issue template.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
