import {
  ApiItemKind,
  type ApiItem,
  type ApiProperty,
  type ApiPropertySignature,
} from '@microsoft/api-extractor-model';
import { ExcerptText } from '@/components/excerpt-text';
import { TSDoc } from '@/components/tsdoc';
import { Heading } from './heading';

export type PropertyLike = ApiProperty | ApiPropertySignature;
export function isPropertyLike(item: ApiItem): item is PropertyLike {
  return (
    item.kind === ApiItemKind.Property ||
    item.kind === ApiItemKind.PropertySignature
  );
}

export function Property(p: { item: PropertyLike }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading item={p.item} hash={p.item.displayName}>
        {`${p.item.displayName}${p.item.isOptional ? '?' : ''}`}
        <>: </>
        {p.item.propertyTypeExcerpt.text && (
          <ExcerptText
            excerpt={p.item.propertyTypeExcerpt}
            model={p.item.getAssociatedModel()}
            inline
          />
        )}
      </Heading>

      {p.item.tsdocComment?.summarySection && (
        <TSDoc item={p.item} node={p.item.tsdocComment.summarySection} />
      )}
    </section>
  );
}
