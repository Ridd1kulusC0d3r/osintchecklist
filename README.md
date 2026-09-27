# OSINT Checklist // Analyst Workbench

**Interface languages:** 🇧🇷 Português (Brasil) · 🇺🇸 English · 🇪🇸 Español

The interface auto-detects the browser language, allows manual switching, and keeps the language preference locally. Checklist content, task statuses, process insights, Markdown exports and printable/PDF reports are localized.

A **local-first investigation checklist** for analysts who need a repeatable, auditable workflow for open-source research.

The primary goal is deliberately boring and important: **help the analyst avoid skipping steps**.

Instead of another directory containing hundreds of OSINT tools, this project focuses on the investigation process:

**scope → plan → collect → document → corroborate → analyze → report → review**

> Data is stored locally in the browser by default. Do not record unnecessary personal data, credentials, secrets, or information you are not authorized to process.

## What it does

- Dynamic investigation checklist with progress by phase
- Scenario filters for general OSINT, people/entities, organizations, cyber/infrastructure, fraud/scams and media verification
- Per-task status, analyst notes and evidence/source references
- Local persistence with no backend required
- Export the case state as JSON
- Export a structured Markdown investigation report
- Generate a printable report that can be saved as PDF by the browser
- Produce **process insights** such as incomplete critical steps, weakly documented findings and investigation gaps
- Reset the workspace without leaving case data in the repository

## What it does not do

This project does **not** automate attribution, identify people from weak indicators, treat a checklist as proof, or turn assumptions into facts.

A checked box means that a procedure was performed. It does not mean the hypothesis was confirmed.

## Core principles

1. **Question before collection** — define the intelligence requirement and decision to be supported.
2. **Minimization** — collect only what is relevant and proportionate.
3. **Traceability** — record where information came from and when it was observed.
4. **Fact / inference separation** — distinguish observed information from analyst judgment.
5. **Corroboration** — important claims should not rely on a single weak source.
6. **Uncertainty** — confidence and information gaps belong in the final product.
7. **Reproducibility** — another analyst should be able to understand how a conclusion was reached.
8. **Closure** — document unresolved questions and stop conditions instead of searching forever, humanity's favorite research methodology.

## Quick start

This repository is intentionally deployable as a static site.

1. For GitHub Pages, configure **Settings → Pages → Deploy from branch → main / root**.
2. For local use, run a small static server from the repository, for example:
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000`.
3. Start a case, select the investigation profile, and work through the phases.
4. Export JSON periodically as a case backup.
5. Export Markdown or use **Print / PDF** for the final handoff.

> Opening `index.html` directly with `file://` may prevent the browser from loading `data/checklist.json` because of local-file security rules.

## Investigation phases

The default checklist covers:

- Intake & intelligence requirement
- Scope, legal/ethical review and data minimization
- OPSEC and collection environment
- Known facts, identifiers and assumptions
- Search/discovery strategy
- Social and public-profile research
- Username and identifier pivots
- Email and phone exposure checks
- Organization and public-record research
- Domain and infrastructure research
- Image/video and metadata verification
- GEOINT and temporal verification
- Timeline and relationship analysis
- Source evaluation and corroboration
- Evidence preservation
- Analysis, confidence and alternatives
- Reporting, review and closure

## Architecture

```
.
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── data/
│   ├── checklist.json
│   ├── translations.en.json
│   └── translations.es.json
├── docs/
│   ├── METHODOLOGY.md
│   └── PRIVACY.md
├── LICENSE
└── README.md
```

The canonical checklist structure is kept in `data/checklist.json` (pt-BR). English and Spanish text overlays live in `data/translations.en.json` and `data/translations.es.json`. Stable task IDs keep case progress intact when the analyst changes languages.

## Methodological references

The project is not a clone of any single framework. Its workflow is informed by established guidance on open-source investigation, analytic rigor and evidence handling:

- **Berkeley Protocol on Digital Open Source Investigations**, OHCHR + Human Rights Center, UC Berkeley  
  https://www.ohchr.org/sites/default/files/2022-04/OHCHR_BerkeleyProtocol.pdf
- **ICD 203 — Analytic Standards**, Office of the Director of National Intelligence  
  https://www.dni.gov/files/documents/ICD/ICD-203.pdf
- **NIST SP 800-86 — Guide to Integrating Forensic Techniques into Incident Response**  
  https://csrc.nist.gov/pubs/sp/800/86/final
- **Bellingcat Online Investigation Toolkit**  
  https://bellingcat.gitbook.io/toolkit

See [Methodology](docs/METHODOLOGY.md) for how these ideas are translated into the checklist.

## Privacy and safe use

This project is designed for lawful open-source research.

- Prefer aliases/case references over real names in saved workspace data.
- Do not store passwords, authentication material or unnecessary sensitive information.
- Respect applicable law, contractual restrictions and platform rules.
- Do not use the project for harassment, stalking, doxxing, unauthorized access or deceptive contact.
- Treat leaked or exposed information as potentially sensitive; minimize collection and preserve only what is necessary for an authorized purpose.

See [Privacy & data handling](docs/PRIVACY.md).

## Roadmap

### v0.1 — Analyst checklist
- [x] Dynamic checklist
- [x] Local persistence
- [x] Scenario filters
- [x] Notes and source references
- [x] Progress indicators
- [x] JSON export
- [x] Markdown report export
- [x] Print / PDF report
- [x] Process-gap insights

### v0.2 — Evidence workflow
- [ ] Evidence register
- [ ] Source reliability / information credibility fields
- [ ] Timeline builder
- [ ] Relationship matrix
- [ ] Import/export case bundles

### v0.3 — Optional assisted analysis
- [ ] Explicit opt-in AI provider integration
- [ ] User-supplied API configuration stored locally
- [ ] Summarization only from analyst-selected evidence
- [ ] Claim-to-source traceability
- [ ] No autonomous attribution

## Contributing

Useful contributions improve the **method**, not merely the tool count.

Good pull requests include:

- a missing procedural check;
- a better description of why a check matters;
- a source-validation technique;
- a reporting/evidence template;
- a jurisdiction-neutral privacy improvement;
- a reproducible lab using synthetic or authorized data.

## License

MIT. See [LICENSE](LICENSE).
