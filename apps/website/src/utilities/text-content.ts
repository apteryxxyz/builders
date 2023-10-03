type Children = React.ReactElement | string;

export function textContent(
  element: React.ReactElement | React.ReactNode | string,
): string {
  if (!element) return '';

  if (typeof element === 'object' && 'props' in element) {
    const children = element.props?.children as Children | Children[];
    if (Array.isArray(children)) return children.map(textContent).join('');
    return textContent(children);
  }

  if (typeof element === 'object' && Symbol.iterator in element) {
    let result = '';
    for (const child of element as Iterable<React.ReactNode>)
      result += textContent(child);
    return result;
  }

  return String(element);
}
