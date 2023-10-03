import type { ApiModel, Excerpt } from '@microsoft/api-extractor-model';
import { Fragment, use } from 'react';
import { cn } from '@/utilities/class-name';
import { highlightSyntax } from '@/utilities/highlight-syntax';
import { ItemLink } from './item-link';
import { TokenTooltip } from './token-tooltip';

export function ExcerptText(p: {
  excerpt: Excerpt;
  model?: ApiModel;
  inline?: boolean;
}) {
  const lines = use(highlightSyntax(p));

  const Pre = p.inline ? 'code' : 'pre';
  const Code = p.inline ? 'span' : 'code';

  return (
    <Pre className={cn(p.inline && 'flex flex-col')}>
      {lines.map((line, index) => (
        <Code key={index}>
          {line.map((token, index) => {
            if (token.meta?.type === 'out')
              return (
                <Fragment key={index}>
                  {token.prefix}
                  <a
                    href={token.meta.value}
                    target="_blank"
                    rel="external noreferrer noopener"
                    style={token.style}
                  >
                    {token.content}
                  </a>
                  {token.suffix}
                </Fragment>
              );

            if (token.meta?.type === 'ref')
              return (
                <Fragment key={index}>
                  {token.prefix}
                  <ItemLink item={token.meta.value} style={token.style}>
                    {token.content}
                  </ItemLink>
                  {token.suffix}
                </Fragment>
              );

            if (token.meta?.type === 'tip') {
              return (
                <Fragment key={index}>
                  {token.prefix}
                  <TokenTooltip style={token.style}>
                    {token.content}
                    {token.meta.value}
                  </TokenTooltip>
                  {token.suffix}
                </Fragment>
              );
            }

            return (
              <span key={index} style={token.style}>
                {token.prefix}
                {token.content}
                {token.suffix}
              </span>
            );
          })}
        </Code>
      ))}
    </Pre>
  );
}
