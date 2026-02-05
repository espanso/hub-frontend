import { ChevronDown, Search, ShieldIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Input } from "../components/ui/input";
import { getPackagesIndex } from "../services/packages";
import type { Route } from "./+types/home";
import { Badge } from "../components/ui/badge";
import { isFeatured, type Package } from "../model/packages";
import { PackageCard } from "../components/PackageCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Espanso Hub | Enhance your workflows with espanso packages" },
    {
      name: "description",
      content: `\
Enhance your workflows with espanso packages from the Espanso Hub. \
Emoji, code-snippets, mathematical notations, accents and more. \
Explore the hub to find packages that fits you. \
Look up the featured packages specifically selected by the Espanso team. \
Not finding what fits you? Create your own package or join the Reddit community to find \
inspiration.`,
    },
  ];
}

export async function loader() {
  const packages = await getPackagesIndex();
  return { packages };
}

export default function Home({
  loaderData: { packages },
}: Route.ComponentProps) {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div style={{ backgroundImage: "url(/images/landing_bg.svg)" }}>
      {/* {packages.packages.map((pkg) => (
        <li key={pkg.id}>{pkg.title}</li>
      ))} */}
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          <Header variant="landing" />

          <div className="content-row mt-48 text-center justify-items-center">
            <h1 className="text-4xl font-semibold text-white">
              Enhance your workflows with espanso packages
            </h1>
            <h2 className="text-xl mt-5 text-white">
              Emoji, code-snippets, mathematical notations, accents and more.
            </h2>
            <div className="flex min-w-1/3 relative mt-14">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Already got an idea? Search it here..."
                value={searchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className="pl-10 min-w-1/3 min-h-12 bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="mt-14 text-white">
              or{" "}
              <Link to="/search" className="underline">
                explore the hub
              </Link>
            </div>
          </div>
        </div>

        <div className="self-center pb-10 ">
          <ChevronDown className="text-white" />
        </div>
      </div>

      {/* Featured Packages */}
      <div className="bg-white py-16">
        <div className="content-row flex flex-col gap-8">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-semibold">Featured Packages</h1>
            <Badge>
              <ShieldIcon />
              Featured
            </Badge>
          </div>

          {/* Grid */}
          <div className="flex flex-col md:grid md:grid-flow-col md:grid-rows-5 lg:grid-rows-3 gap-8">
            {Array.from(
              packages.packages
                .filter(isFeatured)
                .reduce((acc, pkg) => {
                  const existing = acc.get(pkg.name);
                  if (!existing || pkg.version > existing.version) {
                    acc.set(pkg.name, pkg);
                  }
                  return acc;
                }, new Map<string, Package>())
                .values(),
            )
              .slice(0, 9)
              .map((pkg) => (
                <div key={pkg.id} className="w-96">
                  <PackageCard
                    package={pkg}
                    showFeaturedBadge={false}
                    onTagClick={() => {}}
                  />
                </div>
              ))}
          </div>

          <div className="text-end">
            <Link to="/search" className="hover:underline text-primary">
              See all packages {">"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
