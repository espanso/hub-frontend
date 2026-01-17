import { Heart } from "lucide-react";
import { Link } from "react-router";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const links: FooterLink[] = [
  {
    href: "https://espanso.org/docs/get-started/",
    label: "Documentation",
    external: true,
  },
  {
    href: "https://espanso.org/docs/next/packages/creating-a-package/",
    label: "Create Package",
    external: true,
  },
  {
    href: "/search",
    label: "Explore",
  },
  {
    href: "https://github.com/espanso/hub-frontend/",
    label: "Contribute",
    external: true,
  },
  {
    href: "https://espanso.org",
    label: "Espanso",
    external: true,
  },
  {
    href: "https://www.reddit.com/r/espanso/",
    label: "Reddit",
    external: true,
  },
];

interface FooterProps {
  showAuthor?: boolean;
}

export function Footer({ showAuthor = false }: FooterProps) {
  return (
    <footer className="border-t border-primary/20 bg-primary text-primary-foreground">
      <div className="content-row py-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="images/navbar_logo.svg"
              alt="Espanso Hub"
              className="h-7 w-auto"
            />
            <span className="sr-only">Espanso Hub</span>
          </Link>

          {links.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              >
                {l.label}
              </Link>
            ),
          )}
        </div>

        {showAuthor && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-foreground/90">
            <span>Made with</span>
            <Heart className="h-4 w-4" />
            <span>by</span>
            <a
              href="https://www.matteopellegrino.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline-offset-4 hover:underline"
            >
              Matteo Pellegrino
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
