# Frontend structure

The frontend is organized **feature-first, mirroring the backend modules** (`store`, `fuel`, `users`, `admin`, `qa`). Each feature module owns its screens, components, data access, and types. Shared, domain-agnostic code lives in `core/` and `ui/`.

## Layers

```
src/
  app/         composition root (App.tsx, providers)
  auth/        authentication & authorization
  core/        non-visual spine: http client, queryKeys (qk), types, hooks, utils
  ui/          shared presentational: layout, data, feedback, primitives, buttons, forms
  nav/         navigation registry
  screens/     top-level standalone screens (login)
  dashboard/   cross-module landing dashboard
  voice/       voice-control assistant
  management-section/<feature>/   business feature modules
```

## Feature module layout (Option C — segments)

Every feature module uses the same internal shape; a module grows into a segment only when it needs one.

```
<feature>/
  index.ts            public barrel — the ONLY entry other modules import
  <feature>.routes.tsx
  <feature>.nav.ts
  api/                REST calls + request-input types (domain-split files + index.ts barrel)
  pages/              routed screens only
  components/         feature-specific, non-routed UI (modals, cards, tables)
  hooks/              feature-specific hooks (only when needed)
  utils/              feature-specific pure helpers (only when needed)
  types.ts            feature-local types (only when needed)
```

Sectioned modules (e.g. `store`) apply this same shape to each sub-feature
(`inventory/`, `goods-issuing/`, …); the module root only composes routes/nav and re-exports.

## Import rules

1. **Cross-module imports go through the barrel only:** `@store`, `@fuel`, `@store/inventory`.
   Never reach into another module's internals (`@fuel/components/...`, `@store/inventory/api/...`).
2. **Within a feature, use relative imports:** `../api`, `../components/X`, `../utils/X`.
   This avoids barrel import cycles (a page importing a barrel that re-exports it).
3. Shared domain DTOs live in `@core/types`. Feature-local types live in the feature's `api/` files or `types.ts`.
4. Shared UI goes to `@ui`; shared pure helpers to `@core/utils`.

## Where does X go?

```
Used by 2+ feature modules, domain-agnostic   -> src/ui/**
Cross-cutting but domain-aware (picks an entity) -> src/ui/primitives/
Used only inside one feature                   -> that feature's components/ (or hooks/utils)
```

## Aliases

Bare barrel aliases (`@fuel` -> `fuel/index.ts`) and wildcard aliases (`@fuel/*`) are defined in
`tsconfig.json` and `vite.config.ts`. Keep the two in sync.
