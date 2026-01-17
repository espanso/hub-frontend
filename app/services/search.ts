import Fuse from "fuse.js";
import type { Package } from "../model/packages";

/**
 * Performs fuzzy text search across package fields using Fuse.js
 * @param packages - Array of packages to search
 * @param query - Search query string
 * @returns Filtered packages matching the query
 */
export function textSearch(packages: Package[], query: string): Package[] {
  if (!query || query.trim() === "") {
    return packages;
  }

  const fuse = new Fuse(packages, {
    keys: ["name", "author", "description", "title"],
    threshold: 0.4, // Lower = more strict matching (0-1 scale)
  });

  return fuse.search(query).map((result) => result.item);
}

/**
 * Filters packages by tags (OR logic - package matches if it has ANY selected tag)
 * @param packages - Array of packages to filter
 * @param tags - Array of tag names to filter by
 * @returns Filtered packages containing at least one of the tags
 */
export function filterByTags(packages: Package[], tags: string[]): Package[] {
  if (!tags || tags.length === 0) {
    return packages;
  }

  // Case-insensitive tag matching
  const lowerTags = tags.map((t) => t.toLowerCase());

  return packages.filter((pkg) =>
    pkg.tags.some((pkgTag) => lowerTags.includes(pkgTag.toLowerCase())),
  );
}

/**
 * Counts how many packages have each tag
 * @param packages - Array of packages
 * @returns Array of {tag, count} sorted by count descending
 */
export type TagCount = {
  tag: string;
  count: number;
};

export function countTags(packages: Package[]): TagCount[] {
  // Extract all unique tags
  const tagCounts = new Map<string, number>();

  packages.forEach((pkg) => {
    pkg.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      tagCounts.set(lowerTag, (tagCounts.get(lowerTag) || 0) + 1);
    });
  });

  // Convert to array and sort by count (descending)
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Applies both text and tag filters to packages
 * @param packages - Array of packages
 * @param textQuery - Optional text search query
 * @param selectedTags - Optional array of tag filters
 * @returns Filtered packages
 */
export function applyFilters(
  packages: Package[],
  textQuery: string,
  selectedTags: string[],
): Package[] {
  let results = packages;

  // Apply text search first
  if (textQuery && textQuery.trim() !== "") {
    results = textSearch(results, textQuery);
  }

  // Then apply tag filtering
  if (selectedTags && selectedTags.length > 0) {
    results = filterByTags(results, selectedTags);
  }

  return results;
}

/**
 * Selects only the latest version for each package name.
 * Uses numeric localeCompare on the validated semver-like version string.
 */
export function selectLatestPerName(packages: Package[]): Package[] {
  const byName = new Map<string, Package>();

  const toParts = (v: string): [number, number, number] => {
    const [maj, min, pat] = v.split(".").map((n) => parseInt(n, 10));
    return [maj || 0, min || 0, pat || 0];
  };

  const cmp = (a: string, b: string): number => {
    const [amj, ami, ap] = toParts(a);
    const [bmj, bmi, bp] = toParts(b);
    if (amj !== bmj) return amj - bmj;
    if (ami !== bmi) return ami - bmi;
    return ap - bp;
  };

  for (const pkg of packages) {
    const existing = byName.get(pkg.name);
    if (!existing) {
      byName.set(pkg.name, pkg);
      continue;
    }
    if (cmp(pkg.version, existing.version) > 0) {
      byName.set(pkg.name, pkg);
    }
  }

  return Array.from(byName.values());
}
