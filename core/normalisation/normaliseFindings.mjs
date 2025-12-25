import { resolveWcagCriterion } from "./resolveWcagCriterion.mjs";
import { classifyFinding } from "./classifyFinding.mjs";
import { assignSeverity } from "./assignSeverity.mjs";

/**
 * Convert RawFindings into grouped, standards-aligned NormalisedFindings.
 *
 * Grouping rules:
 * - If a WCAG Success Criterion is resolved, group by WCAG criterion.
 * - If no WCAG criterion is resolved, group by ruleId (best-practice / non-WCAG).
 *
 * This prevents unrelated issues collapsing into a single finding
 * while keeping WCAG compliance reporting conservative.
 */
export function normaliseFindings(rawFindings = [], standard) {
  const bucket = new Map();

  for (const raw of rawFindings) {
    // Resolve WCAG criteria (may be empty or null)
    const wcagResolutions = resolveWcagCriterion(raw, standard);

    // Classify finding type (automated vs manual)
    const { classification } = classifyFinding(raw);

    // Assign severity from tool impact
    const severity = assignSeverity(raw);

    for (const wcag of wcagResolutions) {
      // Decide how this finding should be grouped
      // WCAG findings → group by WCAG criterion
      // Non-WCAG findings → group by ruleId
      const groupingId =
        wcag.wcagCriterionId !== null
          ? `wcag:${wcag.wcagCriterionId}`
          : `rule:${raw.ruleId}`;

      // Composite grouping key
      const key = [
        raw.auditRunId,
        raw.siteId,
        raw.pageId,
        raw.pageUrl,
        groupingId
      ].join("|");

      // Create a new group if this is the first occurrence
      if (!bucket.has(key)) {
        bucket.set(key, {
          auditRunId: raw.auditRunId,
          siteId: raw.siteId,
          pageId: raw.pageId,
          pageUrl: raw.pageUrl,

          // WCAG criterion when available, otherwise null
          wcagCriterionId: wcag.wcagCriterionId,

          // Preserve ruleId only for non-WCAG findings
          ruleId: wcag.wcagCriterionId === null ? raw.ruleId : null,

          classification,
          severity,

          occurrenceCount: 0,
          sourceRawFindingIds: []
        });
      }

      // Aggregate occurrence and keep traceability
      const entry = bucket.get(key);
      entry.occurrenceCount += 1;
      entry.sourceRawFindingIds.push(raw.rawFindingId);
    }
  }

  // Return grouped findings as an array
  return Array.from(bucket.values());
}
