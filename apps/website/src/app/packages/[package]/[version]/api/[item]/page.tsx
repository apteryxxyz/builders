import {
  ApiDeclaredItem,
  ApiItemKind,
  type ApiClass,
  type ApiFunction,
  type ApiInterface,
  type ApiItem,
  type ApiTypeAlias,
  type ApiVariable,
} from '@microsoft/api-extractor-model';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next/types';
import { fetchApi, fetchItem, fetchRelease } from '@/app/api';
import { Class } from '@/components/models/class';
import { Function } from '@/components/models/function';
import { Interface } from '@/components/models/interface';
import { TypeAlias } from '@/components/models/type-alias';
import { Variable } from '@/components/models/variable';
import type { PageProps } from '@/types';
import { flattenDocNode } from '@/utilities/api-serialize';

function buildParamsFromMember(
  name: string,
  version: string,
  item: ApiItem,
): { package: string; version: string; item: string }[] {
  if (item.kind === ApiItemKind.Namespace) {
    return item.members.flatMap((member) =>
      buildParamsFromMember(name, version, member),
    );
  } else {
    return [
      {
        package: name,
        version,
        item:
          item.canonicalReference.symbol?.componentPath?.toString() ??
          item.displayName,
      },
    ];
  }
}

export async function generateStaticParams(
  p: PageProps<['package', 'version']>,
) {
  const release = await fetchRelease(p.params.package, p.params.version);
  if (!release) notFound();

  const api = await fetchApi(p.params.package, release);
  return api.members.flatMap((m) =>
    buildParamsFromMember(p.params.package, p.params.version, m),
  );
}

export async function generateMetadata(
  p: PageProps<['package', 'version', 'item']>,
) {
  const release = await fetchRelease(p.params.package, p.params.version);
  if (!release) notFound();

  const member = await fetchItem(p.params.package, release, p.params.item);
  if (!member) notFound();

  return {
    title: `${member.canonicalReference.symbol?.componentPath?.toString()} | @builders/${
      p.params.package
    }`,
    description: flattenDocNode(
      (member as ApiDeclaredItem).tsdocComment?.summarySection,
    ),
  } satisfies Metadata;
}

export default async function Page(
  p: PageProps<['package', 'version', 'item']>,
) {
  const release = await fetchRelease(p.params.package, p.params.version);
  if (!release) notFound();

  const member = await fetchItem(p.params.package, release, p.params.item);
  if (!member) notFound();

  switch (String(member.kind)) {
    case 'Class':
      return <Class item={member as ApiClass} />;
    case 'Function':
      return <Function item={member as ApiFunction} />;
    case 'Interface':
      return <Interface item={member as ApiInterface} />;
    case 'TypeAlias':
      return <TypeAlias item={member as ApiTypeAlias} />;
    case 'Variable':
      return <Variable item={member as ApiVariable} />;

    default:
      return (
        <span>
          Cannot render {member.kind.toLowerCase()} {member.displayName}
        </span>
      );
  }
}
