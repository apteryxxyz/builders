import { createContext, useContext } from 'react';
import type { Package } from '../app/api';

export const PackagesContext = createContext<Package[]>(null!);
export const PackagesProvider = PackagesContext.Provider;

export function usePackages() {
  const context = useContext(PackagesContext);
  if (!context)
    throw new Error('usePackages must be used within a PackagesProvider');
  return context;
}
