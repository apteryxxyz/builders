'use client';

import { useDidUpdate } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { Package } from '@/app/api';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavigationProvider } from '@/contexts/navigation';
import { PackagesProvider } from '@/contexts/packages';

export function Providers(p: React.PropsWithChildren<{ packages: Package[] }>) {
  const [isSidebarPopoverOpen, setSidebarPopoverOpen] = useState(false);

  // Ensure that sidebar popover is closed when navigation changes
  const pathname = usePathname();
  useDidUpdate(
    () => void (isSidebarPopoverOpen && setSidebarPopoverOpen(false)),
    [pathname],
  );

  return (
    <NavigationProvider
      value={{
        isSidebarPopoverOpen,
        setSidebarPopoverOpen,
      }}
    >
      <PackagesProvider value={p.packages}>
        <TooltipProvider>{p.children}</TooltipProvider>
      </PackagesProvider>
    </NavigationProvider>
  );
}
