# AppsFly engineering requirements

These rules apply to every future change in `frontend`, `backend`, and any Expo application added to this repository.

## Deployment

Production runs on Vercel. Do not add another hosting target.

The production website is `https://appsfly.cl` and the production API is `https://api.appsfly.cl`. Do not configure deployments or new operational links to `appsfly.app`; it redirects to `.cl`. Keep the specialized `optica.appsfly.app` landing and `@appsfly.app` email senders distinct from the main website.

- Frontend project: `frontend-appsfly` on team `appsflycl-7241`. A push to `main` in `SoyAlfredoDev/frontend_appsfly` deploys it. Public site: `https://appsfly.cl`. Project URL: `https://frontend-appsfly-eta.vercel.app`.
- Keep production environment variables in that Vercel project. Local-only values stay in `.env`.

## Mandatory toolchain

- ESLint is required for static analysis. New warnings must not be introduced.
- Prettier is the source of truth for formatting. Run `npm run format:check` before finishing.
- TypeScript is mandatory for new modules, tests, shared types, and configuration. Existing JavaScript may be migrated incrementally, but new untyped business logic is not allowed.
- Vitest is required for unit and integration tests.
- React Testing Library is required for React component behavior. Test accessible behavior rather than implementation details.
- Supertest is required for Express HTTP integration tests.
- Playwright is required for critical browser flows.
- GitHub Actions must run lint, formatting, type checks, tests, builds, and browser smoke tests.

## Change requirements

1. Add or update tests for every behavior change and bug fix.
2. Keep frontend, backend, and mobile contracts typed. Do not use `any` without a documented reason.
3. API errors must have stable status codes and machine-readable `code` values.
4. Empty, loading, and error states must remain distinct in user interfaces.
5. Never merge code that leaves the dashboard or a route blank after an API failure.
6. Run the relevant `npm run validate` command before declaring work complete.

## Frontend

- Use TypeScript for new React components and utilities (`.tsx`/`.ts`).
- Place component tests beside the component or under `src/test` using `*.test.tsx`.
- Prefer queries by role, accessible name, and visible text.
- Critical onboarding and authenticated navigation flows belong in `e2e`.

## Backend

- Use TypeScript for new domain services and shared request/response contracts.
- Keep Express app construction separate from process startup so Supertest can import the app.
- Unit test pure services with Vitest and test HTTP behavior with Supertest.
- Mock external systems such as Neon, Resend, Mercado Pago, and Cloudinary.

## Expo

No Expo package exists in the repository as of 2026-09-28. When it is added, it must use TypeScript, Expo's ESLint preset, Prettier, Vitest for pure modules, and React Native Testing Library for components. Native end-to-end coverage should use the project's chosen device runner while Playwright remains responsible for web flows. Add the mobile package to CI before merging it.

