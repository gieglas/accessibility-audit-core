# Developer Notes

## Compliance model (important)

The project deliberately separates:

- **issue detection** (tools such as axe-core)
- **compliance determination** (reference standards)

This logic is documented in detail in the README under:

> **“Compliance and Standards”**

Developers should **not**:

- infer compliance directly from tool output
- add new compliance logic without updating the reference standard

All compliance behaviour must be:

- explicit
- standard-driven
- versioned via `core/standards/`

This ensures that:

- historical audit runs remain valid
- aggregation logic can evolve safely
- compliance results remain defensible

## Architecture

```text
core/
  adapters/
  normalisation/
  persistence/
  standards/
```

- Core contains pure logic

## Why axe-core

- axe-core is industry standard

## Normalisation

Findings are split into:

- `compliance` → WCAG-mapped
- `other` → best-practice / non-WCAG

This prevents overstating compliance.

## Debug mode

Captures:

- Screenshot
- Rendered HTML

Used for diagnosing WAF, JS rendering, or bot challenges.

## Testing

Unit tests cover:

- WCAG resolution
- Normalisation
- Adapters
