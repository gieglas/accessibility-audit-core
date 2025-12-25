import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { assignSeverity } from "../../core/normalisation/assignSeverity.mjs";

describe("classifyFinding.mjs", () => {
    test("maps minor impact to low severity", () => {
        const rawFinding = { impact: "minor" };
        const result = assignSeverity(rawFinding);

        assert.equal(result, "low");
    });

    test("maps moderate impact to medium severity", () => {
        const rawFinding = { impact: "moderate" };
        const result = assignSeverity(rawFinding);

        assert.equal(result, "medium");
    });

    test("maps serious impact to high severity", () => {
        const rawFinding = { impact: "serious" };
        const result = assignSeverity(rawFinding);

        assert.equal(result, "high");
    });

    test("maps critical impact to critical severity", () => {
        const rawFinding = { impact: "critical" };
        const result = assignSeverity(rawFinding);

        assert.equal(result, "critical");
    });

    test("defaults to medium severity when impact is missing", () => {
        const rawFinding = {};
        const result = assignSeverity(rawFinding);

        assert.equal(result, "medium");
    });

    test("defaults to medium severity for unknown impact values", () => {
        const rawFinding = { impact: "unknown" };
        const result = assignSeverity(rawFinding);

        assert.equal(result, "medium");
    });
});
