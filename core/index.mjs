// core/index.mjs

// Adapters
export { axeToRawFindings } from "./adapters/axeToRawFindings.mjs";

// Normalisation
export { normaliseFindings } from "./normalisation/normaliseFindings.mjs";
export { resolveWcagCriterion } from "./normalisation/resolveWcagCriterion.mjs";
export { assignSeverity } from "./normalisation/assignSeverity.mjs";
export { classifyFinding } from "./normalisation/classifyFinding.mjs";

// Standards
export { loadStandard } from "./standards/loadStandard.mjs";
