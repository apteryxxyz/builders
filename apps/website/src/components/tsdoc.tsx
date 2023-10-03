import { ApiItemKind, type ApiItem } from '@microsoft/api-extractor-model';
import type {
  DocCodeSpan,
  DocLinkTag,
  DocNode,
  DocNodeContainer,
  DocPlainText,
} from '@microsoft/tsdoc';
import Link from 'next/link';
import { Fragment, useCallback } from 'react';
import { serializeApiItem } from '@/utilities/api-serialize';
import { CodeSpan, FencedCode } from './code';
import { ItemLink } from './item-link';

export function TSDoc(p: { item: ApiItem; node: DocNode }) {
  const createNode = useCallback(
    (node: DocNode, index: number) => {
      switch (node.kind) {
        case 'PlainText':
          return <Fragment key={index}>{(node as DocPlainText).text}</Fragment>;

        case 'Section':
          return (
            <div key={index}>
              {(node as DocNodeContainer).nodes.map(createNode)}
            </div>
          );

        case 'Paragraph':
          return (
            <p key={index}>
              {(node as DocNodeContainer).nodes.map(createNode)}
            </p>
          );

        case 'SoftBreak':
          return <Fragment key={index} />;

        case 'FencedCode':
          return (
            <FencedCode key={index}>{(node as DocCodeSpan).code}</FencedCode>
          );

        case 'CodeSpan':
          return <CodeSpan key={index}>{(node as DocCodeSpan).code}</CodeSpan>;

        case 'LinkTag': {
          const { codeDestination, urlDestination, linkText } =
            node as DocLinkTag;

          if (codeDestination) {
            const identifier =
              codeDestination.memberReferences[0].memberIdentifier?.identifier;
            if (!identifier) return null;

            const foundItem = p.item
              .getAssociatedPackage()
              ?.entryPoints[0].findMembersByName(identifier)
              .find((x) => x.kind !== ApiItemKind.Namespace);
            if (!foundItem) return <span key={index}>{identifier + 'n'}</span>;

            return (
              <ItemLink
                key={index}
                item={serializeApiItem(foundItem)}
                className="text-blue-500 hover:underline"
              >
                {linkText ?? urlDestination ?? foundItem.displayName}
              </ItemLink>
            );
          }

          if (urlDestination) {
            return (
              <Link key={index} href={urlDestination}>
                {linkText ?? urlDestination}
              </Link>
            );
          }

          return null;
        }

        default:
          console.warn('Captured unknown node kind:', node.kind);
          return null;
      }
    },
    [p.item],
  );

  return createNode(p.node, 0);
}
