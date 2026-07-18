# Wube Bereha Development Rules

## Project purpose

Wube Bereha is a nationwide Habesha community discovery platform for Ethiopian and Eritrean communities in the United States.

Primary sections:

1. Habesha Events & Activities
2. Restaurants, Coffee & Lounges
3. Health & Wellness
4. Education & Training
5. Communities & Networking

## Architecture

- frontend/: Next.js App Router with TypeScript
- backend/: Spring Boot REST API
- database: PostgreSQL
- hosting: Render
- frontend and backend must remain independently deployable

## Frontend standards

- Use Next.js App Router.
- Use TypeScript in strict mode.
- Use Tailwind CSS.
- Use shadcn/ui where appropriate.
- Use mobile-first responsive design.
- Build reusable components.
- Avoid duplicated components and API logic.
- Use Server Components by default.
- Use Client Components only when browser interactivity is required.
- Use semantic HTML and accessible controls.
- Support Ethiopic characters, including ውቤ በረሃ.
- Do not hard-code production URLs.
- Read the backend URL from environment configuration.
- Every public event and listing page must include SEO metadata.
- Include loading, empty, and error states.
- Never use mock data in production code.

## Backend rules

- Do not delete or rewrite working Spring Boot code without an explicit task.
- Do not change database schemas without a reviewed migration.
- Do not expose database credentials to the frontend.
- Backend validation remains authoritative.
- Preserve existing REST API contracts unless explicitly instructed.

## Safety rules

- Before deleting files, identify them and explain why they are safe to delete.
- Never delete backend files while replacing the frontend.
- Run lint, type checking, tests, and production build after each major task.
- Complete one task at a time.
- Do not begin the next phase when the current phase has errors.
- Do not commit secrets.
