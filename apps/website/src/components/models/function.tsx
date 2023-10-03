import type { ApiFunction } from '@microsoft/api-extractor-model';
import { OverloadSwitcher } from '../overload-switcher';
import { Heading } from './sections/heading';
import { ParametersSection } from './sections/parameters';
import { ReturnsSection } from './sections/returns';
import { TypeParametersSection } from './sections/type-parameters';

export function Function(p: { item: ApiFunction }) {
  const siblings = p.item.getMergedSiblings() as ApiFunction[];
  const body =
    siblings.length > 1 ? (
      <OverloadSwitcher
        name={p.item.displayName}
        overloads={siblings.map((sibling, index) => (
          <>
            <Heading item={sibling} />
            <FunctionBody key={sibling.displayName + index} item={sibling} />
          </>
        ))}
      />
    ) : (
      <>
        <Heading {...p} />
        <FunctionBody {...p} />
      </>
    );
  return body;
}

export function FunctionBody(p: { item: ApiFunction }) {
  return (
    <>
      <ParametersSection {...p} />
      <TypeParametersSection {...p} />
      <ReturnsSection {...p} />
    </>
  );
}
