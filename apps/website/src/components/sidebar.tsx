import {
  type ApiFunction,
  type ApiItem,
  ApiItemKind,
} from '@microsoft/api-extractor-model';
import { serializeApiItem } from '@/utilities/api-serialize';
import { ItemLink } from './item-link';
import { KindIcon } from './kind-icon';
import { SidebarWrapper } from './sidebar-wrapper';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

function groupItems(items: ApiItem[]) {
  return Object.entries({
    Namespaces: items.filter((m) => m.kind === ApiItemKind.Namespace),
    Classes: items.filter((m) => m.kind === ApiItemKind.Class),
    Enums: items.filter((m) => m.kind === ApiItemKind.Enum),
    Functions: items.filter((m) => m.kind === ApiItemKind.Function),
    Interfaces: items.filter((m) => m.kind === ApiItemKind.Interface),
    Types: items.filter((m) => m.kind === ApiItemKind.TypeAlias),
    Variables: items.filter((m) => m.kind === ApiItemKind.Variable),
  })
    .filter(([, items]) => items.length > 0)
    .map(([name, items]) => ({ name, items }));
}

export function Sidebar(p: { items: ApiItem[]; isChild?: true }) {
  const groups = groupItems(
    p.items.filter((m) => {
      if (m.kind !== ApiItemKind.Function) return true;
      return (m as ApiFunction).overloadIndex === 1;
    }),
  );

  return (
    <SidebarWrapper isChild={p.isChild}>
      <Accordion type="single" collapsible>
        {groups.map((group) => (
          <SidebarItemWrapper key={group.name} name={group.name} isGroup>
            <Accordion type="single" collapsible>
              {group.items.map((item) => (
                <SidebarItem key={item.displayName} item={item} />
              ))}
            </Accordion>
          </SidebarItemWrapper>
        ))}
      </Accordion>
    </SidebarWrapper>
  );
}

function SidebarItemWrapper(
  p: React.PropsWithChildren<{ name: string; isGroup?: true }>,
) {
  return (
    <AccordionItem value={p.name} className="last-of-type:border-b-0">
      <AccordionTrigger>
        <span className="flex items-center gap-3">
          {p.isGroup && <KindIcon kind={p.name} />}
          {p.name}
        </span>
      </AccordionTrigger>

      <AccordionContent className="pl-3">{p.children}</AccordionContent>
    </AccordionItem>
  );
}

function SidebarItem(p: { item: ApiItem }) {
  if (p.item.kind !== ApiItemKind.Namespace) {
    return (
      <ItemLink
        item={serializeApiItem(p.item)}
        className="block py-1.5 hover:underline"
      >
        {p.item.displayName}
      </ItemLink>
    );
  }

  return (
    <SidebarItemWrapper name={p.item.displayName}>
      <Sidebar items={[...p.item.members]} isChild />
    </SidebarItemWrapper>
  );
}
