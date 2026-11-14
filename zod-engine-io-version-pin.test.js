const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MINIMUM_ZOD_VERSION = "4.6.6";
const MINIMUM_ENGINE_IO_VERSION = "6.6.10";

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

const findInstalledPackageEntries = (packageLockJson, packageName) => {
  const packages = packageLockJson.packages ?? {};
  return Object.entries(packages).filter(
    ([packagePath, packageValue]) =>
      (packagePath === `node_modules/${packageName}` ||
        packagePath.endsWith(`/${packageName}`)) &&
      typeof packageValue === "object" &&
      packageValue !== null &&
      typeof packageValue.version === "string",
  );
};

const readPackageLockJson = () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  return JSON.parse(fs.readFileSync(packageLockPath, "utf8"));
};

test("every installed zod package entry in package-lock.json resolves to version >= 4.6.6", () => {
  const packageLockJson = readPackageLockJson();

  const installedZodEntries = findInstalledPackageEntries(
    packageLockJson,
    "zod",
  );

  assert.ok(
    installedZodEntries.length > 0,
    "expected to find at least one installed zod package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedZodEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(packageValue.version, MINIMUM_ZOD_VERSION),
      `${packagePath} resolves to zod@${packageValue.version}, which is below the minimum version ${MINIMUM_ZOD_VERSION}`,
    );
  }
});

test("every installed engine.io package entry in package-lock.json resolves to version >= 6.6.10", () => {
  const packageLockJson = readPackageLockJson();

  const installedEngineIoEntries = findInstalledPackageEntries(
    packageLockJson,
    "engine.io",
  );

  assert.ok(
    installedEngineIoEntries.length > 0,
    "expected to find at least one installed engine.io package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedEngineIoEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(
        packageValue.version,
        MINIMUM_ENGINE_IO_VERSION,
      ),
      `${packagePath} resolves to engine.io@${packageValue.version}, which is below the minimum version ${MINIMUM_ENGINE_IO_VERSION}`,
    );
  }
});
