import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { resolveWcagCriterion } from "../../core/normalisation/resolveWcagCriterion.mjs";
import { mockStandard } from "../fixtures/standard.mjs";

describe("resolveWcagCriterion.mjs", () => {
  //
  // Happy paths
  //
  test("resolves a single valid WCAG tag", () => {
    const rawFinding = {
      wcagTags: ["wcag2a", "wcag111"]
    };

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    assert.deepEqual(result, [
      { wcagCriterionId: "1.1.1", confidence: "high" }
    ]);
  });

  test("resolves multiple valid WCAG criteria from one finding", () => {
    const rawFinding = {
      wcagTags: ["wcag244", "wcag412"]
    };

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    const ids = result.map(r => r.wcagCriterionId).sort();
    assert.deepEqual(ids, ["2.4.4", "4.1.2"]);
  });

  //
  // WCAG number parsing
  //
  test("correctly parses 4-digit WCAG criteria (e.g. 1.4.13)", () => {
    const rawFinding = {
      wcagTags: ["wcag1413"]
    };

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    assert.deepEqual(result, [
      { wcagCriterionId: "1.4.13", confidence: "high" }
    ]);
  });

  //
  // Deduplication
  //
  test("deduplicates identical WCAG tags", () => {
    const rawFinding = {
      wcagTags: ["wcag111", "wcag111", "wcag111"]
    };

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    assert.deepEqual(result, [
      { wcagCriterionId: "1.1.1", confidence: "high" }
    ]);
  });

  //
  // Invalid or unsupported WCAG tags
  //
  test("returns low confidence when WCAG tag is not in the reference standard", () => {
    const rawFinding = {
      wcagTags: ["wcag299"]
    };

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    assert.equal(result.length, 1);
    assert.equal(result[0].wcagCriterionId, null);
    assert.equal(result[0].confidence, "low");
  });

  test("ignores invalid WCAG tags but resolves valid ones", () => {
    const rawFinding = {
      wcagTags: ["wcag299", "wcag143"]
    };

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    assert.deepEqual(result, [
      { wcagCriterionId: "1.4.3", confidence: "high" }
    ]);
  });

  //
  // No WCAG tags
  //
  test("returns fallback when no WCAG tags are present", () => {
    const rawFinding = {
      wcagTags: ["best-practice", "experimental"]
    };

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    assert.equal(result.length, 1);
    assert.equal(result[0].wcagCriterionId, null);
    assert.equal(result[0].confidence, "low");
  });

  //
  // Defensive behaviour
  //
  test("handles missing wcagTags gracefully", () => {
    const rawFinding = {};

    const result = resolveWcagCriterion(rawFinding, mockStandard);

    assert.equal(result.length, 1);
    assert.equal(result[0].wcagCriterionId, null);
    assert.equal(result[0].confidence, "low");
  });

  test("returns low confidence when standard is missing", () => {
    const rawFinding = {
      wcagTags: ["wcag111"]
    };

    const result = resolveWcagCriterion(rawFinding, null);

    assert.equal(result.length, 1);
    assert.equal(result[0].wcagCriterionId, null);
    assert.equal(result[0].confidence, "low");
  });
});
