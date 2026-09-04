# Astro — Notebook

A working prototype of the notebook an underwriting team would use to run an agent in
production: which files are waiting on a person, which bundle changes actually beat
baseline, what the bundle contains, and where the human time and money go.

The domain is HELOC file review. A **bundle** is a versioned agent (model, tools, skills,
policy cards). An **eval** grades a bundle against a corpus with ground truth, so it reports
accuracy with a confidence interval. A **batch** is production work with no ground truth, so
it reports autonomy and leans on blind review for accuracy.

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). No API keys, no database, no
services.
