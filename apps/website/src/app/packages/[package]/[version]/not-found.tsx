'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center">
        <h2 className="text-[9rem] font-black leading-none md:text-[12rem]">
          404
        </h2>
        <h3 className="text-[2rem] md:text-[3rem]">Not found.</h3>
      </div>

      <Button asChild>
        <Link
          href={pathname.split('/').slice(0, 4).join('/')}
          className="flex place-items-center gap-3"
        >
          <ArrowLeftIcon />
          <span className="font-semibold">Go home</span>
        </Link>
      </Button>
    </div>
  );
}
