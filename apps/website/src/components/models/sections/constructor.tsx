import {
  ApiItemKind,
  type ApiClass,
  type ApiMethod,
} from '@microsoft/api-extractor-model';
import { Section } from '.';
import { Method } from '../members/method';

export function ConstructorSection(p: { item: ApiClass }) {
  const constructor = p.item.members //
    .find((m) => m.kind === ApiItemKind.Constructor);
  if (!constructor) return null;

  return (
    <Section name="Constructor" defaultOpen>
      <Method
        item={
          Object.assign(constructor, {
            name: 'new ' + p.item.name,
            typeParameters: p.item.typeParameters,
          }) as unknown as ApiMethod
        }
      />
    </Section>
  );
}
