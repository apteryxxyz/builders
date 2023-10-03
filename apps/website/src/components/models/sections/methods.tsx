import type {
  ApiItemContainerMixin,
  ApiMethod,
} from '@microsoft/api-extractor-model';
import { Fragment, useMemo } from 'react';
import { OverloadSwitcher } from '@/components/overload-switcher';
import { Section } from '.';
import { isMethodLike, Method } from '../members/method';

export function MethodsSection(p: { item: ApiItemContainerMixin }) {
  const methodElements = useMemo(() => {
    return p.item.members
      .filter(isMethodLike)
      .filter(
        (method, index, self) =>
          index === self.findIndex((m) => m.displayName === method.displayName),
      )
      .map((method, index, self) => {
        const siblings = method.getMergedSiblings() as ApiMethod[];

        const body =
          siblings.length > 1 ? (
            <OverloadSwitcher
              name={method.displayName}
              overloads={siblings.map((sibling, index) => (
                <Method key={sibling.displayName + index} item={sibling} />
              ))}
            />
          ) : (
            <Method item={method} />
          );

        return (
          <Fragment key={method.displayName}>
            {body}
            {index !== self.length - 1 && <hr className="my-6" />}
          </Fragment>
        );
      });
  }, [p.item.members]);

  return methodElements.length > 0 ? (
    <Section name="Methods" defaultOpen>
      {methodElements}
    </Section>
  ) : null;
}
