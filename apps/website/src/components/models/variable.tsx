import type { ApiVariable } from '@microsoft/api-extractor-model';
import { Heading } from './sections/heading';

export function Variable(p: { item: ApiVariable }) {
  return <Heading {...p} />;
}
