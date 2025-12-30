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
 * Output structure:
 * - compliance: findings that map to the reference standard (WCAG / EN 301 549)
 * - other: best-practice or non-standard findings
 *
 * Empty arrays are always returned to keep the result schema stable.
 */
export function normaliseFindings(rawFindings = [], standard) {
  /**
   * Internal aggregation bucket.
   *
   * Keyed by:
   *   auditRunId | siteId | pageId | pageUrl | groupingId
   *
   * groupingId is either:
   * - wcag:<criterionId>   → compliance finding
   * - rule:<ruleId>        → non-compliance / best-practice finding
   */
  const bucket = new Map();

  // ----
  // Step 1: Iterate over raw findings
  // ----
  for (const raw of rawFindings) {
    /**
     * Resolve WCAG Success Criterion mappings for this finding.
     *
     * This may return:
     * - one or more WCAG mappings
     * - a single fallback entry with wcagCriterionId = null
     */
    const wcagResolutions = resolveWcagCriterion(raw, standard);

    // Classify finding type (automated vs manual)
    const { classification } = classifyFinding(raw);

    // Assign severity based on tool impact
    const severity = assignSeverity(raw);

    // ----
    // Step 2: Aggregate each WCAG (or fallback) resolution
    // ----
    for (const wcag of wcagResolutions) {
      /**
       * Decide how this finding should be grouped:
       *
       * - WCAG-backed findings are grouped by WCAG criterion
       * - Non-WCAG findings are grouped by ruleId
       */
      const groupingId =
        wcag.wcagCriterionId !== null
          ? `wcag:${wcag.wcagCriterionId}`
          : `rule:${raw.ruleId}`;

      /**
       * Composite grouping key.
       *
       * This ensures findings are only grouped when they:
       * - belong to the same audit run
       * - belong to the same site
       * - belong to the same page
       * - represent the same WCAG criterion or rule
       */
      const key = [
        raw.auditRunId,
        raw.siteId,
        raw.pageId,
        raw.pageUrl,
        groupingId
      ].join("|");

      // ----
      // Step 3: Create aggregation entry if needed
      // ----
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

      // ----
      // Step 4: Aggregate occurrence and traceability
      // ----
      const entry = bucket.get(key);
      entry.occurrenceCount += 1;
      entry.sourceRawFindingIds.push(raw.rawFindingId);
    }
  }

  // ----
  // Step 5: Split grouped findings into semantic buckets
  // ----
  const allFindings = Array.from(bucket.values());

  return {
    /**
     * Findings that map to the reference standard.
     *
     * These are legally relevant and should be used for
     * compliance statistics and reporting.
     */
    compliance: allFindings.filter(
      finding => finding.wcagCriterionId !== null
    ),

    /**
     * Findings that do not map to a WCAG Success Criterion.
     *
     * These include best-practice, advisory, or experimental rules.
     * They are informative but must not affect compliance calculations.
     */
    other: allFindings.filter(
      finding => finding.wcagCriterionId === null
    )
  };
}
