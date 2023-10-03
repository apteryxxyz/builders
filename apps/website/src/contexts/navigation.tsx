import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';

interface NavigationContextProps {
  isSidebarPopoverOpen: boolean;
  setSidebarPopoverOpen: Dispatch<SetStateAction<boolean>>;
}

export const NavigationContext = createContext<NavigationContextProps>(null!);
export const NavigationProvider = NavigationContext.Provider;

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context)
    throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
}
