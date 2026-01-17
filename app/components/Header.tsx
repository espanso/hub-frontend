import clsx from "clsx";
import { Search } from "lucide-react";
import type React from "react";
import { Link } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "./ui/button";

interface HeaderProps {
  variant?: "default" | "landing";
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export function Header({
  variant = "default",
  onSearchChange,
  onSearchSubmit,
  searchValue = "",
  showSearch = true,
}: HeaderProps) {
  return (
    <header
      className={clsx(
        "w-full border-b border-primary/30 border-none text-primary-foreground",
        variant === "landing"
          ? "bg-transparent"
          : "bg-primary sticky top-0 z-50",
      )}
    >
      <div className="content-row">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/navbar_logo.svg"
              alt="Espanso Hub"
              className="h-6 md:h-7 w-auto"
            />
            <span className="sr-only">Espanso Hub</span>
          </Link>

          {/* Search Input - Desktop */}
          {showSearch && onSearchChange && (
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search for packages"
                value={searchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (
                    e.key === "Enter" &&
                    onSearchSubmit &&
                    searchValue.trim() !== ""
                  ) {
                    onSearchSubmit?.(searchValue);
                  }
                }}
                className="pl-10 w-full bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Spacer */}
          <div className="hidden md:flex flex-1" />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="https://espanso.org/docs/get-started/"
              className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
            <a
              href="https://espanso.org/docs/next/packages/creating-a-package/"
              className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Package
            </a>
            <Link
              to="/search"
              className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              Explore
            </Link>
          </nav>

          {/* Mobile Menu - TODO: Add hamburger menu */}
          <div className="md:hidden">
            {/* Placeholder for future mobile menu */}
          </div>
        </div>
      </div>
    </header>
  );
}
