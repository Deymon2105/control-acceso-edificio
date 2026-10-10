# AGENTS.md

Building-access control web app for conserjería: visitor check-in/check-out, deliveries, security restrictions, live capacity monitor (emergency), shift log. Op-only by `CONSERJE`/`ADMIN` staff — no resident portal. Everything is Spanish: UI labels, DTOs, messages, and enum constants (`EN_ESPERA`, `AUTORIZADO`, `RECHAZADO`, `FINALIZADO`, `ENTREGADO_A_RESIDENTE`); visitor ID is "RUT".

## Source of truth
- `docs/CONTEXT.md` — product spec, roles, visit state machine, layered-arch conventions, and dev rules: contracts-first (define in/out DTOs + HTTP codes before controllers/components), strict typing (no `any`, no `Map<String,Object>` in controllers), centralized errors (`@RestControllerAdvice` with standard `{timestamp,status,error,message,path}`), keyboard-first forms (`autoFocus` + Enter). Read before implementing features.
- `docs/google-stitch.md` — exact dark-blue UI design tokens (e.g. bg `#0a0f1e`, accent `#2563eb`) and screen specs.
- Versions drift: spec docs say React 18 / Spring Boot 3.x / `docker/` + Postgres 16, but the real scaffold is React 19 + Vite 8 + TypeScript 6 + oxlint, and Spring Boot 4.1.1 (Java 21). Trust manifests over docs. There is no `docker/` dir and no DB config yet.

## Layout
- `frontend/` — React 19 + Vite SPA. Key deps: `@tanstack/react-query`, `@tanstack/react-table`, `react-hook-form` + `zod` + `@hookform/resolvers`, `lucide-react`. No test framework.
- `backend/` — Spring Boot 4.1.1, Java 21, Maven wrapper, package `com.edificio.backend`. Deps: data-jpa, security, validation, webmvc+webflux, postgres (runtime), lombok (annotationProcessorPaths already configured).
- `docs/` — spec files above.

## Commands
Frontend (from `frontend/`):
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (typecheck runs as part of build)
- `npm run lint` — oxlint, not eslint

Backend (from `backend/`):
- `./mvnw spring-boot:run`
- `./mvnw test`

## Gotchas
- Backend `application.properties` only sets the app name — no datasource configured. With data-jpa on the classpath, startup and `contextLoads` tests fail until a DB URL is set (docs plan Postgres with `ddl-auto=update`).
- `frontend/src/App.tsx` / `App.css` are the untouched Vite starter demo (counter page) — replace them rather than build on top.