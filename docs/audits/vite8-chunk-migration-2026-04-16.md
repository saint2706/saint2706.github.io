# Vite 8 Chunking Migration Notes — 2026-04-16

## Why this change

Vite 8 uses Rolldown for production builds. Under Rolldown, `output.manualChunks` must be
provided as a function; the previous object-form mapping fails at build time.

## Chunk strategy decision

- **Decision:** keep manual chunking, but migrate from object syntax to a function-based
  `manualChunks` implementation under `build.rolldownOptions.output`.
- **Reason:** preserving explicit vendor group names (`vendor-react`, `vendor-ui`, `vendor-ai`)
  keeps bundle comparisons stable and readable across releases.

## Before vs. after comparison

### Before upgrade (Vite 7 / Rollup baseline)

From the existing baseline audit snapshot:

- Entry chunk reported as `index-BQAvJkkD.js`.
- Shared vendor chunks include `vendor-ui-Djb_NyiB.js` and `vendor-react-DprNbJ5V.js`.
- Chunk naming used stable `vendor-*` prefixes with content hashes.

### After upgrade prep (Vite 8 / Rolldown)

- The old object-form `manualChunks` is no longer valid and triggers a build-time error.
- The migrated function-based chunk splitter keeps the same logical chunk groups and output naming
  pattern (`vendor-react-*.js`, `vendor-ui-*.js`, `vendor-ai-*.js`).
- **Current caveat:** full bundle output comparison is currently blocked by unrelated
  `lucide-react` export errors in application source imports.

## Bundle-level metrics snapshot

| Metric                         | Pre-upgrade baseline                                                       | Post-upgrade (current run)                                                  |
| ------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Total JS (dist snapshot proxy) | Dist folder snapshot: **8.9 MB**                                           | Not available (build blocked before emit)                                   |
| Largest JS chunk               | `index-BQAvJkkD.js` — **260.49 kB** (81.11 kB gzip)                        | Not available (build blocked before emit)                                   |
| Initial route payload          | Entry + shared vendor baseline led by `index`, `vendor-ui`, `vendor-react` | Expected same composition strategy; precise values pending successful build |

## Follow-up required

1. Resolve `lucide-react` import/export mismatches in app components.
2. Re-run `pnpm build` and capture emitted chunk list from `dist/assets`.
3. Update this document with post-upgrade measured values for:
   - total emitted JS bytes,
   - largest JS chunk,
   - initial route payload bytes.
