const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const RESUME_CLI_ENTRY_POINT_PATH = path.join(
  __dirname,
  "node_modules",
  "resume-cli",
  "build",
  "main.js",
);

test("resume-cli build/main.js --help exits 0 and prints usage instead of crashing with the browser-sync send.mime.define TypeError", () => {
  const spawnResult = spawnSync(
    process.execPath,
    [RESUME_CLI_ENTRY_POINT_PATH, "--help"],
    {
      encoding: "utf8",
      timeout: 15000,
    },
  );

  assert.equal(
    spawnResult.status,
    0,
    `expected "${RESUME_CLI_ENTRY_POINT_PATH} --help" to exit with status 0, got status=${spawnResult.status} signal=${spawnResult.signal}\nstdout:\n${spawnResult.stdout}\nstderr:\n${spawnResult.stderr}`,
  );

  assert.ok(
    !spawnResult.stderr.includes("Cannot read properties of undefined"),
    `resume-cli --help crashed with a TypeError in its stderr (expected no "Cannot read properties of undefined" text):\n${spawnResult.stderr}`,
  );

  assert.match(
    spawnResult.stdout,
    /Usage: resume/,
    `expected resume-cli --help stdout to contain CLI usage output matching /Usage: resume/, got:\n${spawnResult.stdout}`,
  );
});
