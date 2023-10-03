import type { ApiTypeParameterListMixin } from '@microsoft/api-extractor-model';
import { useMemo } from 'react';
import { ExcerptText } from '@/components/excerpt-text';
import { TSDoc } from '@/components/tsdoc';
import { QuickTable } from '@/components/ui/table';
import { Section } from '.';

export function TypeParametersSection(p: {
  item: ApiTypeParameterListMixin;
  isChild?: true;
}) {
  const typeParametersData = useMemo(() => {
    return p.item.typeParameters.map((tp) => ({
      Name: tp.name,
      Constraint: !tp.constraintExcerpt.isEmpty && (
        <ExcerptText
          excerpt={tp.constraintExcerpt}
          model={p.item.getAssociatedModel()}
          inline
        />
      ),
      Default:
        !tp.defaultTypeExcerpt.isEmpty &&
        (tp.defaultTypeExcerpt.text !== tp.constraintExcerpt.text ? (
          <ExcerptText
            excerpt={tp.defaultTypeExcerpt}
            model={p.item.getAssociatedModel()}
            inline
          />
        ) : (
          '<'
        )),
      Description: tp.tsdocTypeParamBlock?.content ? (
        <TSDoc item={p.item} node={tp.tsdocTypeParamBlock?.content} />
      ) : (
        'None'
      ),
    }));
  }, [p.item]);

  return typeParametersData.length > 0 ? (
    <Section
      name="Type Parameters"
      isChild={p.isChild}
      defaultOpen={!p.isChild}
    >
      <QuickTable data={typeParametersData} />
    </Section>
  ) : null;
}
