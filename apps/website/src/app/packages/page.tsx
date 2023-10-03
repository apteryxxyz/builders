import { ArrowLeftIcon, ArrowRightIcon, PackageIcon } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next/types';
import { Button } from '@/components/ui/button';
import { fetchPackages } from '../api';

export const metadata = {
  title: 'Builder Packages',
  description: 'Select a package to view its documentation.',
} satisfies Metadata;

export default async function Page() {
  const packages = await fetchPackages();

  return (
    <main className="mx-auto max-w-lg space-y-6 p-9">
      <h1 className="text-2xl font-bold">Select a package:</h1>

      <div className="flex flex-col gap-3">
        {packages.map(({ name }) => (
          <Button key={name} variant="secondary" asChild>
            <Link
              href={`/packages/${name}`}
              className="flex place-items-center gap-3"
            >
              <PackageIcon />
              <span className="font-bold md:text-lg">{name}</span>
              <ArrowRightIcon className="ml-auto" />
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/" className="flex place-items-center gap-3">
            <ArrowLeftIcon />
            <span className="font-semibold">Go back</span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
