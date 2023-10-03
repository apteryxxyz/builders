'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function TokenTooltip(p: {
  style: React.CSSProperties;
  children: [string, string];
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        style={p.style}
        className="cursor-default underline decoration-dotted"
      >
        {p.children[0]}
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">{p.children[1]}</TooltipContent>
    </Tooltip>
  );
}
