import type { ApiItemContainerMixin } from '@microsoft/api-extractor-model';
import { Fragment, useMemo } from 'react';
import { Section } from '.';
import { isPropertyLike, Property } from '../members/property';

export function PropertiesSection(p: { item: ApiItemContainerMixin }) {
  const propertyElements = useMemo(() => {
    return p.item.members
      .filter(isPropertyLike)
      .map((property, index, self) => (
        <Fragment key={property.displayName}>
          <Property item={property} />
          {index !== self.length - 1 && <hr className="my-3" />}
        </Fragment>
      ));
  }, [p.item.members]);

  return propertyElements.length > 0 ? (
    <Section name="Properties" defaultOpen>
      {propertyElements}
    </Section>
  ) : null;
}
