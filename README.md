# accessibility-audit-core

Core utilities for automated web accessibility auditing.

This package provides **standards-aware processing** of accessibility findings, including:

- Conversion of automated tool output (e.g. axe-core)
- Normalisation and grouping of findings
- Mapping to WCAG / EN 301 549 criteria
- Severity and classification logic

It is **tool-agnostic** and **framework-agnostic** by design.

## What this package is (and is not)

### ✅ This package **does**

- Convert raw accessibility tool results into structured findings
- Align findings with WCAG / EN 301 549
- Provide consistent grouping and severity logic
- Bundle and load official accessibility standards

### ❌ This package **does not**

- Crawl websites
- Run browsers
- Persist results to disk
- Generate reports or dashboards
- Provide a CLI

Those concerns intentionally live in **separate projects**.

## Installation

```bash
npm install accessibility-audit-core
```

## Basic usage

### Convert axe-core results into raw findings

```js
import { axeToRawFindings } from "accessibility-audit-core";

const rawFindings = axeToRawFindings(axeResults, {
  auditRunId: "run-123",
  siteId: "example-site",
  pageId: "home",
  pageUrl: "https://example.com"
});
```

### Load an accessibility standard

Standards are bundled with the package.

```js
import { loadStandard } from "accessibility-audit-core";

const standard = await loadStandard("EN301549_v3.2.1");
```

Currently supported:

- EN301549_v3.2.1 (WCAG 2.1)

### Normalise findings

```js
import { normaliseFindings } from "accessibility-audit-core";

const normalised = normaliseFindings(rawFindings, standard);
```

The result separates:

- **Compliance findings** (mapped to WCAG criteria)
- **Other findings** (best-practice / non-normative)

## Output model (high-level)

Normalised findings are grouped by:

- WCAG Success Criterion (when applicable)
- Tool rule ID (for non-WCAG findings)

Each finding includes:

- WCAG criterion (or `null`)
- Severity
- Classification
- Occurrence count
- Traceability to raw findings

This structure is designed for:

- Compliance audits
- Aggregation
- Reporting pipelines
- Manual audit supplementation

## Compliance philosophy

This package follows a **conservative compliance model**:

- A finding is only treated as a compliance issue when it can be reliably mapped to a normative WCAG Success Criterion.
- Best-practice and advisory issues are preserved but explicitly separated.
- No automated claim of conformance is made.

Final compliance decisions **must always involve human judgment**.

For more detail, see `NOTES.md`.

## Intended consumers

This package is designed to be used by:

- CLI audit tools
- Browser extensions
- Continuous monitoring systems
- Internal government accessibility tooling

## Notes

- Empty arrays are always returned if no findings exist.
- Compliance findings are strictly WCAG-mapped.

## License

MIT © 2025 Constantinos Evangelou
