const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MINIMUM_PATCHED_BRACE_EXPANSION_VERSION = "5.0.11";

const isSemverGreaterThanOrEqual = (actualVersion, minimumVersion) => {
  const actualParts = actualVersion.split(".").map(Number);
  const minimumParts = minimumVersion.split(".").map(Number);
  const partCount = Math.max(actualParts.length, minimumParts.length);
  for (let index = 0; index < partCount; index += 1) {
    const actualPart = actualParts[index] ?? 0;
    const minimumPart = minimumParts[index] ?? 0;
    if (actualPart > minimumPart) {
      return true;
    }
    if (actualPart < minimumPart) {
      return false;
    }
  }
  return true;
};

const findInstalledBraceExpansionPackageEntries = (packageLockJson) => {
  const packages = packageLockJson.packages ?? {};
  return Object.entries(packages).filter(
    ([packagePath, packageValue]) =>
      (packagePath === "node_modules/brace-expansion" ||
        packagePath.endsWith("/brace-expansion")) &&
      typeof packageValue === "object" &&
      packageValue !== null &&
      typeof packageValue.version === "string",
  );
};

test("every installed brace-expansion package entry in package-lock.json is patched against GHSA-6j4f-fj2g-mc7p and GHSA-qhr7-859c-m2p7 (version >= 5.0.11)", () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));

  const installedBraceExpansionEntries =
    findInstalledBraceExpansionPackageEntries(packageLockJson);

  assert.ok(
    installedBraceExpansionEntries.length > 0,
    "expected to find at least one installed brace-expansion package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedBraceExpansionEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(
        packageValue.version,
        MINIMUM_PATCHED_BRACE_EXPANSION_VERSION,
      ),
      `${packagePath} resolves to brace-expansion@${packageValue.version}, which is below the patched version ${MINIMUM_PATCHED_BRACE_EXPANSION_VERSION} required by GHSA-6j4f-fj2g-mc7p and GHSA-qhr7-859c-m2p7`,
    );
  }
});
