import type { ApiClass } from '@microsoft/api-extractor-model';
import { ConstructorSection } from './sections/constructor';
import { Heading } from './sections/heading';
import { MethodsSection } from './sections/methods';
import { PropertiesSection } from './sections/properties';

export function Class(p: { item: ApiClass }) {
  return (
    <>
      <Heading {...p} />
      <ConstructorSection {...p} />
      <PropertiesSection {...p} />
      <MethodsSection {...p} />
    </>
  );
}
