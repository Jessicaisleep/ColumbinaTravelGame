# Save data compatibility (phase 1)

The live game continues to use `src/store.js` and localStorage key `nahida-travel/save/v2`. `src/storage/save-api.js` exposes an ES Module facade for future code but is intentionally not wired into the legacy initializer yet.

Current storage is JSON in localStorage. It contains home, active trip, album, statistics, farm, inventory, toys, visitor state and settings. It does not use IndexedDB, cookies or a service-worker cache.

Future migration requirements: add a separate `schemaVersion`; preserve the old key for reads; keep `migrateSave` pure/idempotent; back up before destructive migration; map IDs explicitly; test malformed JSON, missing fields, old active trips, time rollback and import/export round trips.
