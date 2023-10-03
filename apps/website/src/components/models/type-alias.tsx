import type { ApiTypeAlias } from '@microsoft/api-extractor-model';
import { Heading } from './sections/heading';

export function TypeAlias(p: { item: ApiTypeAlias }) {
  return <Heading {...p} />;
}
