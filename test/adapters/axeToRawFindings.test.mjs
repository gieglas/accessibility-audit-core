import test, { describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import { axeToRawFindings } from "../../core/adapters/axeToRawFindings.mjs";

describe("axeToRawFindings.mjs", () => {
  test("converts axe violations into RawFinding objects", () => {
    const axeResults = {
      toolOptions: {
        version: "4.10.0"
      },
      violations: [
        {
          id: "label",
          description: "Ensure every form element has a label",
          impact: "critical",
          tags: ["wcag2a", "wcag412"],
          nodes: [
            {
              target: ["#input-1"]
            },
            {
              target: ["#input-2"]
            }
          ]
        }
      ]
    };

    const context = {
      auditRunId: "run1",
      siteId: "site1",
      pageId: "home",
      pageUrl: "https://example.com"
    };

    const result = axeToRawFindings(axeResults, context);

    // Two nodes → two raw findings
    assert.equal(result.length, 2);

    for (const finding of result) {
      assert.ok(finding.rawFindingId);
      assert.equal(crypto.randomUUID().length, finding.rawFindingId.length);

      // Context
      assert.equal(finding.auditRunId, "run1");
      assert.equal(finding.siteId, "site1");
      assert.equal(finding.pageId, "home");
      assert.equal(finding.pageUrl, "https://example.com");

      // Provenance
      assert.equal(finding.source, "cli");
      assert.equal(finding.tool, "axe-core");
      assert.equal(finding.toolVersion, "4.10.0");
      assert.ok(finding.timestamp);

      // Finding data
      assert.equal(finding.ruleId, "label");
      assert.equal(
        finding.message,
        "Ensure every form element has a label"
      );
      assert.equal(finding.impact, "critical");
      assert.deepEqual(finding.wcagTags, ["wcag2a", "wcag412"]);
      assert.equal(finding.findingType, "violation");
    }

    assert.deepEqual(
      result.map(r => r.selector).sort(),
      ["#input-1", "#input-2"]
    );
  });

  test("handles missing tags and targets gracefully", () => {
    const axeResults = {
      violations: [
        {
          id: "color-contrast",
          description: "Elements must meet minimum contrast ratio",
          impact: "serious",
          nodes: [
            {
              target: []
            }
          ]
        }
      ]
    };

    const context = {
      auditRunId: "run2",
      siteId: "site2",
      pageId: "page",
      pageUrl: "https://example.com/page"
    };

    const result = axeToRawFindings(axeResults, context);

    assert.equal(result.length, 1);

    assert.equal(result[0].ruleId, "color-contrast");
    assert.equal(result[0].selector, undefined);
    assert.deepEqual(result[0].wcagTags, []);
  });

  test("returns an empty array when there are no violations", () => {
    const axeResults = {
      violations: []
    };

    const context = {
      auditRunId: "run3",
      siteId: "site3",
      pageId: "home",
      pageUrl: "https://example.com"
    };

    const result = axeToRawFindings(axeResults, context);

    assert.deepEqual(result, []);
  });
});
