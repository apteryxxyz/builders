'use client';

import Link from 'next/link';
import type { Choice } from '@/app/api';
import { useCurrentPathMeta } from '@/hooks/use-current-path-meta';
import { CommandK } from './command-k';
import { MenuOpener } from './menu-opener';
import { ThemeSwitcher } from './theme-switcher';

export function Header(p: { choices: Choice[] }) {
  const { packageName, packageVersion } = useCurrentPathMeta();

  return (
    <header className="sticky top-6 z-10 flex h-14 items-center gap-3 rounded-lg border bg-background p-3 lg:h-20 lg:p-6">
      <h1 className="mr-auto space-x-1.5 md:text-lg">
        <Link href="/">builders</Link>
        <span>/</span>
        <Link
          href={`/packages/${packageName}/${packageVersion}`}
          className="font-bold"
        >
          {packageName}
        </Link>
      </h1>

      <CommandK choices={p.choices} />
      <ThemeSwitcher />
      <MenuOpener />
    </header>
  );
}
