# Repository Guidelines

## Companion References
Review `README.md` and `PROJECT_OVERVIEW.md` for product goals and active feature work, and consult `CLAUDE.md` for complementary agent workflow guidance.

## Project Structure & Module Organization
Prospector runs on Next.js 15 with the app router. Core UI lives in `src/app`, server actions in `src/app/actions`, and shared logic in `src/lib`. Database accessors reside under `src/lib/database`, including migrations and test doubles. Co-locate tests beside source (`src/app/__tests__`, `src/lib/database/__tests__`); sample vault data sits in `data/prospector.db`. Static assets belong in `public`, and roadmap documents in `docs/roadmaps`.

## Build, Test, and Development Commands
Use `npm install` once per machine. `npm run dev` launches the local app with Turbopack at http://localhost:3000. `npm run build` validates production readiness; always run it before release branches. `npm run start` serves the production build. Quality gates: `npm run lint` (Biome lint rules), `npm run format` to preview formatting, and `npm run fix` to apply lint+format fixes in one pass.

## Coding Style & Naming Conventions
Biome enforces two-space indentation and double quotes across TypeScript, React, and CSS. Keep components and hooks in PascalCase, utility modules in camelCase, and tests mirroring the file they cover (`page.test.tsx`, `vaults.test.ts`). Leverage the `@/` path alias for internal imports instead of relative chains. Favor Server Actions for side effects and keep database touchpoints isolated under `src/lib/database`.

## Testing Guidelines
Jest with the Next.js preset and Testing Library drive unit and integration coverage. Place new specs alongside code using the `.test.ts` or `.test.tsx` suffix. Spin up any SQLite fixtures via helpers in `src/lib/database/test-utils.ts` and avoid checking generated `.db` files into version control. Run `npm run test` locally; add `npm run test:coverage` before major refactors and keep statements coverage steady or improving.

Once a feature is complete, verify quality gates by ensuring `npm run test`, `npm run typecheck`, and `npm run check` all succeed.

## Commit & Pull Request Guidelines
Follow the existing Git log: one cohesive change per commit, imperative Title Case subject (e.g., `Improve Vault Deletion Path`), and no trailing period. PRs should describe intent, outline testing evidence (lint/test commands), and link issues or roadmap items. For UI changes, attach before/after screenshots or short Looms. Ensure automated checks pass before requesting review.
