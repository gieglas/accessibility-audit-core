/**
 * Convert axe-core results into RawFinding objects
 *
 * @param {Object} axeResults - Result of axe.run()
 * @param {Object} context
 * @returns {Array<Object>}
 */
export function axeToRawFindings(axeResults, context) {
  const timestamp = new Date().toISOString();

  return axeResults.violations.flatMap(violation =>
    violation.nodes.map(node => ({
      rawFindingId: crypto.randomUUID(),

      // Context
      auditRunId: context.auditRunId,
      siteId: context.siteId,
      pageId: context.pageId,
      pageUrl: context.pageUrl,

      // Provenance
      source: "cli",
      tool: "axe-core",
      toolVersion: axeResults.toolOptions?.version,
      timestamp,

      // Finding data
      ruleId: violation.id,
      message: violation.description,
      selector: node.target?.[0],

      // This is what we were missing before 👇
      wcagTags: violation.tags || [],
      impact: violation.impact,

      // Axe violations are deterministic
      findingType: "violation"
    }))
  );
}
