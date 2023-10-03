import _ from 'next/dynamic';
import { notFound } from 'next/navigation';
import { fetchApi, fetchChoices, fetchPackages, fetchRelease } from '@/app/api';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { LayoutProps } from '@/types';
import { Providers } from './providers';

export async function generateStaticParams() {
  const packages = await fetchPackages();
  return packages.flatMap((p) =>
    p.releases.map(({ version }) => ({ package: p.name, version })),
  );
}

export default async function Layout(p: LayoutProps<['package', 'version']>) {
  const release = await fetchRelease(p.params.package, p.params.version);
  const api = release && (await fetchApi(p.params.package, release));
  if (!api) return notFound();

  const packages = await fetchPackages();
  const choices = await fetchChoices(p.params.package, release);

  return (
    <Providers packages={packages}>
      <div className="space-y-6 p-3 lg:p-6">
        {/* Passing the choices like this causes the whole API docs to be present on the page the whole time,  */}
        <Header choices={choices} />

        <div className="relative flex gap-6">
          <Sidebar items={[...api.members]} />

          <main className="mx-auto w-full max-w-5xl">{p.children}</main>
        </div>
      </div>
    </Providers>
  );
}
