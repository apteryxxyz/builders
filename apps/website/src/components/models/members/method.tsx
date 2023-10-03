import {
  ApiItemKind,
  type ApiItem,
  type ApiMethod,
  type ApiMethodSignature,
} from '@microsoft/api-extractor-model';
import { Fragment } from 'react';
import { TSDoc } from '../../tsdoc';
import { ParametersSection } from '../sections/parameters';
import { ReturnsSection } from '../sections/returns';
import { TypeParametersSection } from '../sections/type-parameters';
import { Heading } from './heading';

export type MethodLike = ApiMethod | ApiMethodSignature;
export function isMethodLike(item: ApiItem): item is MethodLike {
  return (
    item.kind === ApiItemKind.Method ||
    item.kind === ApiItemKind.MethodSignature
  );
}

export function Method(p: { item: MethodLike }) {
  return (
    <section className="flex flex-col gap-3">
      {/* <h4 className="-ml-9 text-lg font-semibold">
        <Heading
          item={p.item}
          hash={`${p.item.name}${
            p.item.overloadIndex && p.item.overloadIndex > 1
              ? `:${p.item.overloadIndex}`
              : ''
          }`}
        >
          {p.item.name}
          <>
            {'('}
            {p.item.parameters.length > 0 &&
              p.item.parameters
                .flatMap((p) => [
                  <Fragment key={p.name}>
                    {p.name}
                    {p.isOptional && '?'}
                  </Fragment>,
                  ', ',
                ])
                .slice(0, -1)}
            {')'}
          </>
        </Heading>
      </h4> */}

      <Heading item={p.item} hash={p.item.displayName}>
        {p.item.name}
        {'('}
        {p.item.parameters.length > 0 &&
          p.item.parameters
            .flatMap((p) => [
              <Fragment key={p.name}>
                {p.name}
                {p.isOptional && '?'}
              </Fragment>,
              ', ',
            ])
            .slice(0, -1)}
        {')'}
      </Heading>

      {p.item.tsdocComment?.summarySection &&
        !p.item.name.startsWith('new ') && (
          <TSDoc item={p.item} node={p.item.tsdocComment.summarySection} />
        )}

      <>
        <ParametersSection {...p} isChild />
        <TypeParametersSection {...p} isChild />
        {/* Constructors dont have return types */}
        {'returnTypeExcerpt' in p.item && <ReturnsSection {...p} isChild />}
      </>
    </section>
  );
}
