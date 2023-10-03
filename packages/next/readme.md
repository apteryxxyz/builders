# Next.js Builders

Stop wasting time rewriting the same validation and error handling code for your Next.js server actions and API routes. Next.js Builders (aka `@builders/next`) provides a collection of helpful builders, hooks, and functions for Next.js, complete with type-safety, validation, and error handling.

## Features

- **Easy-To-Use Builders**: Utilise the API route and server action builders to create consistent, type-safe, and error-handled endpoints. Define your API routes and server actions in a declarative manner, and let the builders handle the rest.

- **Type-Safe Validation**: Ensure data consistency by leveraging the Zod library for comprehensive input validation. Define parsers for server actions, guaranteeing that input data adheres to specific types and shapes, catching errors early in the development process.

- **Built-In Error Handling**: Simplify error management for server actions. Automatically handle various errors and transform them into consistent error responses. Capture execution errors and provide meaningful error messages in response payloads, enhancing the reliability of your application.

- **Custom Functions and Hooks**: Leverage custom Tanstack Query-like hooks to simplify data fetching and state management. Easily integrate with your existing Next.js application.

Plus more!

## Installation

```
npm install @builders/next
yarn add @builders/next
pnpm add @builders/next
```

### Links

- [Documentation](https://builders.apteryx.xyz/packages/next/latest)
- [GitHub](https://github.com/apteryxxyz/builders/)
- [NPM](https://www.npmjs.com/package/@builders/next)
- [Discord](https://discord.gg/vZQbMhwsKY)

## Example Usage

### Server Actions

Declare your server actions using the [`ServerActionBuilder`](https://builders.apteryx.xyz/packages/next/latest/api/ServerActionBuilder) class. Define the input schema, and provide a definition function to handle the server action.

```ts
// @/app/actions.ts
import { ServerActionBuilder } from '@builders/next/server';
import { z } from 'zod';

export const getUser = new ServerActionBuilder()
  .setInput(z.string())
  .setDefintion((id) => ({ id, name: 'John Doe' }));

export const updateUser = new ServerActionBuilder()
  .setInput(z.object({ id: z.string(), name: z.string() }))
  .setDefinition(({ id, name }) => ({ id, name }));
```

Use the [`useServerActionQuery`](https://builders.apteryx.xyz/packages/next/latest/api/useServerActionQuery) and [`useServerActionMutation`](https://builders.apteryx.xyz/packages/next/latest/api/useServerActionMutation) hooks to fetch and mutate data from your server actions on the client.

```tsx
// @/app/users/[id]/page.tsx
'use client';

import { useServerActionQuery } from '@builders/next/client';
import { getUser } from '@/app/actions';

export default function Page({ params }: { params: { id: string } }) {
  const { data, error, isLoading, isError } = useServerActionQuery(
    getUser,
    params.id,
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
    </div>
  );
}
```

```tsx
// @/app/users/new/page.tsx
'use client';

import { useServerActionMutation } from '@builders/next/client';
import { updateUser } from '@/app/actions';

export default function Page() {
  const { mutate, data, error, isIdle, isLoading, isError } =
    useServerActionMutation(updateUser);

  if (isIdle)
    return <button onClick={() => mutate({ name: 'Jane Doe' })}>Create</button>;
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
    </div>
  );
}
```

### API Routes

Declare your API routes using the [`ApiRouteBuilder`](https://builders.apteryx.xyz/packages/next/latest/api/ApiRouteBuilder) class. Define the payload schemas, and provide a definition function to handle the API route.

```ts
// @/app/api/posts/route.ts
import { ApiRouteBuilder } from '@builders/next/server';
import { z } from 'zod';

export const GET = new ApiRouteBuilder()
  .setSearch(z.object({ query: z.string() }))
  .setDefinition(({ search: { query } }) => ({ query, posts: [] }));

export const PUT = new ApiRouteBuilder()
  .setBody(z.object({ title: z.string() }))
  .setDefinition(({ body: { title } }) => ({ id: '123', title }));
```

```ts
// @/app/api/posts/[id]/route.ts
import { ApiRouteBuilder } from '@builders/next/server';
import { z } from 'zod';

export const GET = new ApiRouteBuilder()
  .setParams(z.object({ id: z.string() }))
  .setDefinition(({ params: { id } }) => ({ id, title: 'Hello World' }));
```

Use the [`useApiRouteQuery`](https://builders.apteryx.xyz/packages/next/latest/api/useApiRouteQuery) and [`useApiRouteMutation`](https://builders.apteryx.xyz/packages/next/latest/api/useApiRouteMutation) hooks to fetch and mutate data from your API routes on the client.

Pass the route type as a generic to the hooks to ensure type-safety.

```tsx
// @/app/posts/[id]/page
'use client';

import { useApiRouteQuery } from '@builders/next/client';
import type { GET } from '@/app/api/posts/[id]/route';

//      ^? Only import the route type

export default function Page({ params }: { params: { id: string } }) {
  const { data, error, isLoading, isError } =
    // Pass the route type as a generic for type-safety
    useApiRouteQuery<typeof GET>('GET', `/api/posts/[id]`, { params });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.title}</h1>
    </div>
  );
}
```

```tsx
// @/app/posts/page
'use client';

import { useApiRouteMutation } from '@builders/next/client';
import type { PUT } from '@/app/api/posts/route';

export default function Page() {
  const { mutate, isIdle, isLoading, isError, error } = useApiRouteMutation<
    typeof PUT
  >('PUT', '/api/posts');

  if (isIdle)
    return (
      <button onClick={() => mutate({ title: 'Hello World' })}>Create</button>
    );
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.title}</h1>
    </div>
  );
}
```
