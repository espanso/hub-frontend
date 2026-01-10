import { X } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface RemovableBadgeProps {
  children: React.ReactNode;
  onRemove: () => void;
  onClick?: () => void;
}

export function RemovableBadge({
  children,
  onRemove,
  onClick,
}: RemovableBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1 pl-2.5 pr-1"
      onClick={onClick}
    >
      <span>{children}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="rounded-full hover:bg-background/50 p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
