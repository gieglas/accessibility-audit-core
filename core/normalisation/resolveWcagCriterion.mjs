// core/normalisation/resolveWcagCriterion.mjs

/**
 * Resolve WCAG Success Criterion IDs from a RawFinding.
 *
 * Supports axe-core WCAG tags such as:
 * - wcag111  → 1.1.1
 * - wcag143  → 1.4.3
 * - wcag1413 → 1.4.13
 *
 * @param {Object} rawFinding
 * @param {Object} standard Reference standard dataset (EN 301 549)
 * @returns {Array<Object>}
 */
export function resolveWcagCriterion(rawFinding = {}, standard) {
  const tags = Array.isArray(rawFinding.wcagTags)
    ? rawFinding.wcagTags
    : [];

  // Extract axe WCAG tags (wcag### or wcag####)
  const wcagCandidates = tags
    .filter(tag => /^wcag\d{3,4}$/.test(tag))
    .map(tag => {
      const digits = tag.replace("wcag", "");

      // 3 digits → X.Y.Z
      if (digits.length === 3) {
        return `${digits[0]}.${digits[1]}.${digits[2]}`;
      }

      // 4 digits → X.Y.ZZ (e.g. 1.4.13)
      if (digits.length === 4) {
        return `${digits[0]}.${digits[1]}.${digits.slice(2)}`;
      }

      return null;
    })
    .filter(Boolean);

  const uniqueCandidates = [...new Set(wcagCandidates)];

  if (uniqueCandidates.length === 0) {
    return [
      {
        wcagCriterionId: null,
        confidence: "low",
        reason: "No WCAG criterion tag present"
      }
    ];
  }

  const resolved = uniqueCandidates
    .filter(id => standard?.criteria?.[id])
    .map(id => ({
      wcagCriterionId: id,
      confidence: "high"
    }));

  if (resolved.length === 0) {
    return [
      {
        wcagCriterionId: null,
        confidence: "low",
        reason: "WCAG criterion not found in reference standard"
      }
    ];
  }

  return resolved;
}
