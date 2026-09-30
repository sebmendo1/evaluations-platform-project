import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/* 08 §5a · Astro skin on the shadcn Button foundation.
   Maps former .btn / .btn.pri / .btn.dan / .btn.sm → outline / default /
   destructive / size sm. Hairline focus, weight 500, no elevation. */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[6px] border bg-clip-padding text-[13px] leading-[18px] font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1 disabled:pointer-events-none disabled:opacity-55 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Former .btn.pri — filled Chase blue, white label (09 §6). */
        default:
          "border-primary bg-primary text-primary-foreground hover:border-accent-strong hover:bg-accent-strong",
        /* Former .btn — paper fill, line-2 border. */
        outline:
          "border-line-2 bg-background text-foreground hover:border-ink-3 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-panel-2 aria-expanded:bg-secondary",
        ghost:
          "border-transparent bg-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        /* Former .btn.dan — discard text and border, not a filled red. */
        destructive:
          "border-destructive bg-background text-destructive hover:bg-discard-bg focus-visible:outline-destructive",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        /* 08 §3 · controls share 32px. */
        default: "h-8 min-h-8 px-3.5 py-1.5",
        xs: "h-6 min-h-6 gap-1 rounded-[6px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        /* Former .btn.sm — 26px. */
        sm: "h-[26px] min-h-[26px] gap-1 rounded-[6px] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 min-h-9 gap-1.5 px-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[6px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[6px]",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
