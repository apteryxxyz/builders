'use client';

import Link from 'next/link';
import { useCurrentPathMeta } from '@/hooks/use-current-path-meta';
import type { ApiItemJson } from '@/utilities/api-serialize';

export function ItemLink(
  p: React.PropsWithChildren<
    {
      item: ApiItemJson | string;
    } & Omit<React.ComponentProps<typeof Link>, 'href'>
  >,
) {
  const { packageName, packageVersion } = useCurrentPathMeta();
  const itemPath =
    typeof p.item === 'string'
      ? p.item
      : p.item.canonicalReference.split('!')[1].split(':')[0];

  return (
    <Link
      {...p}
      href={`/packages/${packageName}/${packageVersion}/api/${itemPath}`}
    />
  );
}
