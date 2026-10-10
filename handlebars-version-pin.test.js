const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MINIMUM_PATCHED_HANDLEBARS_VERSION = "4.7.10";

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

const findInstalledHandlebarsPackageEntries = (packageLockJson) => {
  const packages = packageLockJson.packages ?? {};
  return Object.entries(packages).filter(
    ([packagePath, packageValue]) =>
      (packagePath === "node_modules/handlebars" ||
        packagePath.endsWith("/handlebars")) &&
      typeof packageValue === "object" &&
      packageValue !== null &&
      typeof packageValue.version === "string",
  );
};

test("every installed handlebars package entry in package-lock.json is patched against GHSA-8r5x-fm3f-whwj and GHSA-p8wg-vrv2-v86f (version >= 4.7.10)", () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));

  const installedHandlebarsEntries =
    findInstalledHandlebarsPackageEntries(packageLockJson);

  assert.ok(
    installedHandlebarsEntries.length > 0,
    "expected to find at least one installed handlebars package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedHandlebarsEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(
        packageValue.version,
        MINIMUM_PATCHED_HANDLEBARS_VERSION,
      ),
      `${packagePath} resolves to handlebars@${packageValue.version}, which is below the patched version ${MINIMUM_PATCHED_HANDLEBARS_VERSION} required by GHSA-8r5x-fm3f-whwj and GHSA-p8wg-vrv2-v86f`,
    );
  }
});
