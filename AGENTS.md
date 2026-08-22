# AGENTS.md

## Cursor Cloud specific instructions

This repo (`iconocracia-cv-site`) is a **static publication site + data/analysis artifact**, not a long-running app. There is no database, backend service, lint config, or automated test suite to run locally.

### Services & how to run them

- **Site build** — `npm run build` runs `scripts/build-sites.mjs`, which base64-embeds a fixed set of files (`site/index.html`, `public/og.png`, and the `analysis/huggingface-regime-coverage-2026-08-13/*` artifacts) into a single Cloudflare Worker at `dist/server/index.js`. There are **no npm dependencies** and no lockfile, so `npm ci` will fail — run the build directly. Do not run `npm install` during Cloud Agent setup; it writes an empty `package-lock.json`. Requires Node ≥ 20.11 (uses `import.meta.dirname`); the VM ships Node 22.
- **Cloud Agent install** — `.cursor/environment.json` re-runs `render_coverage.py` and `npm run build`. There is no `start` script: this is a static site, not a long-running app.
- **Worktrees** — `.worktreeinclude` lists gitignored paths to copy into new worktrees (`dist/`). Cursor Agents Window / CLI use `.cursor/worktrees.json` (same copy via `$ROOT_WORKTREE_PATH`). Claude Code reads `.worktreeinclude` directly.
- **Previewing the site.** There is no `dev`/`serve` script. The page at `site/index.html` uses relative `fetch("analysis/.../coverage.csv")`, and the deployed layout (GitHub Pages / the built Worker) places `index.html` at the web root with `analysis/` as a sibling — so opening `site/index.html` from disk or serving the repo root directly will 404 the CSV. To preview faithfully, either (a) serve the built Worker (`dist/server/index.js`, a `export default { fetch }` module) via a Workers runtime or a tiny Node `http` adapter that calls `worker.fetch(new Request(url))`, or (b) replicate the deploy layout like `.github/workflows/deploy-pages.yml` does (`index.html` + `analysis/` at root) and serve that with any static server. The Worker also rewrites `__SITE_ORIGIN__` in HTML to the request origin.

### Analysis (Python, stdlib only)

- `analysis/huggingface-regime-coverage-2026-08-13/render_coverage.py` validates `coverage.csv` (asserts 335 total / 286 coded items) and re-renders `coverage.svg`. It runs with the system `python3` and needs no packages. Regenerating the upstream query (`query.sql` via `npx parquetlens`) is optional and needs network + the public Hugging Face dataset; the CSV/SVG results are already committed.

### Notes

- `dist/` is gitignored (build output). Deployment (GitHub Pages, Cloudflare Pages, OpenAI hosting) is handled by CI/config and is not needed for local work.
- `supabase/` is documentation + seed JSON for a remote read-only project; the site does **not** call it at runtime, so no local Supabase stack is required.
