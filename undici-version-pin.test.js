const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MINIMUM_PATCHED_UNDICI_VERSION = "7.29.1";

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

const findInstalledUndiciPackageEntries = (packageLockJson) => {
  const packages = packageLockJson.packages ?? {};
  return Object.entries(packages).filter(
    ([packagePath, packageValue]) =>
      (packagePath === "node_modules/undici" ||
        packagePath.endsWith("/undici")) &&
      typeof packageValue === "object" &&
      packageValue !== null &&
      typeof packageValue.version === "string",
  );
};

test("every installed undici package entry in package-lock.json is patched against GHSA-w293-vg96-wgc3 (version >= 7.29.1)", () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));

  const installedUndiciEntries =
    findInstalledUndiciPackageEntries(packageLockJson);

  assert.ok(
    installedUndiciEntries.length > 0,
    "expected to find at least one installed undici package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedUndiciEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(
        packageValue.version,
        MINIMUM_PATCHED_UNDICI_VERSION,
      ),
      `${packagePath} resolves to undici@${packageValue.version}, which is below the patched version ${MINIMUM_PATCHED_UNDICI_VERSION} required by GHSA-w293-vg96-wgc3`,
    );
  }
});
