import Link from 'next/link';
import type { Metadata } from 'next/types';
import Balancer from 'react-wrap-balancer';
import { Button } from '@/components/ui/button';

export const metadata = {
  metadataBase: new URL(process.env.APP_URL),
  title: 'Builders',
  description: 'Build your features faster with Builders.',
} satisfies Metadata;

export default function Page() {
  return (
    <main className="mx-auto mt-28 flex w-full max-w-screen-xl flex-col items-center justify-center gap-10 px-5 text-center sm:mt-40 md:px-20">
      <h1 className="text-3xl font-bold sm:text-5xl md:text-7xl">
        <Balancer>
          Build your features{' '}
          <span className="rounded-sm bg-primary px-3 font-black leading-normal text-background">
            faster
          </span>{' '}
          with Builders.
        </Balancer>
      </h1>

      {/* <Balancer>
        <p>
        </p>
      </Balancer> */}

      <div className="space-y-3">
        <div className="flex place-content-center gap-3">
          <Button className="px-6 py-5 font-bold" asChild>
            <Link href="/packages/next/latest">Builders for Next.js</Link>
          </Button>
        </div>

        <div className="flex place-content-center gap-3">
          <Button variant="secondary" className="px-6 py-5" asChild>
            <Link
              href="https://github.com/apteryxxyz/builders"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </Button>
          <Button variant="secondary" className="px-6 py-5" asChild>
            <Link
              href="https://discord.gg/vZQbMhwsKY"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
