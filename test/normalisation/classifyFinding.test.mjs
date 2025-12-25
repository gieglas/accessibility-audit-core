import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { classifyFinding } from "../../core/normalisation/classifyFinding.mjs";

describe("classifyFinding.mjs", () => {
    test("classifies automated violation correctly", () => {
        const rawFinding = {
            findingType: "violation"
        };

        const result = classifyFinding(rawFinding);

        assert.deepEqual(result, {
            classification: "automated-violation",
            confidence: "high"
        });
    });

    test("classifies manual review finding correctly", () => {
        const rawFinding = {
            findingType: "needs-manual-review"
        };

        const result = classifyFinding(rawFinding);

        assert.deepEqual(result, {
            classification: "requires-manual-review",
            confidence: "medium"
        });
    });

    test("falls back safely for missing findingType", () => {
        const rawFinding = {};

        const result = classifyFinding(rawFinding);

        assert.deepEqual(result, {
            classification: "requires-manual-review",
            confidence: "low"
        });
    });

    test("falls back safely for unknown findingType", () => {
        const rawFinding = {
            findingType: "unknown"
        };

        const result = classifyFinding(rawFinding);

        assert.deepEqual(result, {
            classification: "requires-manual-review",
            confidence: "low"
        });
    });
});
