import type{ ApiDeclaredItem, ApiItem } from '@microsoft/api-extractor-model';
import { ExcerptText } from '@/components/excerpt-text';
import { KindIcon } from '@/components/kind-icon';
import { TSDoc } from '@/components/tsdoc';

export function Heading(p: { item: ApiDeclaredItem & ApiItem }) {
  const summary = p.item.tsdocComment?.summarySection;
  const isNotConstructor =
    !('name' in p.item) || !String(p.item.name).startsWith('new ');

  const remarks = p.item.tsdocComment?.remarksBlock?.content;

  const example = p.item.tsdocComment?.customBlocks //
    .find((x) => x.blockTag.tagName === '@example')?.content;

  return (
    <div className="mb-3 mt-6 flex flex-col gap-1.5">
      <h2 className="flex place-items-center gap-3 text-2xl font-bold">
        <KindIcon kind={p.item.kind} size={32} />
        {p.item.displayName}
      </h2>

      <ExcerptText
        excerpt={p.item.excerpt}
        model={p.item.getAssociatedModel()}
      />

      {summary && isNotConstructor && <TSDoc item={p.item} node={summary} />}

      {example && (
        <>
          <h3 className="mt-6 text-xl font-semibold">Example</h3>
          <TSDoc item={p.item} node={example} />
        </>
      )}

      {remarks && (
        <>
          <h3 className="mt-6 text-xl font-semibold">Remarks</h3>
          <TSDoc item={p.item} node={remarks} />
        </>
      )}
    </div>
  );
}
