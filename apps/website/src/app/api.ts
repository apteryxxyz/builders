/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { readdir as listDirectory, readFile } from 'node:fs/promises';
import { join as joinPath } from 'node:path';
import {
  ApiDeclaredItem,
  ApiEntryPoint,
  ApiItem,
  ApiItemKind,
  ApiModel,
  type ApiPackage,
} from '@microsoft/api-extractor-model';
import { TSDocConfiguration } from '@microsoft/tsdoc';
import { TSDocConfigFile } from '@microsoft/tsdoc-config';
import { Octokit } from '@octokit/rest';
import _ from 'lodash';
import { flattenDocNode } from '@/utilities/api-serialize';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: {
    fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => {
      init = _.merge(init ?? {}, { cache: 'force-cache' });
      return globalThis.fetch(input, init);
    },
  },
});

export interface Package {
  name: string;
  releases: Release[];
}

export interface Release {
  version: string;
  commit?: string;
}

export async function fetchPackages(): Promise<Package[]> {
  if (process.env.NODE_ENV === 'development') {
    const packagesDir = joinPath(process.cwd(), '../..', 'packages');
    const packageNames = await listDirectory(packagesDir);

    return packageNames
      .filter((name) => name !== 'internal')
      .map((name) => ({ name, releases: [{ version: 'local' }] }));
  }

  const { data: tags } = await octokit.repos.listTags({
    owner: 'apteryxxyz',
    // FIXME: Repo was originally called `next-sa`, but was renamed to `builders`
    // However the tags only exist on the old name, so we need to use that for now
    repo: 'next-sa',
  });

  const packages = new Map<string, Package>();
  tags.forEach((tag) => {
    const match = tag.name.match(/(?:@builders\/)(.+)@(.+)/);

    if (!match || !match[2].endsWith('0')) return;
    const [, name, version] = match;
    const object = { name, releases: [{ version, commit: tag.commit.sha }] };
    if (!packages.has(name)) packages.set(name, object);
    else packages.get(name)?.releases.push(object.releases[0]);
  });

  return Array.from(packages.values()).map((pkg) => ({
    name: pkg.name,
    releases: pkg.releases,
  }));
}

export async function fetchPackage(name: string) {
  const packages = await fetchPackages();
  return packages.find((pkg) => pkg.name === name);
}

export async function fetchRelease(packageName: string, version: string) {
  const pacxage = await fetchPackage(packageName);
  return pacxage?.releases.find((r) => r.version === version);
}

async function fetchContent(name: string, release: Release, path: string) {
  const relativePath = `packages/${name}/${path}`;

  if (process.env.NODE_ENV === 'development') {
    const path = joinPath(process.cwd(), '../..', relativePath);
    return readFile(path, 'utf-8');
  } else {
    const { data } = await octokit.repos.getContent({
      owner: 'apteryxxyz',
      repo: 'builders',
      path: relativePath,
      ref: release.commit,
    });

    if (!('type' in data) || data.type !== 'file')
      throw new Error('Not a file');
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
}

export async function fetchReadMe(name: string, release: Release) {
  return fetchContent(name, release, 'readme.md');
}

export async function fetchApi(name: string, release: Release) {
  const apiJson = await fetchContent(name, release, 'docs/api.json') //
    .then((content) => JSON.parse(content));

  const tsdocConfiguration = new TSDocConfiguration();
  const tsdocConfigObject = apiJson['metadata'].tsdocConfig as unknown;
  const tsdocConfigFile = TSDocConfigFile.loadFromObject(tsdocConfigObject);
  tsdocConfigFile.configureParser(tsdocConfiguration);

  const apiPackage = ApiItem.deserialize(apiJson, {
    apiJsonFilename: '',
    toolPackage: apiJson['metadata'].toolPackage,
    toolVersion: apiJson['metadata'].toolVersion,
    versionToDeserialize: apiJson['metadata'].schemaVersion,
    tsdocConfiguration,
  }) as ApiPackage;

  const model = new ApiModel();
  model.addMember(apiPackage);
  return apiPackage.entryPoints[0];
}

export async function fetchItem(
  packageName: string,
  packageRelease: Release,
  componentPath: string,
) {
  let api = await fetchApi(packageName, packageRelease);

  const componentParts = componentPath.split('.');

  for (let i = 0; i < componentParts.length; i++) {
    const name = componentParts[i];
    const matches = api.findMembersByName(name);

    if (i === componentParts.length - 1)
      return matches.find((m) => m.kind !== ApiItemKind.Namespace);

    const namespace = matches.find((m) => m.kind === ApiItemKind.Namespace);
    if (namespace) api = namespace as ApiEntryPoint;
  }

  return undefined;
}

export type Choice = Awaited<ReturnType<typeof fetchChoices>>[number];

export async function fetchChoices(
  packageName: string,
  packageRelease: Release,
) {
  return flattenApiItem(await fetchApi(packageName, packageRelease)).map(
    (item) => {
      const name =
        item.canonicalReference.symbol?.componentPath?.toString() ??
        item.displayName;
      const summary =
        'tsdocComment' in item
          ? flattenDocNode(item.tsdocComment?.summarySection)
          : undefined;
      const overloadIndex =
        'overloadIndex' in item && (item.overloadIndex as number) > 1
          ? `:${item.overloadIndex as number}`
          : '';

      return {
        kind: String(item.kind),
        name,
        summary,
        path: `/packages/${packageName}/${packageRelease.version}/api/${name}${overloadIndex}`,
      };
    },
  );
}

function flattenApiItem(item: ApiItem): (ApiItem | ApiDeclaredItem)[] {
  switch (item.kind) {
    case ApiItemKind.EntryPoint:
    case ApiItemKind.Namespace:
      return item.members.flatMap(flattenApiItem);
    case ApiItemKind.Class:
    case ApiItemKind.Interface:
      return [item, ...item.members.flatMap(flattenApiItem)];
    case ApiItemKind.Constructor:
      return [];
    default:
      return [item];
  }
}
