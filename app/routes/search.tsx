import type { Route } from "./+types/search";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { getPackagesIndex } from "../services/packages";
import {
  applyFilters,
  countTags,
  filterByTags,
  selectLatestPerName,
  textSearch,
} from "../services/search";
import { Header } from "~/components/Header";
import { PackageCard } from "~/components/PackageCard";
import { CheckboxFilterGroup } from "~/components/CheckboxFilterGroup";
import { RemovableBadge } from "~/components/RemovableBadge";
import { EmptyState } from "~/components/EmptyState";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { SlidersHorizontal } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search Packages - Espanso Hub" },
    { name: "description", content: "Search and browse all Espanso packages" },
  ];
}

export async function loader() {
  const packagesIndex = await getPackagesIndex();
  return { packages: packagesIndex.packages };
}

export default function Search({
  loaderData: { packages },
}: Route.ComponentProps) {
  // URL state for tag filtering (shareable) and query parameter
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize text query from URL parameter 'q' if available
  const queryParam = searchParams.get("q") || "";
  const [textQuery, setTextQuery] = useState(queryParam);

  // Parse tags from URL (?t=tag1,tag2) and normalize to lowercase unique set
  const selectedTags = Array.from(
    new Set(
      searchParams
        .get("t")
        ?.split(",")
        .filter(Boolean)
        .map((t) => t.toLowerCase()) || [],
    ),
  );

  // Consider only latest version per package name
  const latestPackages = selectLatestPerName(packages);

  // Apply text search first if there's a query
  const textFilteredPackages =
    textQuery.trim() !== ""
      ? textSearch(latestPackages, textQuery)
      : latestPackages;

  // Then apply tag filtering to get final filtered packages
  const filteredPackages =
    selectedTags.length > 0
      ? filterByTags(textFilteredPackages, selectedTags)
      : textFilteredPackages;

  // Get tag counts for filter UI from text-filtered packages only
  // This ensures tag counts reflect the current search term
  const tagCounts = countTags(textFilteredPackages);

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    const newTags = selectedTags.includes(lowerTag)
      ? selectedTags.filter((t) => t !== lowerTag)
      : [...selectedTags, lowerTag];

    if (newTags.length > 0) {
      setSearchParams({ t: newTags.sort().join(",") });
    } else {
      setSearchParams({});
    }
  };

  const clearAllFilters = () => {
    setTextQuery("");
    setSearchParams({});
  };

  // Update URL when text query changes
  const handleSearchChange = (value: string) => {
    setTextQuery(value);

    // Update URL params with new query value if not empty
    if (value.trim() !== "") {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("q", value.trim());
        return newParams;
      });
    } else if (searchParams.has("q")) {
      // Remove q parameter if query is empty
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("q");
        return newParams;
      });
    }
  };

  const hasActiveFilters = textQuery.trim() !== "" || selectedTags.length > 0;

  // Prepare checkbox items for UI
  const checkboxItems = tagCounts.map(({ tag, count }) => ({
    tag,
    count,
    checked: selectedTags.includes(tag),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearchChange={handleSearchChange} searchValue={textQuery} />

      <main className="flex-1 bg-white">
        <div className="content-row py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <CheckboxFilterGroup
                  title="Tags"
                  items={checkboxItems}
                  onToggle={toggleTag}
                  limit={15}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Tags
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filter by Tags</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <CheckboxFilterGroup
                        title=""
                        items={checkboxItems}
                        onToggle={toggleTag}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Results Summary */}
              {hasActiveFilters && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {filteredPackages.length} result
                      {filteredPackages.length !== 1 ? "s" : ""}
                      {textQuery && (
                        <span className="font-medium text-foreground">
                          {" "}
                          for "{textQuery}"
                        </span>
                      )}
                    </p>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear all
                    </Button>
                  </div>

                  {/* Active Tag Filters */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <RemovableBadge
                          key={tag}
                          onRemove={() => toggleTag(tag)}
                        >
                          {tag}
                        </RemovableBadge>
                      ))}
                    </div>
                  )}

                  <Separator />
                </div>
              )}

              {/* Results Grid */}
              {filteredPackages.length > 0 ? (
                <div className="grid gap-4 grid-cols-1">
                  {filteredPackages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package={pkg}
                      onTagClick={toggleTag}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No packages found"
                  description="Can't find what you're looking for?"
                  action={
                    <a
                      href="https://espanso.org/docs/next/packages/creating-a-package/"
                      className="text-sm text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Create your own package
                    </a>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
