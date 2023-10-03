'use client';

import { useNavigation } from '@/contexts/navigation';
import { cn } from '@/utilities/class-name';
import { PackageSelect } from './package-select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

export function SidebarWrapper(p: React.PropsWithChildren<{ isChild?: true }>) {
  const { isSidebarPopoverOpen } = useNavigation();

  if (p.isChild) {
    return <div>{p.children}</div>;
  } else {
    return (
      <aside
        className={cn(
          'z-40 hidden lg:block',
          isSidebarPopoverOpen && 'fixed block w-[calc(100vw_-_42px)]',
        )}
      >
        <div className="top-3 lg:sticky lg:top-32">
          <ScrollArea className="h-[calc(100vh_-_112px)] w-full rounded-lg border bg-background p-3 lg:h-[calc(100vh_-_152px)] lg:w-[320px]">
            <PackageSelect />
            <Separator className="mt-3" />
            <nav>{p.children}</nav>
          </ScrollArea>
        </div>
      </aside>
    );
  }
}
