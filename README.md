# LearningPlanet Festival 2027

The website of the LearningPlanet Festival 2027, taking place in January 2027. The festival is organised by the [Learning Planet Institute](https://learningplanetinstitute.org) in partnership with UNESCO.

The site is a static site built with [Astro 5](https://astro.build). Content is available in English at `/` and in French at `/fr/`. It is deployed to GitHub Pages.

## Quickstart

Requires Node 20 and npm.

```sh
npm ci
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the build locally
```

### Sub-path QA

The production deployment on GitHub Pages serves the site from a sub-path (`https://cybercri.github.io/learning-planet.org/`) unless a custom domain is configured. To reproduce that locally:

```sh
npm run build:pages
npm run preview:pages   # → http://localhost:4321/learning-planet.org/
```

## Project structure

- `src/config.ts` — feature flags. `themes` is on; `programme`, `speakers`, and `partners` are built but held (flags off, pages noindexed and excluded from navigation and the sitemap) until the festival programme is announced.
- `src/content/` — content collections (events, speakers, partners), currently empty.
- `src/data/` — data for content that is currently displayed on the site.
- `src/i18n/` — English/French dictionaries and helpers. French pages mirror the English ones under `src/pages/fr/`.
- `src/lib/paths.ts` — deploy-base helpers. All internal links go through `localizedPath()` so the site works correctly at any base path.
- `src/assets/fonts/` — self-hosted fonts (Archivo Narrow, Roboto).

## Deployment

Pushing to `main` triggers the GitHub Actions workflow at `.github/workflows/astro.yml` (GitHub's standard Astro → Pages workflow), which builds and deploys the site.

The workflow injects the `--site` and `--base` build flags from the repository's Pages configuration (via `actions/configure-pages`), so no code changes are needed when the deployment target changes:

- On `github.io`, the site is served under `/learning-planet.org/`.
- If a custom domain is attached in the repository's Pages settings, the workflow switches to it automatically.

Note: GitHub Pages does not support server-side 301 redirects. Redirects from legacy WordPress-era URLs will be handled by the fronting host once a custom domain is in place.

## License

**Code** is licensed under the MIT License — see [`LICENSE`](./LICENSE). Copyright (c) 2026 Learning Planet Institute.

**Content** — the site's original text and visuals are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Exclusions.** The following are not covered by the CC BY 4.0 license and remain all rights reserved by their respective owners:

- Partner logos
- Speaker and team photographs
- The UNESCO and Learning Planet Institute names and logos

Bundled fonts are distributed under their own open licenses: Archivo Narrow under the SIL Open Font License, and Roboto under the Apache License 2.0 / SIL Open Font License, per their upstream distribution.
