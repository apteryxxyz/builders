import type {
  ApiDocumentedItem,
  ApiParameterListMixin,
} from '@microsoft/api-extractor-model';
import { useMemo } from 'react';
import { ExcerptText } from '@/components/excerpt-text';
import { TSDoc } from '@/components/tsdoc';
import { QuickTable } from '@/components/ui/table';
import { Section } from '.';

export function ParametersSection(p: {
  item: ApiDocumentedItem & ApiParameterListMixin;
  isChild?: true;
}) {
  const parametersData = useMemo(() => {
    return p.item.parameters.map((pa) => ({
      Name: pa.name,
      Type: !pa.parameterTypeExcerpt.isEmpty && (
        <ExcerptText
          excerpt={pa.parameterTypeExcerpt}
          model={p.item.getAssociatedModel()}
          inline
        />
      ),
      Optional: pa.isOptional ? 'Yes' : 'No',
      Description: pa.tsdocParamBlock?.content ? (
        <TSDoc item={p.item} node={pa.tsdocParamBlock?.content} />
      ) : (
        'None'
      ),
    }));
  }, [p.item]);

  return parametersData.length > 0 ? (
    <Section name="Parameters" isChild={p.isChild} defaultOpen={!p.isChild}>
      <QuickTable data={parametersData} />
    </Section>
  ) : null;
}
