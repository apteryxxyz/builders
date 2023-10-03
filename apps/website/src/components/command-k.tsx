'use client';

import { useDidUpdate, useHotkeys } from '@mantine/hooks';
import Fuse from 'fuse.js';
import _ from 'lodash';
import { ArrowRightIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { Choice } from '@/app/api';
import { KindIcon } from './kind-icon';
import { Button } from './ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

const FUSE_OPTIONS = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'summary', weight: 0.3 },
  ],
};
export function CommandK(p: { choices: Choice[] }) {
  const [open, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((_) => !_), [setIsOpen]);
  useHotkeys([
    ['/', toggleOpen],
    ['mod+k', toggleOpen],
  ]);

  const [query, setQuery] = useState('');
  useDidUpdate(() => setQuery(''), [open]);
  const fuse = useMemo(() => new Fuse(p.choices, FUSE_OPTIONS), [p.choices]);

  const [results, setResults] = useState<Choice[]>([]);
  useDidUpdate(
    () => setResults(fuse.search(query, { limit: 9 }).map((r) => r.item)),
    [query],
  );

  const router = useRouter();
  const resultElements = useMemo(
    () =>
      results.map((result) => (
        <CommandItem
          key={result.path}
          className="cursor-pointer"
          onSelect={() => {
            router.push(result.path);
            setIsOpen(false);
          }}
        >
          <div className="flex-1">
            <h2 className="flex place-items-center gap-1">
              <KindIcon kind={result.kind} />
              <span className="font-semibold">{result.name}</span>
            </h2>
            <p>{_.truncate(result.summary, { length: 50 })}</p>
            <span className="hidden text-xs font-light opacity-75 sm:block">
              {result.path}
            </span>
          </div>

          <ArrowRightIcon />
        </CommandItem>
      )),
    [results, router],
  );

  return (
    <>
      <Button
        variant="outline"
        className="hidden place-items-center gap-3 px-2 pr-20 lg:flex"
        onClick={toggleOpen}
      >
        <SearchIcon />
        <span className="opacity-65">
          Type <kbd>/</kbd> to search...
        </span>
      </Button>
      <Button
        variant="ghost"
        className="aspect-square p-0 lg:hidden"
        onClick={toggleOpen}
      >
        <SearchIcon />
      </Button>

      <CommandDialog open={open} onOpenChange={setIsOpen}>
        <Command label="Command Menu" shouldFilter={false}>
          <CommandInput
            placeholder="Quick search..."
            value={query}
            onValueChange={setQuery}
          />

          <CommandList>
            <CommandEmpty>
              No results found. Try searching for something else.
            </CommandEmpty>

            {resultElements.length > 0 && (
              <CommandGroup heading="API">{resultElements}</CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
