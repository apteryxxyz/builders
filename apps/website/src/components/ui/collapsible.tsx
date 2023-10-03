'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/utilities/class-name';

const Collapsible = CollapsiblePrimitive.Root;

// const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, children, ...props }, ref) => (
  <>
    <CollapsiblePrimitive.CollapsibleTrigger
      ref={ref}
      className={cn(
        'flex w-full flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      <>
        {children}
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </>
    </CollapsiblePrimitive.CollapsibleTrigger>
  </>
));
CollapsibleTrigger.displayName =
  CollapsiblePrimitive.CollapsibleTrigger.displayName;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, children, ...props }, ref) => (
  <>
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref}
      className={cn(
        'overflow-hidden text-sm data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
        className,
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </CollapsiblePrimitive.CollapsibleContent>
    <div className="border-b"></div>
  </>
));
CollapsibleContent.displayName =
  CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
