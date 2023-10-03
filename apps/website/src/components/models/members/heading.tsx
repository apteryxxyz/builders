import type { ApiDocumentedItem } from '@microsoft/api-extractor-model';
import { LinkIcon } from 'lucide-react';
import { cn } from '@/utilities/class-name';
import { Badges } from '../../badges';

export function Heading(p: {
  item?: ApiDocumentedItem;
  hash?: string;
  className?: string;
  children: [React.ReactNode, ...React.ReactNode[]];
}) {
  return (
    <div className={cn('-ml-9 flex place-items-center gap-3', p.className)}>
      {p.hash && (
        <a className="inline-block" id={p.hash} href={'#' + p.hash}>
          <LinkIcon />
        </a>
      )}

      {p.item && <Badges item={p.item} />}

      <code className="flex place-items-center">
        <h4>{p.children[0]}</h4>
        {p.children.slice(1)}
      </code>
    </div>
  );
}
