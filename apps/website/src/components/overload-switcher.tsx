'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function OverloadSwitcher(p: {
  name: string;
  overloads: React.ReactNode[];
}) {
  const [index, setIndex] = useState(1);

  const handleHash = useCallback(() => {
    if (typeof window === 'undefined') return;
    const [hashName, hashIndex] = window.location.hash.slice(1).split(':');
    if (hashName !== p.name) return;

    const hashOverload = Number.parseInt(hashIndex ?? '1', 10);
    const resolvedOverload = Math.min(hashOverload, p.overloads.length);
    setIndex(Number.isNaN(resolvedOverload) ? 1 : resolvedOverload);
  }, [p.name, p.overloads.length]);

  const pathname = usePathname();
  useEffect(handleHash, [pathname, handleHash]);

  return (
    <Tabs
      value={String(index)}
      onValueChange={(index) => {
        setIndex(Number(index));
        const newHash = index === '1' ? p.name : `${p.name}:${index}`;
        window.history.replaceState(null, '', `#${newHash}`);
      }}
    >
      <TabsList>
        {Array.from({ length: p.overloads.length }, (_, index) => (
          <TabsTrigger key={index + 1} value={String(index + 1)}>
            Overload {index + 1}
          </TabsTrigger>
        ))}
      </TabsList>

      {p.overloads.map((overload, index) => (
        <TabsContent key={index + 1} value={String(index + 1)}>
          {overload}
        </TabsContent>
      ))}
    </Tabs>
  );
}
