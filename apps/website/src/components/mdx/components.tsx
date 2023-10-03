// MDX Components

import { CodeSpan, FencedCode } from '../code';

export const components: Record<string, React.FC<Record<string, unknown>>> = {
  h1: (p) => (
    <h1 className="mt-2 scroll-m-20 text-4xl font-bold tracking-tight" {...p} />
  ),
  h2: (p) => (
    <h2
      className="mt-10 scroll-m-20 border-b pb-1 text-3xl font-semibold tracking-tight first:mt-0"
      {...p}
    />
  ),
  h3: (p) => (
    <h3
      className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight"
      {...p}
    />
  ),
  h4: (p) => (
    <h4
      className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight"
      {...p}
    />
  ),
  h5: (p) => (
    <h5
      className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight"
      {...p}
    />
  ),
  h6: (p) => (
    <h6
      className="mt-8 scroll-m-20 text-base font-semibold tracking-tight"
      {...p}
    />
  ),

  p: (p) => <p className="leading-7 [&:not(:first-child)]:mt-6" {...p}></p>,
  a: (p) => <a className="font-medium underline underline-offset-4" {...p} />,

  hr: () => <hr className="my-4 md:my-8" />,

  ul: (p) => <ul className="my-6 ml-6 list-disc" {...p} />,
  ol: (p) => <ol className="my-6 ml-6 list-decimal" {...p} />,
  li: (p) => <li className="mt-2" {...p} />,

  pre: FencedCode as React.FC,
  code: CodeSpan as React.FC,
};
