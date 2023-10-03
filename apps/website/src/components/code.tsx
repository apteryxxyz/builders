import React, { use, type PropsWithChildren } from 'react';
import { highlightSyntax } from '@/utilities/highlight-syntax';
import { textContent } from '@/utilities/text-content';

export function FencedCode(p: PropsWithChildren) {
  const code = textContent(p.children);
  const lines = use(highlightSyntax({ code: code.trim() }));

  return (
    <pre>
      {lines.map((line, index) => (
        <code key={index}>
          {line.map((token, index) => (
            <span key={index} style={token.style}>
              {token.prefix}
              {token.content}
              {token.suffix}
            </span>
          ))}
        </code>
      ))}
    </pre>
  );
}

export function CodeSpan(p: PropsWithChildren) {
  const code = textContent(p.children);
  return <code>{code}</code>;
}
