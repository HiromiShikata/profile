const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MINIMUM_PATCHED_MARKED_VERSION = "18.1.0";
const MINIMUM_PATCHED_PRETTIER_VERSION = "3.9.10";

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

test("every installed marked package entry in package-lock.json resolves to at least 18.1.0", () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));

  const installedMarkedEntries = findInstalledPackageEntries(
    packageLockJson,
    "marked",
  );

  assert.ok(
    installedMarkedEntries.length > 0,
    "expected to find at least one installed marked package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedMarkedEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(
        packageValue.version,
        MINIMUM_PATCHED_MARKED_VERSION,
      ),
      `${packagePath} resolves to marked@${packageValue.version}, which is below the required version ${MINIMUM_PATCHED_MARKED_VERSION}`,
    );
  }
});

test("every installed prettier package entry in package-lock.json resolves to at least 3.9.10", () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));

  const installedPrettierEntries = findInstalledPackageEntries(
    packageLockJson,
    "prettier",
  );

  assert.ok(
    installedPrettierEntries.length > 0,
    "expected to find at least one installed prettier package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedPrettierEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(
        packageValue.version,
        MINIMUM_PATCHED_PRETTIER_VERSION,
      ),
      `${packagePath} resolves to prettier@${packageValue.version}, which is below the required version ${MINIMUM_PATCHED_PRETTIER_VERSION}`,
    );
  }
});

test("every installed follow-redirects package entry in package-lock.json resolves to at least 1.16.2", () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));

  const installedFollowRedirectsEntries = findInstalledPackageEntries(
    packageLockJson,
    "follow-redirects",
  );

  assert.ok(
    installedFollowRedirectsEntries.length > 0,
    "expected to find at least one installed follow-redirects package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedFollowRedirectsEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(packageValue.version, "1.16.2"),
      `${packagePath} resolves to follow-redirects@${packageValue.version}, which is below the patched version 1.16.2 required by GHSA-mrwp-f3q8-3g9p`,
    );
  }
});

test("every installed markdown-it package entry in package-lock.json resolves to at least 15.0.3", () => {
  const packageLockPath = path.join(__dirname, "package-lock.json");
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));

  const installedMarkdownItEntries = findInstalledPackageEntries(
    packageLockJson,
    "markdown-it",
  );

  assert.ok(
    installedMarkdownItEntries.length > 0,
    "expected to find at least one installed markdown-it package entry in package-lock.json, found none",
  );

  for (const [packagePath, packageValue] of installedMarkdownItEntries) {
    assert.ok(
      isSemverGreaterThanOrEqual(packageValue.version, "15.0.3"),
      `${packagePath} resolves to markdown-it@${packageValue.version}, which is below the patched version 15.0.3 required by GHSA-gfr2-rv44-r23c`,
    );
  }
});
