import { ArrowLeftIcon, ArrowRightIcon, PackageIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next/types';
import { fetchPackage, fetchPackages } from '@/app/api';
import { Button } from '@/components/ui/button';
import type { PageProps } from '@/types';

export async function generateStaticParams() {
  const packages = await fetchPackages();
  return packages.flatMap((p) => ({ package: p.name }));
}

export async function generateMetadata(p: PageProps<['package']>) {
  const pacxage = await fetchPackage(p.params.package);
  if (!pacxage) notFound();

  return {
    title: `Select a ${pacxage.name} Version`,
    description: 'Select a version to view its documentation.',
  } satisfies Metadata;
}

export default async function Page(p: PageProps<['package']>) {
  const pacxage = await fetchPackage(p.params.package);
  if (!pacxage) notFound();

  return (
    <main className="mx-auto max-w-lg space-y-6 p-9">
      <h1 className="text-2xl font-bold">Select a version:</h1>

      <div className="flex flex-col gap-3">
        {pacxage.releases.map(({ version }) => (
          <Button key={version} variant="secondary" asChild>
            <Link
              href={`/packages/${pacxage.name}/${version}`}
              className="flex place-items-center gap-3"
            >
              <PackageIcon />
              <span className="font-bold md:text-lg">{version}</span>
              <ArrowRightIcon className="ml-auto" />
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/packages" className="flex place-items-center gap-3">
            <ArrowLeftIcon />
            <span className="font-semibold">Go back</span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
