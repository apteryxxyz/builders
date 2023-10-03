import type {
  ApiDeclaredItem,
  ApiReturnTypeMixin,
} from '@microsoft/api-extractor-model';
import { ExcerptText } from '@/components/excerpt-text';
import { TSDoc } from '@/components/tsdoc';
import { Section } from '.';

export function ReturnsSection(p: {
  item: ApiDeclaredItem & ApiReturnTypeMixin;
  isChild?: true;
}) {
  if (!p.item.returnTypeExcerpt.text) return null;

  return (
    <Section name="Returns" isChild={p.isChild} defaultOpen={!p.isChild}>
      <ExcerptText
        excerpt={p.item.returnTypeExcerpt}
        model={p.item.getAssociatedModel()}
        inline
      />

      {p.item.tsdocComment?.returnsBlock?.content && (
        <TSDoc item={p.item} node={p.item.tsdocComment.returnsBlock.content} />
      )}
    </Section>
  );
}
