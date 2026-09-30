# Astro — Notebook

A working prototype of the notebook an underwriting team would use to run an agent in
production: which files are waiting on a person, which bundle changes actually beat
baseline, what the bundle contains, and where the human time and money go.

The domain is HELOC file review. A **bundle** is a versioned agent (model, tools, skills,
policy cards). An **eval** grades a bundle against a corpus with ground truth, so it reports
accuracy with a confidence interval. A **batch** is production work with no ground truth, so
it reports autonomy and leans on blind review for accuracy.

## Origin

This repository is hosted on Cursor Origin. Origin is the source of truth; do not retarget
the `origin` git remote to GitHub.

- Browse: [cursor.com/codebase/sebastian-mendo/next-dash](https://cursor.com/codebase/sebastian-mendo/next-dash)
- Clone: `https://origin.cursor.com/sebastian-mendo/next-dash.git`

Install the Origin CLI, sign in (this also sets up git credentials for Origin remotes), then
clone:

```bash
curl -fsSL https://downloads.cursor.com/origin/install.sh | sh
# If `origin` is not found: export PATH="$HOME/.local/bin:$PATH"
origin auth login
git clone https://origin.cursor.com/sebastian-mendo/next-dash.git
cd next-dash
```

Or, after the same install and login: `origin repo clone sebastian-mendo/next-dash`.

Push and pull with ordinary git. Open pull requests with the Origin CLI (`origin pr create`,
`origin pr list`, `origin pr view`) or from the Pull requests tab on the codebase page.

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). No API keys, no database, no
services.

```bash
npm test        # the spec acceptance criteria
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint
npx tsc --noEmit
```

## Deploying

Every route is server-rendered on demand, because the root layout reads the theme
and role cookies so `data-theme` is correct in the first byte. Nothing needs
environment variables or provisioned services.

Connect **Vercel** from the repository **Settings → Apps** tab at
[cursor.com/codebase](https://cursor.com/codebase/sebastian-mendo/next-dash) so pushes and
pull requests can deploy without leaving Origin. Depot and Buildkite are the CI apps for
Origin-hosted repos if you want checks on PRs.

Until that app is connected, deploy with the Vercel CLI. It is deliberately not a project
dependency: it is a deploy tool, and adding it would make everyone cloning the repo install it.

```bash
npx vercel login
npx vercel deploy --prod
```

To hand someone a URL without an account, `npx vercel deploy --temporary` returns a
claim link and expires in an hour if nobody claims it.

## The pages

| Route | What it is |
| --- | --- |
| `/` | Overview — metrics, then the held queue, ledger and open attempts as sections |
| `/ask` | A chat surface that answers from the real datasets, and can propose actions |
| `/attempts` | Six attempts as a board, a timeline, or a list |
| `/attempts/[slug]` | One attempt: what changed by procedure step, and what it did to the queue |
| `/experiments` | Interval plot, graded-against-sampled gap, every experiment, field failures |
| `/experiments/new` | The runner: hypothesis, corpus, run count, and the interval that n will buy |
| `/governance` | Bundle contents by version, with a six-dimension compare |
| `/governance/promote` | The promotion gate — seven conditions, each stated individually |
| `/reports` | Ten batches measured in production, plus compliance |
| `/batches/[id]` | Every file in a batch, filterable by state |
| `/batches/[id]/files/[fileId]` | A held file, at the point the run paused |
| `/verify` | Blind review of a randomly drawn clean file |
| `/settings` | Appearance and acting role; everything else names its owner |

Filter and version state lives in the URL (`?filter=cleared`, `?v=0.11.0`, `?compare=1`), so
any view can be linked or reloaded.

## The specs are the source of truth

[`specs/`](specs) governs this repository — ten documents covering the invariants, the
domain model, the interrupt types, the verdict logic, governance, the metrics
dictionary, the surfaces, and the visual language. The UI follows from them.

The invariants are executable rather than aspirational. `verdict()` is transcribed
from `04 §2` and has no setter; the INV-4 gate blocks a promotion in a test that
attempts it; a resolution that cannot write a labelled case throws. 115 tests in
[`tests/`](tests) are numbered to match the spec each criterion came from.

[`specs/CONFORMANCE.md`](specs/CONFORMANCE.md) records what is met, what is partial,
and what is deferred with a reason. It also records the three defects found in the
specs while implementing them, including one where the ledger's own worked example
contradicts the verdict function the same spec defines.

## What is and isn't real

Every page, chart, filter, form, and navigation path works. The datasets in
[src/lib/data](src/lib/data) are fixed and internally consistent — the ledger, the interval
plot, the field-failure table, and the governance diff all describe the same six bundles.

There is no backend. Resolving a held file writes a case to a session store and drops
the file off the queue, which is how the queue reaches the zero state the specs call
the design target, but nothing survives a hard reset. Contracts that `02` assigns to a
write path are guarded constructors that throw, with tests asserting the throw — the
closest a client-only build gets to a database constraint, and recorded as deferred
rather than claimed. Ask reads the real datasets rather than calling a model.

Every derived figure is computed deterministically, so server and client always agree.

## How it is built

- **Next.js App Router** with TypeScript. Pages are server components; only the shell
  controls, the interrupt forms, and the review list are client components.
- **Design tokens in Tailwind v4** `@theme` ([src/app/globals.css](src/app/globals.css)) —
  `ink`, `paper`, `panel`, `line`, plus the `keep` / `discard` / `hold` verdict semantics.
  Light and dark both live on `[data-theme]`.
- **Structural CSS** in [src/app/notebook.css](src/app/notebook.css) under
  `@layer components`, so Tailwind utilities still override it.
- **Charts are hand-written SVG** ([src/components/charts](src/components/charts)) with no
  charting library. They render on the server and pick up theme colours through CSS
  variables, so switching themes needs no JavaScript.
- **The theme toggle holds no React state** — a blocking script sets `data-theme` before
  first paint and the button label swaps in CSS.

The interval plot replaces a trend line deliberately: with five runs the interval is roughly
±2 points, so most bundles in the ledger cannot be distinguished from baseline, and a line
chart would have drawn them as progress.
