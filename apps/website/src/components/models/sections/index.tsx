import { KindIcon } from '@/components/kind-icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/utilities/class-name';

export function Section(
  p: React.PropsWithChildren<{
    name: string;
    icon?: React.ReactNode;
    isChild?: boolean;
    defaultOpen?: boolean;
  }>,
) {
  return (
    <Collapsible defaultOpen={p.defaultOpen} asChild>
      <section>
        <CollapsibleTrigger className={cn(p.isChild && 'py-3')}>
          <span
            className={cn(
              'flex place-items-center gap-3 text-xl font-semibold',
              p.isChild && 'text-md',
            )}
          >
            {p.icon ?? <KindIcon kind={p.name} />} {p.name}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="pl-9">{p.children}</CollapsibleContent>
      </section>
    </Collapsible>
  );
}
