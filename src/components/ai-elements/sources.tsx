"use client";

import { cn } from "@/lib/utils";
import { BookIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "../ui/disclosure";

export type SourcesProps = ComponentProps<typeof Disclosure>;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Disclosure
    className={cn("not-prose text-primary text-xs", className)}
    {...props}
  />
);

export type SourcesTriggerProps = Omit<
  ComponentProps<typeof DisclosureTrigger>,
  "children"
> & {
  totalSources: number;
};

export const SourcesTrigger = ({
  className,
  totalSources,
  ...props
}: SourcesTriggerProps) => (
  <DisclosureTrigger
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    <p className="font-medium">{totalSources} Sources</p>
    <ChevronDownIcon className="h-4 w-4" />
  </DisclosureTrigger>
);

export type SourcesContentProps = ComponentProps<typeof DisclosureContent>;

export const SourcesContent = ({
  className,
  ...props
}: SourcesContentProps) => (
  <DisclosureContent
    className={cn("flex w-fit flex-col gap-2 border p-2 rounded-md", className)}
    {...props}
  />
);

export type SourceProps = ComponentProps<"a">;

export const Source = ({ href, title, ...props }: SourceProps) => (
  <a
    className="flex items-center gap-2 hover:underline"
    href={href}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    <BookIcon className="h-4 w-4" />
    <span className="block font-medium">{title}</span>
  </a>
);
