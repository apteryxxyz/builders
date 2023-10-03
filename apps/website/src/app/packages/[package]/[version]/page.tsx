import { notFound } from 'next/navigation';
import type { Metadata } from 'next/types';
import { fetchPackage, fetchReadMe, fetchRelease } from '@/app/api';
import { Mdx } from '@/components/mdx';
import type { PageProps } from '@/types';

export async function generateStaticParams(p: PageProps<['package']>) {
  const pacxage = await fetchPackage(p.params.package);
  if (!pacxage) notFound();

  return pacxage.releases.map((r) => ({ version: r.version }));
}

export async function generateMetadata(p: PageProps<['package', 'version']>) {
  const pacxage = await fetchPackage(p.params.package);
  if (!pacxage) notFound();

  const release = await fetchRelease(p.params.package, p.params.version);
  if (!release) notFound();

  return {
    title: `@builders/${pacxage.name}`,
  } satisfies Metadata;
}

export default async function Page(p: PageProps<['package', 'version']>) {
  const release = await fetchRelease(p.params.package, p.params.version);
  if (!release) notFound();

  const readmeSource = await fetchReadMe(p.params.package, release);

  return <Mdx>{readmeSource}</Mdx>;
}
