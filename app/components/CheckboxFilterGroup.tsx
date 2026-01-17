import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface CheckboxFilterGroupProps {
  title: string;
  items: Array<{ tag: string; count: number; checked: boolean }>;
  onToggle: (tag: string) => void;
  limit?: number;
}

export function CheckboxFilterGroup({
  title,
  items,
  onToggle,
  limit = 15,
}: CheckboxFilterGroupProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAll ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      <div className="space-y-2 ps-5 md:ps-0">
        {displayedItems.map(({ tag, count, checked }) => (
          <div key={tag} className="flex items-center space-x-2">
            <Checkbox
              id={`tag-${tag}`}
              checked={checked}
              onCheckedChange={() => onToggle(tag)}
            />
            <Label
              htmlFor={`tag-${tag}`}
              className="text-sm font-normal capitalize cursor-pointer flex-1"
            >
              {tag} ({count})
            </Label>
          </div>
        ))}
      </div>
      {hasMore && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full"
        >
          Show More
        </Button>
      )}
    </div>
  );
}
