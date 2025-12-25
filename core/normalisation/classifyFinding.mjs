/**
 * Classify a RawFinding into a normalised classification
 *
 * @param {Object} rawFinding
 * @returns {Object} classification result
 */
export function classifyFinding(rawFinding = {}) {
  switch (rawFinding.findingType) {
    case "violation":
      return {
        classification: "automated-violation",
        confidence: "high"
      };

    case "needs-manual-review":
      return {
        classification: "requires-manual-review",
        confidence: "medium"
      };

    default:
      return {
        classification: "requires-manual-review",
        confidence: "low"
      };
  }
}
