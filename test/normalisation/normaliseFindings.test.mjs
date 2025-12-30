import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { normaliseFindings } from "../../core/normalisation/normaliseFindings.mjs";
import { mockStandard } from "../fixtures/standard.mjs";

describe("normaliseFindings.mjs", () => {
  test("groups WCAG findings by wcagCriterionId into compliance", () => {
    const rawFindings = [
      {
        rawFindingId: "r1",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["wcag111"],
        ruleId: "image-alt",
        findingType: "violation",
        impact: "serious"
      },
      {
        rawFindingId: "r2",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["wcag111"],
        ruleId: "image-alt",
        findingType: "violation",
        impact: "serious"
      }
    ];

    const result = normaliseFindings(rawFindings, mockStandard);

    assert.equal(result.compliance.length, 1);
    assert.equal(result.other.length, 0);

    assert.deepEqual(result.compliance[0], {
      auditRunId: "run1",
      siteId: "site1",
      pageId: "home",
      pageUrl: "https://example.com",

      wcagCriterionId: "1.1.1",
      ruleId: null,

      classification: "automated-violation",
      severity: "high",

      occurrenceCount: 2,
      sourceRawFindingIds: ["r1", "r2"]
    });
  });

  test("creates separate compliance findings for different WCAG criteria", () => {
    const rawFindings = [
      {
        rawFindingId: "r1",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["wcag111"],
        ruleId: "image-alt",
        findingType: "violation",
        impact: "serious"
      },
      {
        rawFindingId: "r2",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["wcag143"],
        ruleId: "color-contrast",
        findingType: "violation",
        impact: "moderate"
      }
    ];

    const result = normaliseFindings(rawFindings, mockStandard);

    assert.equal(result.compliance.length, 2);
    assert.equal(result.other.length, 0);

    const wcagIds = result.compliance
      .map(r => r.wcagCriterionId)
      .sort();

    assert.deepEqual(wcagIds, ["1.1.1", "1.4.3"]);
  });

  test("groups non-WCAG findings by ruleId into other", () => {
    const rawFindings = [
      {
        rawFindingId: "r1",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["best-practice"],
        ruleId: "region",
        findingType: "violation",
        impact: "moderate"
      },
      {
        rawFindingId: "r2",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["best-practice"],
        ruleId: "region",
        findingType: "violation",
        impact: "moderate"
      }
    ];

    const result = normaliseFindings(rawFindings, mockStandard);

    assert.equal(result.compliance.length, 0);
    assert.equal(result.other.length, 1);

    assert.deepEqual(result.other[0], {
      auditRunId: "run1",
      siteId: "site1",
      pageId: "home",
      pageUrl: "https://example.com",

      wcagCriterionId: null,
      ruleId: "region",

      classification: "automated-violation",
      severity: "medium",

      occurrenceCount: 2,
      sourceRawFindingIds: ["r1", "r2"]
    });
  });

  test("does not mix WCAG and non-WCAG findings", () => {
    const rawFindings = [
      {
        rawFindingId: "r1",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["wcag111"],
        ruleId: "image-alt",
        findingType: "violation",
        impact: "serious"
      },
      {
        rawFindingId: "r2",
        auditRunId: "run1",
        siteId: "site1",
        pageId: "home",
        pageUrl: "https://example.com",
        wcagTags: ["best-practice"],
        ruleId: "region",
        findingType: "violation",
        impact: "moderate"
      }
    ];

    const result = normaliseFindings(rawFindings, mockStandard);

    assert.equal(result.compliance.length, 1);
    assert.equal(result.other.length, 1);

    assert.equal(result.compliance[0].wcagCriterionId, "1.1.1");
    assert.equal(result.other[0].ruleId, "region");
  });

  test("returns empty buckets when no findings exist", () => {
    const result = normaliseFindings([], mockStandard);

    assert.deepEqual(result, {
      compliance: [],
      other: []
    });
  });
});
