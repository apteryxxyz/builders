import type { ApiInterface } from '@microsoft/api-extractor-model';
import { Heading } from './sections/heading';
import { PropertiesSection } from './sections/properties';

export function Interface(p: { item: ApiInterface }) {
  return (
    <>
      <Heading {...p} />
      <PropertiesSection {...p} />
    </>
  );
}
