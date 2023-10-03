'use client';

import { usePathname } from 'next/navigation';

export function useCurrentPathMeta() {
  const pathParts = usePathname().split('/').slice(1);

  return {
    packageName: pathParts[1],
    packageVersion: pathParts[2],
    itemPath: pathParts[3],
  };
}
