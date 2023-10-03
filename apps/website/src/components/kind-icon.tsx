import {
  BoxIcon,
  ConstructionIcon,
  FolderIcon,
  GitMergeIcon,
  ParenthesesIcon,
  ShapesIcon,
  SquareStackIcon,
  TypeIcon,
  type LucideProps,
} from 'lucide-react';

export function KindIcon(p: LucideProps & { kind: string }) {
  switch (p.kind) {
    case 'Class':
    case 'Classes':
      return <ShapesIcon {...p} />;

    case 'Enum':
    case 'Enums':
      return <SquareStackIcon {...p} />;

    case 'Constructor':
    case 'ConstructorSignature':
      return <ConstructionIcon {...p} />;

    case 'Function':
    case 'Functions':
    case 'FunctionSignature':
    case 'Method':
    case 'Methods':
    case 'MethodSignature':
      return <ParenthesesIcon {...p} />;

    case 'Interface':
    case 'Interfaces':
      return <GitMergeIcon {...p} />;

    case 'Namespace':
    case 'Namespaces':
      return <FolderIcon {...p} />;

    case 'TypeAlias':
    case 'Types':
      return <TypeIcon {...p} />;

    case 'Variable':
    case 'Variables':
    case 'Property':
    case 'Properties':
    case 'PropertySignature':
      return <BoxIcon {...p} />;

    default:
      return null;
  }
}
