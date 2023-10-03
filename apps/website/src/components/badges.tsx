import {
  ApiAbstractMixin,
  ApiDocumentedItem,
  ApiProtectedMixin,
  ApiReadonlyMixin,
  ApiStaticMixin,
} from '@microsoft/api-extractor-model';
import { Badge } from './ui/badge';

export function Badges(p: { item: ApiDocumentedItem }) {
  const isStatic = ApiStaticMixin.isBaseClassOf(p.item) && p.item.isStatic;
  const isProtected =
    ApiProtectedMixin.isBaseClassOf(p.item) && p.item.isProtected;
  const isReadonly =
    ApiReadonlyMixin.isBaseClassOf(p.item) && p.item.isReadonly;
  const isAbstract =
    ApiAbstractMixin.isBaseClassOf(p.item) && p.item.isAbstract;
  const isDeprecated = Boolean(p.item.tsdocComment?.deprecatedBlock);

  if (!isStatic && !isProtected && !isReadonly && !isAbstract && !isDeprecated)
    return null;

  return (
    <div className="inline-flex flex-row gap-1">
      {isStatic && <Badge>static</Badge>}
      {isProtected && <Badge>protected</Badge>}
      {isReadonly && <Badge>readonly</Badge>}
      {isAbstract && <Badge>abstract</Badge>}
      {isDeprecated && <Badge>deprecated</Badge>}
    </div>
  );
}
