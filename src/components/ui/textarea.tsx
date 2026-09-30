import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
 HTMLTextAreaElement,
 React.ComponentProps<"textarea">
>(function Textarea({ className, ...props }, ref) {
 return (
 <textarea
 ref={ref}
 data-slot="textarea"
 className={cn(
 /* 08 §5a · same skin as Input: Chase radius, hairline focus, no elevation. */
 "flex field-sizing-content min-h-16 w-full rounded-[6px] border border-input bg-background px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-[13px]",
 className,
 )}
 {...props}
 />
 );
});

export { Textarea };
