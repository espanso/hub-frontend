import * as v from "valibot";
import { match } from "ts-pattern";
import { PackagesIndexSchema } from "../model/packages";
import type { PackagesIndex, Package } from "../model/packages";

const PACKAGE_INDEX_URL =
  process.env.PACKAGE_INDEX_URL ||
  "https://github.com/espanso/hub/releases/download/v1.0.0/package_index.json";

// Module-level cache to ensure single fetch per build process
let cachedPackagesIndex: PackagesIndex | null = null;
let fetchPromise: Promise<PackagesIndex> | null = null;

/**
 * Fetches and validates the package index from the configured URL.
 * Filters out dummy packages and validates all package data.
 * Cached at module level to ensure single fetch per build.
 * @throws Error if fetch fails or validation fails
 */
export async function fetchPackagesIndex(): Promise<PackagesIndex> {
  // Return cached result if available
  if (cachedPackagesIndex) {
    console.log("📦 Using cached package index");
    return cachedPackagesIndex;
  }

  // Return in-flight promise if fetch is already happening
  if (fetchPromise) {
    console.log("⏳ Waiting for in-flight package index fetch...");
    return fetchPromise;
  }

  // Start new fetch and cache the promise
  console.log("🌐 Fetching package index from:", PACKAGE_INDEX_URL);
  fetchPromise = (async () => {
    const response = await fetch(PACKAGE_INDEX_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch package index from ${PACKAGE_INDEX_URL}: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json();

    // Validate the entire response
    const parseResult = v.safeParse(PackagesIndexSchema, json);

    const result = match(parseResult)
      .with({ success: true }, (result) => {
        // Filter out dummy packages
        const filteredPackages = result.output.packages.filter(
          (pkg) => pkg.name !== "dummy-package",
        );

        return {
          ...result.output,
          packages: filteredPackages,
        };
      })
      .with({ success: false }, (result) => {
        const flattenedIssues = v.flatten(result.issues);
        console.error("Package index validation failed:", flattenedIssues);
        throw new Error(
          `Package index validation failed: ${JSON.stringify(flattenedIssues, null, 2)}`,
        );
      })
      .exhaustive();

    // Cache the result
    cachedPackagesIndex = result;
    console.log(
      `✅ Package index fetched and cached (${result.packages.length} packages)`,
    );
    return result;
  })();

  return fetchPromise;
}

/**
 * Gets the package index with graceful error handling.
 * Individual invalid packages are filtered out with warnings.
 */
export async function getPackagesIndex(): Promise<PackagesIndex> {
  try {
    return await fetchPackagesIndex();
  } catch (error) {
    console.error("Error fetching packages index:", error);
    throw error;
  }
}

/**
 * Gets unique package names from the package index.
 * Since multiple versions of the same package exist, we deduplicate by name.
 */
export async function getUniquePackageNames(): Promise<string[]> {
  const index = await getPackagesIndex();
  const uniqueNames = new Set(index.packages.map((pkg) => pkg.name));
  return Array.from(uniqueNames);
}

/**
 * Gets the latest version of a specific package by name.
 */
export async function getPackageByName(
  packageName: string,
): Promise<Package | null> {
  const index = await getPackagesIndex();

  // Find all versions of this package
  const packageVersions = index.packages.filter(
    (pkg) => pkg.name === packageName,
  );

  if (packageVersions.length === 0) {
    return null;
  }

  // Sort by version (descending) and return the latest
  const sorted = packageVersions.sort((a, b) => {
    // Simple version comparison - could use compare-versions library if needed
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });

  return sorted[0];
}

/**
 * Gets a specific version of a package by name and version.
 */
export async function getPackageByNameAndVersion(
  name: string,
  version: string,
): Promise<Package | null> {
  const index = await getPackagesIndex();
  return (
    index.packages.find((p) => p.name === name && p.version === version) || null
  );
}

/**
 * Gets all versions for a specific package, sorted in descending order.
 */
export async function getVersionsForPackage(name: string): Promise<string[]> {
  const index = await getPackagesIndex();
  const versions = index.packages
    .filter((p) => p.name === name)
    .map((p) => p.version)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  return Array.from(new Set(versions));
}

/**
 * Gets all package version paths for prerendering.
 * Returns paths in the format /:name/v/:version
 */
export async function getAllPackageVersionPaths(): Promise<string[]> {
  const index = await getPackagesIndex();
  return index.packages.map((p) => `/${p.name}/v/${p.version}`);
}

/**
 * Parse the _manifest.yml file content to extract repository home URL
 * @param manifestContent Content of the _manifest.yml file
 * @returns Repository home URL or null if not found
 */
export function parseManifest(manifestContent: string): string | null {
  try {
    // Simple parsing of YAML to extract repository_url
    const lines = manifestContent.split("\n");
    for (const line of lines) {
      if (line.trim().startsWith("homepage:")) {
        const parts = line.split(":");
        if (parts.length >= 2) {
          const url = parts.slice(1).join(":").trim();
          if (url.startsWith('"') && url.endsWith('"')) {
            return url.slice(1, -1);
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing manifest:", error);
    return null;
  }
}

/**
 * Fetches a package archive from its archive_url, unzips it and returns the file contents
 * as a record of file paths to file contents.
 * @param archiveUrl URL to the package archive zip file
 * @returns Record of file paths to file contents
 */
export async function fetchPackageFiles(
  archiveUrl: string,
): Promise<Record<string, string>> {
  try {
    console.log(`🔍 Fetching package archive from: ${archiveUrl}`);
    const response = await fetch(archiveUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch package archive from ${archiveUrl}: ${response.status} ${response.statusText}`,
      );
    }

    // Get the zip file as an ArrayBuffer
    const zipBuffer = await response.arrayBuffer();

    // Use the JSZip library to extract the contents
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipBuffer);

    const files: Record<string, string> = {};

    // Process all files in the zip archive
    const filePromises = Object.keys(zipContent.files).map(async (filename) => {
      const zipEntry = zipContent.files[filename];

      // Skip directories
      if (zipEntry.dir) return;

      try {
        // Read the file content as text
        const content = await zipEntry.async("string");
        files[filename] = content;
      } catch (err) {
        console.warn(`Failed to read file ${filename} from archive: ${err}`);
      }
    });

    await Promise.all(filePromises);
    console.log(`📂 Extracted ${Object.keys(files).length} files from archive`);

    return files;
  } catch (error) {
    console.error("Error fetching package archive:", error);
    return {};
  }
}
