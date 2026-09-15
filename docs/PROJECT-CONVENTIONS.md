# Project conventions (phase 1)

This document describes the Vite/ES Module layer added around the legacy game. The legacy `NT` namespace and Chinese asset names remain supported.

## Directories

- `src/main.js`: Vite entry and platform bootstrap.
- `src/legacy-entry.js`: compatibility boundary; must not initialize `NT.app` twice.
- `src/core`, `src/data`, `src/engine`, `src/render`, `src/text`, `src/time`: legacy modules retained until individually migrated.
- `src/storage`, `src/assets`, `src/pwa`: new platform-facing ES Modules.
- `public`: files served as-is by Vite (manifest and service worker).
- `scripts`: static checks; `tests` is reserved for future fixtures.

## Naming and data

New files use lower-case English or kebab-case names and camelCase variables. Stable English IDs are preferred; display text must not be a logical ID. Existing Chinese filenames are not renamed in phase 1. Data, text and rendering stay separate; future content uses explicit `id`, `version`, `speaker`, `tags`, `conditions` and `variables`.

## Storage and versions

The legacy key `nahida-travel/save/v2` is unchanged. Future schema migrations must be explicit and testable; content version and save schema version are separate. Service-worker cache versions must be bumped when static assets change and must never contain saves.

## Compatibility rules

Do not remove `NT`, reorder legacy scripts, add a second initializer, or place API keys in source. Every module migration must document its inputs/outputs and retain a temporary bridge.
