# Platform build notes (phase 1)

## Web

`npm run dev` starts Vite, `npm run build` writes `dist/`, and `npm run preview` serves the production build. `base: './'` keeps relative deployment usable on a root domain or sub-path. `index.html` remains a redirect to the compatible `开始游戏.html` legacy entry. The lockfile pins Vite 7.3.6 and a project-local Node 24.19.0 executable because the machine's Node 24.11.1 crashes in the Rollup native stage; npm scripts automatically prefer the local executable.

## PWA

`public/manifest.webmanifest` references the existing 192/512 PNG icons without copying or modifying them. `public/service-worker.js` uses version `columbina-travel-static-v2`, caches same-origin GET responses only, excludes storage/API data, and is registered only on HTTPS or localhost. `file://` and unsupported browsers continue without PWA.

## Tauri / Capacitor

No native projects are initialized in this phase. `tauri:*` and `cap:*` scripts are explicit not-ready placeholders and exit with an explanation. Enable Tauri after Rust/cargo and target toolchains are installed; enable Capacitor after Android SDK/Studio/JDK or macOS/Xcode are available. Both should consume Vite `dist/`, use no unnecessary permissions, and never embed API keys.

## Rollback

Remove the new Vite/PWA/platform files, remove the two added manifest/module tags from `开始游戏.html`, and restore `index.html` if the compatibility entry fails. The legacy scripts, data, image assets and save key are preserved.
