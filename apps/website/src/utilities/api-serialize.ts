import type {
  ApiItem,
  IApiClassOptions,
  IApiDeclaredItemOptions,
  IApiEnumOptions,
  IApiFunctionOptions,
  IApiInterfaceOptions,
  IApiNamespaceOptions,
  IApiTypeAliasOptions,
  IApiVariableOptions,
} from '@microsoft/api-extractor-model';
import type { DocNode, DocNodeContainer, DocPlainText } from '@microsoft/tsdoc';

export type ApiNamespaceJson = Omit<
  IApiNamespaceOptions,
  'kind' | 'members'
> & {
  kind: 'Namespace';
  members: ApiItemJson[];
};

export type ApiClassJson = Omit<IApiClassOptions, 'kind' | 'members'> & {
  kind: 'Class';
  members: ApiItemJson[];
};

export type ApiInterfaceJson = Omit<
  IApiInterfaceOptions,
  'kind' | 'members'
> & {
  kind: 'Interface';
  members: ApiItemJson[];
};

export type ApiEnumJson = Omit<IApiEnumOptions, 'kind' | 'members'> & {
  kind: 'Enum';
  members: ApiItemJson[];
};

export type ApiFunctionJson = IApiFunctionOptions & {
  kind: 'Function';
};

export type ApiVariableJson = IApiVariableOptions & {
  kind: 'Variable';
};

export type ApiTypeAliasJson = IApiTypeAliasOptions & {
  kind: 'TypeAlias';
};

export type ApiDeclaredItemJson = IApiDeclaredItemOptions;

export type ApiItemJson = Omit<
  Required<Parameters<ApiItem['serializeInto']>[0]> & ApiDeclaredItemJson,
  'kind'
> &
  (
    | ApiNamespaceJson
    | ApiClassJson
    | ApiInterfaceJson
    | ApiEnumJson
    | ApiFunctionJson
    | ApiVariableJson
    | ApiTypeAliasJson
  );

export function serializeApiItem(item: ApiItem) {
  const object = {} as Record<string, unknown>;
  item.serializeInto(object);
  return object as ApiItemJson;
}

export function groupByKind<T extends { kind: string }>(items: T[]) {
  return Object.entries({
    Namespaces: items.filter((m) => m.kind === 'Namespace'),
    Classes: items.filter((m) => m.kind === 'Class'),
    Enums: items.filter((m) => m.kind === 'Enum'),
    Functions: items.filter((m) => m.kind === 'Function'),
    Interfaces: items.filter((m) => m.kind === 'Interface'),
    Types: items.filter((m) => m.kind === 'TypeAlias'),
    Variables: items.filter((m) => m.kind === 'Variable'),
  })
    .filter(([, items]) => items.length > 0)
    .map(([name, items]) => ({ name, items }));
}

export function flattenDocNode(node?: DocNode): string {
  switch (node?.kind) {
    case 'Section':
    case 'Paragraph':
      return (node as DocNodeContainer).nodes.flatMap(flattenDocNode).join('');
    case 'PlainText':
      return (node as DocPlainText).text;
    default:
      return '';
  }
}
