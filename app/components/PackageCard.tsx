import { useNavigate } from "react-router";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Package } from "~/model/packages";
import { isFeatured } from "~/model/packages";

interface PackageCardProps {
  package: Package;
  showFeaturedBadge?: boolean;
  onTagClick: (tag: string) => void;
}

export function PackageCard({
  package: pkg,
  showFeaturedBadge = true,
  onTagClick,
}: PackageCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      className="h-full transition-all hover:shadow-sm hover:border-foreground/20 cursor-pointer py-4 rounded-lg gap-1"
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/${pkg.name}`);
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            <div className="flex items-center gap-2">
              {pkg.title}
              {isFeatured(pkg) && showFeaturedBadge && (
                <Badge className="px-2 py-0.5 text-[10px]">Featured</Badge>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap font-mono">
              {pkg.name}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {pkg.description}
        </p>
        <p className="text-[11px] text-muted-foreground">By {pkg.author}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {pkg.tags.map((tag, i) => (
            <Badge
              key={`${tag}-${i}`}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.preventDefault();
                e.stopPropagation();
                onTagClick(tag);
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
