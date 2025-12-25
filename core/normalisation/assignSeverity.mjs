/**
 * Assign a normalised severity level based on tool impact
 *
 * @param {Object} rawFinding
 * @returns {string} severity
 */
export function assignSeverity(rawFinding = {}) {
  switch (rawFinding.impact) {
    case "minor":
      return "low";

    case "moderate":
      return "medium";

    case "serious":
      return "high";

    case "critical":
      return "critical";

    default:
      return "medium";
  }
}
