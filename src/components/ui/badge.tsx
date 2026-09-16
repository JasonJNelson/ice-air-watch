import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-2xs font-medium uppercase tracking-[0.12em]",
  {
    variants: {
      tone: {
        removal: "bg-removal/15 text-removal",
        transfer: "bg-transfer/15 text-transfer",
        ground: "bg-ground/15 text-ground",
        live: "bg-live/15 text-live",
        muted: "bg-surface-2 text-muted",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
