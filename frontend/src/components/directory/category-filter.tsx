"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { DIRECTORY_SECTION_LIST } from "@/lib/directory/sections";
import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  idPrefix: string;
  className?: string;
};

export function CategoryFilter({ idPrefix, className }: CategoryFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const current = DIRECTORY_SECTION_LIST.find(
    (section) => section.path === pathname,
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`${idPrefix}-category`}>Directory section</Label>
      <select
        id={`${idPrefix}-category`}
        value={current?.category ?? ""}
        onChange={(event) => {
          const next = DIRECTORY_SECTION_LIST.find(
            (section) => section.category === event.target.value,
          );
          if (next) {
            router.push(next.path);
          }
        }}
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {DIRECTORY_SECTION_LIST.map((section) => (
          <option key={section.category} value={section.category}>
            {section.title}
          </option>
        ))}
      </select>
      <p className="text-caption text-muted-foreground">
        Switch between directory sections. Each section maps to a listings API
        category.
      </p>
      <ul className="text-caption space-y-1 text-muted-foreground">
        {DIRECTORY_SECTION_LIST.map((section) => (
          <li key={section.category}>
            {section.path === pathname ? (
              <span className="font-medium text-foreground">{section.title}</span>
            ) : (
              <Link href={section.path} className="text-primary hover:underline">
                {section.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
