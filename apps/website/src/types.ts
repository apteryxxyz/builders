import '@total-typescript/ts-reset';

type ParamType<TParam extends string> = TParam extends `${infer TName}[]`
  ? { [key in TName]: string[] }
  : { [key in TParam]: string };

type Params<TParams extends string[]> = TParams extends [
  infer TParam extends string,
  ...infer TRest extends string[],
]
  ? ParamType<TParam> & Params<TRest>
  : TParams extends [infer TParam extends string]
  ? ParamType<TParam>
  : Record<string, never>;

/**
 * @example // /[id]/page.tsx
 * function Page(props: PageProps<['id']>) {
 * //              ^? { params: { id: string }; searchParams: {} }
 * @example // /[...name]/page.tsx
 * function Page(props: PageProps<['name[]']>) {
 * //              ^? { params: { name: string[] }; searchParams: {} }
 */
export type PageProps<TParams extends string[] = never[]> = {
  params: TParams extends string[] ? Params<TParams> : Record<string, never>;
  searchParams: Record<string, string | string[]>;
};

/**
 * @example // /[id]/layout.tsx
 * function Layout(props: LayoutProps<['id']>) {
 * //                ^? { params: { id: string }; children: ReactNode }
 * @example // /[id]/[...name]/layout.tsx
 * function Layout(props: LayoutProps<['id', 'name[]']>) {
 * //                ^? { params: { id: string; name: string[] }; children: ReactNode }
 */
export type LayoutProps<TParams extends string[] = never[]> =
  React.PropsWithChildren<{
    params: TParams extends string[] ? Params<TParams> : Record<string, never>;
  }>;
