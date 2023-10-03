import type { SerializeOptions } from 'next-mdx-remote/dist/types';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { components } from './components';

const options = {
  mdxOptions: {
    remarkRehypeOptions: { allowDangerousHtml: true },
    format: 'md',
  },
} satisfies SerializeOptions;

export function Mdx(p: { children: string }) {
  return (
    <div className="mdx">
      <MDXRemote
        components={components}
        options={options}
        source={p.children}
      />
    </div>
  );
}
