# CLAUDE.md — Citatio

> **Source of truth** for this repository. Every agent and every contributor reads this first.
> The old `.github/copilot-instructions.md` has been migrated here.

---

## 1. Product positioning (READ THIS — the business is pivoting)

Citatio **was** a pure **GEO** (Generative Engine Optimization) shop — making businesses
visible inside AI answers (ChatGPT, Gemini, Google AI Overview).

Citatio **is becoming** a **web studio that builds showcase websites ("sites vitrines")**,
with **SEO and GEO sold as options on top**, plus operational add-ons:

- **Core offer:** showcase website design & development.
- **Options:** SEO package, GEO package, **hosting included**, **domain name**, ongoing maintenance.
- **Beyond the showcase (this is why a backend exists):** the platform is **not vitrine-only long
  term**. Planned product surface includes:
  - a **blog** with published articles on various topics → backend module **`u2-blog`**.
  - **email sending** (contact, transactional, later marketing) → backend module **`u1-communication`**.

The detailed offer matrix, pricing placeholders and **business diversification ideas** live in
[`docs/product/offres.md`](docs/product/offres.md). The `product-owner` agent owns that document.

### ⚠️ 1.1 Critical distinction — the Citatio site vs. the service we sell to clients

These two are **easy to confuse**. On every task, be explicit about which one it concerns, and ask if
it is unclear:

- **The Citatio website itself** → *the owner's own site* (this repo). When a request says "build a
  page", "improve SEO", "add a blog", the **default subject is Citatio's own marketing site**, owned by
  the owner (Marius).
