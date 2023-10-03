'use client';

import { MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigation } from '@/contexts/navigation';
import { cn } from '@/utilities/class-name';
import { Button } from './ui/button';

export function MenuOpener() {
  const { isSidebarPopoverOpen, setSidebarPopoverOpen } = useNavigation();
  const [isLocalOpen, setLocalOpen] = useState(isSidebarPopoverOpen);

  return (
    <Button
      variant="ghost"
      className={cn(
        'aspect-square p-0 transition-all duration-200 lg:hidden',
        isSidebarPopoverOpen ? 'rotate-180' : 'rotate-0',
      )}
      onClick={() => {
        const next = !isSidebarPopoverOpen;
        setSidebarPopoverOpen(next);
        setTimeout(() => setLocalOpen(next), 100);
      }}
    >
      {isLocalOpen ? <XIcon /> : <MenuIcon />}
    </Button>
  );
}
