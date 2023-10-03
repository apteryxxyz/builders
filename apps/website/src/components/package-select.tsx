'use client';

import { useRouter } from 'next/navigation';
import { usePackages } from '@/contexts/packages';
import { useCurrentPathMeta } from '@/hooks/use-current-path-meta';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function PackageSelect() {
  const router = useRouter();
  const packages = usePackages();
  const { packageName, packageVersion, itemPath } = useCurrentPathMeta();
  const currentPackage = packages.find((p) => p.name === packageName);
  const currentRelease = currentPackage?.releases //
    .find((r) => r.version === packageVersion);

  return (
    <div className="flex flex-col gap-3">
      <Select
        defaultValue={currentPackage?.name}
        onValueChange={(name) => router.push(`/packages/${name}/`)}
      >
        <SelectTrigger className="font-semibold">
          <SelectValue placeholder="Pick a package..." />
        </SelectTrigger>

        <SelectContent>
          {packages.map((p) => (
            <SelectItem key={p.name} value={p.name} className="cursor-pointer">
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={currentRelease?.version}
        onValueChange={(version) =>
          router.push(
            `/packages/${currentPackage?.name}/${version}/${itemPath ?? ''}`,
          )
        }
      >
        <SelectTrigger className="font-semibold">
          <SelectValue placeholder="Pick a version..." />
        </SelectTrigger>

        <SelectContent>
          {currentPackage?.releases.map((r) => (
            <SelectItem
              key={r.version}
              value={r.version}
              className="cursor-pointer"
            >
              {r.version}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
