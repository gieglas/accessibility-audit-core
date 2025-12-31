import fs from "node:fs/promises";

/**
 * Load a bundled accessibility standard from this package.
 *
 * @param {string} standardId
 *   Example: "EN301549_v3.2.1"
 *
 * @returns {Promise<Object>}
 */
export async function loadStandard(standardId) {
  if (!standardId) {
    throw new Error("standardId is required");
  }

  const filename = `${standardId.toLowerCase()}.json`;

  // Resolve relative to THIS PACKAGE, not the caller
  const standardUrl = new URL(`./${filename}`, import.meta.url);

  try {
    const raw = await fs.readFile(standardUrl, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Unable to load standard "${standardId}". ` +
      `Expected file: ${filename}`
    );
  }
}
