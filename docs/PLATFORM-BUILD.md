# Platform build notes (phase 1)

## Web

`npm run dev` starts Vite, `npm run build` writes `dist/`, and `npm run preview` serves the production build. `base: './'` keeps relative deployment usable on a root domain or sub-path. `index.html` remains a redirect to the compatible `开始游戏.html` legacy entry. The lockfile pins Vite 7.3.6 and a project-local Node 24.19.0 executable because the machine's Node 24.11.1 crashes in the Rollup native stage; npm scripts automatically prefer the local executable.

## PWA

`public/manifest.webmanifest` references the existing 192/512 PNG icons without copying or modifying them. `public/service-worker.js` uses version `columbina-travel-static-v2`, caches same-origin GET responses only, excludes storage/API data, and is registered only on HTTPS or localhost. `file://` and unsupported browsers continue without PWA.

## Tauri / Capacitor

Windows Tauri is initialized and consumes Vite `dist/`. `npm run tauri:dev` starts the local shell and `npm run tauri:build` creates MSI and NSIS bundles. The default capability is limited to `core:default`; no shell, filesystem, HTTP, network, account, or remote API permission is added. See [`TAURI-WINDOWS-RELEASE.md`](TAURI-WINDOWS-RELEASE.md) for signing, upgrade, uninstall, and release checks.

Capacitor Android is initialized and consumes the same `dist/`. Run `npm run cap:sync` after each web build. The native bridge handles Android back, lifecycle persistence, low-memory restoration, status bar, and safe-area presentation without adding unrelated permissions. iOS is generated on macOS with Xcode via `npx cap add ios`; see `CAPACITOR-MOBILE-RELEASE.md` for device validation and signing boundaries.

## Rollback

Remove the new Vite/PWA/platform files, remove the two added manifest/module tags from `开始游戏.html`, and restore `index.html` if the compatibility entry fails. The legacy scripts, data, image assets and save key are preserved.