- **The service we sell to clients** → building showcase sites + SEO/GEO options, hosting, domain,
  maintenance, etc. **for other businesses** (Citatio's clients). These are the **commercial offers** in
  `docs/product/offres.md`; they are *not* features of this codebase.

Always name the concerned party — **owner (le site Citatio)** vs **clients (les offres)** — in plans,
stories, and code comments where relevant.

### 1.2 Branding & domain (decided)

- **Name: `Citatio`** (validé) — drop the "GEO" suffix to match the broader positioning. `legalName`
  is already `Citatio`.
- **Domain: keep `citatio-geo.com`** — `citatio.fr` / `citatio.com` are owned by third parties and not
  available; the exact domain string matters little (visual/content quality matters more). No domain
  change for now.
- Code still carries the old `Citatio GEO` name in `frontend/src/app/config/company.config.ts`,
  `frontend/src/app/app.routes.ts` (SEO titles), the footer, and GEO-centric copy. The
  **rebrand + repositioning of the site copy is a P0 task** (see `docs/product/offres.md`), to be done
  deliberately by `frontend-angular` — not as scattered unilateral renames.

---

## 2. Repository map

```
citatio/
├── CLAUDE.md                 ← you are here (source of truth)
├── docs/product/offres.md    ← offers, pricing, diversification (product-owner owns)
├── .claude/agents/           ← expert agent personas (see §6)
├── docker-compose.yml        ← full stack orchestration
├── Caddyfile                 ← reverse-proxy / gateway (API routing + TLS)
├── frontend/                 ← Angular 21 app (SSR enabled)
└── backend/                  ← Maven multi-module Spring Boot microservices
    ├── pom.xml               ← parent POM
    ├── common-libs/          ← shared DTOs / config (NO cross-module DB joins)
    ├── u1-communication/     ← email / contact / comms microservice (own DB: citatio_u1_db)
    └── u2-blog/              ← blog microservice (own DB: citatio_u2_db)
```

**Service routing (Caddy):** `/api/u1/*` → `u1-communication:8080`, `/api/u2/*` → `u2-blog:8080`,
everything else → Angular frontend.

---

## 3. Frontend stack & conventions (Angular 21)

**Stack:** Angular 21+ (`@angular/build:application`, esbuild) · **SSR** (`@angular/ssr`) ·
PrimeNG 21+ themed via `@primeuix/themes` (**Aura** preset customized in
`frontend/src/app/theme/citatio-preset.ts`, `darkModeSelector: '.dark'`) · **Tailwind CSS v4**
(`@tailwindcss/postcss`, configured in `postcss.config.json` — **never** `.js`) · PrimeIcons ·
**Vitest** (unit) · **Playwright** (e2e) · **plain CSS** (no SCSS) · dark mode via signal-based
`ThemeService` toggling `.dark` on `<html>`.

**Hard rules (these are non-negotiable):**
- Standalone components only. **Do not** set `standalone: true` (redundant in v19+).
- `ChangeDetectionStrategy.OnPush` in **every** component.
- Signals for all reactive state · `computed()` for derived state · **never** `mutate` (use `set`/`update`).
- `inject()` for DI — **never** constructor injection.
- `input()` / `input.required()` / `output()` — **never** `@Input()` / `@Output()` decorators.
- Native control flow `@if` / `@for` / `@switch` only. **No** arrow functions in templates.
- Three separate files per component: logic `.ts`, template `templateUrl` `.html`, styles `styleUrl` `.css` (singular `styleUrl`, `.css` extension).
- `host: {}` object — **never** `@HostBinding` / `@HostListener`.
- `NgOptimizedImage` for static images. Lazy-load every feature route.
- **No** `ngClass` / `ngStyle` — use `[class.x]` bindings or static Tailwind classes.
- Reactive forms, not template-driven.

**Styling:**
- Tailwind utilities in templates for layout/spacing/typography/color/responsive. Always ship `dark:` variants.
- Component `.css` minimal — only `:host`, animations, or what Tailwind can't express.
- Global base styles → `@layer base` in `styles.css`. Reusable component classes → `@layer components`
  with the **`ct-`** prefix and `@apply` (e.g. `.ct-card`, `.ct-page-title`).
- PrimeNG design tokens only for PrimeNG component theming.

**TypeScript:** strict mode · prefer inference when obvious · never `any` (use `unknown`).

**Accessibility (MUST):** pass all AXE checks · WCAG **AA** minimums (focus management, color
contrast, ARIA via PrimeNG a11y).

---

## 4. Backend stack & architecture (Java 21 / Spring Boot 4)

**Stack:** Java 21 (virtual threads, records, pattern matching) · Spring Boot 4.0.2 · Spring Data JPA
· PostgreSQL · Lombok · Maven (multi-module, parent POM) · JUnit 5 + Mockito.

**Modular microservices architecture:**
- **One DB per module.** Cross-module DB joins are **FORBIDDEN**.
- Modules talk to each other **only via REST** — use Spring **`RestClient`** (not `RestTemplate`),
  with proper resilience (timeouts, 4xx/5xx handling).
- Each module runs and is tested **independently**.
- Shared DTOs / utilities live in **`common-libs`** — never duplicate, never leak module internals.

**Java & Spring rules:**
- **Records** for all DTOs / request / response / projection types.
- Constructor injection via `final` fields + `@RequiredArgsConstructor`. **No `@Autowired` on fields.**
- Leverage virtual threads for I/O-bound work.
- Functional style: `Optional`, Streams, lambdas over imperative null-checks / loops.
- `jakarta.validation` (`@NotNull`, `@Size`, …) on request DTOs, validated with `@Valid`.

**Data & persistence:** soft deletes (flag/status, avoid hard deletes) · paginate list endpoints
(`Page<T>` / `Slice<T>`) · **Flyway/Liquibase** migrations over `ddl-auto: update` · snake_case columns.

**API design:** plural noun resources (`/articles`, `/messages`) · strict HTTP semantics ·
`@RestControllerAdvice` returning **RFC 7807 Problem Details** · status codes: 201 create / 204 delete /
400 validation / 404 missing.

**Prohibitions:** no field injection · no business logic in controllers (logic → `@Service`) ·
**never expose JPA entities** (map to record DTOs) · no `System.out.println` (use SLF4J `@Slf4j`) ·
no raw types.

**Lombok:** prefer `@Getter`/`@Setter`/`@ToString` over `@Data`; on entities scope `@EqualsAndHashCode`
to the business key/ID; `@Builder` for complex instantiation.

---

## 5. Conventions & workflow

- **Commits:** Conventional Commits in **French** (matches history): `feat:`, `fix:`, `chore:`, `docs:`…
  Co-author trailer is added automatically by the harness.
- **Branches:** feature branches off `master` (e.g. `Modules-Blog/Communication-init`,
  `seo-geo-optimisation`). Never commit straight to `master`.
- **Commit / push only when the user asks.**
- **Code comments & symbols in English; UI copy in French (`fr_FR`).**

---

## 6. Expert agents

Specialized personas live in `.claude/agents/`. Delegate to the matching one:

| Agent | Use it for |
|-------|-----------|
| `frontend-angular` | Angular 21 components, signals, PrimeNG, Tailwind, SSR, a11y |
| `backend-spring` | Spring Boot 4 microservices, JPA, REST APIs, inter-module calls |
| `product-owner` | Offers, pricing, user stories, roadmap, `docs/product/offres.md` |
| `tech-lead` | Cross-stack architecture, code review, technical arbitration, orchestration |
| `devops-infra` | Docker, Caddy, CI/CD, deployment, environments |
| `qa-testing` | Vitest, Playwright e2e, JUnit/Mockito, test strategy & coverage |
| `ux-ui-design` | Design system, accessibility, conversion-oriented UI/UX |

When in doubt about scope or priorities, **ask the owner** — this project tolerates **no ambiguity**.
