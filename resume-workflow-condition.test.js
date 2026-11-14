const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const YAML = require("yamljs");

const workflowPath = path.join(__dirname, ".github", "workflows", "resume.yml");
const workflow = YAML.load(workflowPath);

const EXPECTED_CONDITION = "github.event_name != 'pull_request'";
const TOKEN_STEP_PREFIX = "actions/create-github-app-token@";

// Supports exactly: github.event_name (!=|==) '<literal>'
// GitHub compares strings case-insensitively, so both sides are lowercased.
const SUPPORTED_FORM = /^github\.event_name\s*(!=|==)\s*'([^']*)'$/;

const evaluateCondition = (expression, eventName) => {
  const match = SUPPORTED_FORM.exec(expression.trim());
  if (!match) {
    throw new Error(
      `Unsupported expression for this evaluator: ${JSON.stringify(expression)}`,
    );
  }
  const [, operator, literal] = match;
  const same = eventName.toLowerCase() === literal.toLowerCase();
  return operator === "==" ? same : !same;
};

const findTokenStep = (parsed) => {
  const steps = parsed.jobs.generate.steps;
  const matches = steps.filter(
    (step) =>
      typeof step.uses === "string" && step.uses.startsWith(TOKEN_STEP_PREFIX),
  );
  assert.equal(
    matches.length,
    1,
    "expected exactly one create-github-app-token step",
  );
  return matches[0];
};

describe("resume.yml create-github-app-token if condition", () => {
  it("skips the token step for pull_request events only", () => {
    const tokenStep = findTokenStep(workflow);
    assert.equal(tokenStep.if, EXPECTED_CONDITION);

    const cases = [
      { eventName: "push", expected: true },
      { eventName: "pull_request", expected: false },
      { eventName: "workflow_dispatch", expected: true },
      { eventName: "PULL_REQUEST", expected: false },
    ];

    for (const { eventName, expected } of cases) {
      assert.equal(
        evaluateCondition(tokenStep.if, eventName),
        expected,
        `event_name=${eventName}`,
      );
    }
  });
});
