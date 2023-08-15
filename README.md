<div align="center">
  <h1><strong>Next SA</strong></h1>
  <i>Improved Next.js 13 server actions, with type-safe validation and timeouts</i><br>
  <code>npm install next-sa</code>
</div>

<div align="center">
  <img alt="package version" src="https://img.shields.io/npm/v/next-sa?label=version">
  <img alt="total downloads" src="https://img.shields.io/npm/dt/next-sa">
  <br>
  <a href="https://github.com/apteryxxyz/next-sa"><img alt="next-sa repo stars" src="https://img.shields.io/github/stars/apteryxxyz/next-sa?style=social"></a>
  <a href="https://github.com/apteryxxyz"><img alt="apteryxxyz followers" src="https://img.shields.io/github/followers/apteryxxyz?style=social"></a>
  <a href="https://discord.gg/vZQbMhsaKY"><img src="https://discordapp.com/api/guilds/829836158007115806/widget.png?style=shield" alt="Discord Banner 2"/></a>
</div>

---

## 🤔 About

Next SA (`next-sa`) is an advanced Next.js 13 server action builder. It provides a convenient and robust way to create server actions with type-safe validation using zod along with support for timeouts. With Next SA, you can easily build powerful server-side functionality while ensuring data integrity and performance.

Next SA is still pre its 1.0 release, and as such, things may change. If you find any bugs or have any suggestions, please open an issue on the GitHub repository.

### 🚀 Features

 - **Type-safe validation**: Next SA leverages the `zod` library to enable comprehensive input validation. You can define parsers for your server actions, ensuring that the input data adheres to specific types and shapes. This helps catch errors early and ensures the consistency and correctness of your data.

 - **Timeout handling**: Next SA allows you to set timeouts for your server actions. If an action takes longer than the specified timeout duration to execute, it will be cancelled automatically. This helps prevent long-running actions from impacting the overall performance and responsiveness of your application.

 - **Built-in error handling**: Next SA simplifies error handling for your server actions. It automatically handles all sorts of errors and transforms them into consistent error responses. Additionally, it captures any errors that occur during the execution of your server actions and provides meaningful error messages in the response payload.

---

## 🏓 Table of Contents

 - [🤔 About](#-about)
  - [🚀 Features](#-features)
 - [🏓 Table of Contents](#-table-of-contents)
 - [📦 Installation](#-installation)
 - [📚 Documentation](#-documentation)
  - [ServerActionBuilder](#serveractionbuilder)
  - [ServerAction](#serveraction)
 - [📖 Examples](#-examples)
  - [📝 Defining a server action](#-defining-a-server-action)
  - [📝 Using a server action](#-using-a-server-action)

---

## 📦 Installation

```bash
npm install next-sa
yarn add next-sa
pnpm add next-sa
```

---

## 📚 Documentation

### ServerActionBuilder

Represents a builder to create server actions.

```ts
// TypeScript type definition
interface ServerActionBuilder {
  input<TInput extends ZodType>(input: TInput | (z: typeof z) => TInput): ServerActionBuilder;
  timeout<TTimeout extends { after: string; }>(timeout: TTimeout): ServerActionBuilder;
  definition<TInput, TData>(action: (input: TInput) => Promise<TData>): ServerAction<TInput, TData>;
}
```

 - `input(input: ZodType)`: The input parser is used to validate the input data for the server action. If the input data does not match the specified parser, the server action will fail with a validation error. You can pass a function where the first and only parameter is `zod`s `z`, saves having to manually import `zod`.


 - `timeout(timeout: { after: string; })`: The timeout options are used to cancel the server action if it takes longer than the specified timeout duration to execute. If the server action is cancelled, it will fail with a timeout error.
   - `after: string`: Sets the timeout duration for the server action. String will be parsed using [enhanced-ms](https://npmjs.com/enhanced-ms).


 - `definition(action: (input: TInput) => Promise<TData>)`: Defines the actual server action logic, then builds it. The action function is used to execute the server action. It receives the input data as an argument and returns a promise that resolves to the result of the server action. You are free to throw errors in this function, they will be handled. This must be called last.

```ts
import { createServerAction } from 'next-sa/server';

export const action = createServerAction()
//             ^? ServerActionBuilder
```

View the example to see how to use this.

### ServerAction

Represents what the server action builder `definition` method returns.

```ts
// TypeScript type definition
type ServerAction<TInput, TData> = (input: TInput) =>
  Promise<
    | { success: true; data: TData }
    | { success: false; error: { kind: 'Action' | 'Timeout' | 'Validation'; message: string; }
  }>;
```

A server action returns a promise that resolves to a payload object, which contains either the result of the server action or an error. Server actions will never throw an error, instead they will return an error payload object.

 - `{ success: true; data: TData }`: Represents a successful server action. The `data` property contains the result of the server action.

 - `{ success: false; error: { kind: 'Action' | 'Timeout' | 'Validation'; message: string; } }`: Represents a failed server action. The `error` property contains an error object with the following properties:
  - `kind: 'Action' | 'Timeout' | 'Validation'`: The kind of error that occured.
  - `message: string`: The error message, can be displayed to the user.

#### Error Kinds

 - `Action`: The error occured during the execution of **your server action** - the function you passed to the `definition` method.
 - `Timeout`: The server action took longer than the specified timeout duration to execute.
 - `Validation`: The input data did not match the specified input parser.

---

## 📖 Examples

### 📝 Defining a server action

To define a server action, you can use the `createServerAction` function that returns a builder. It provides a fluent API for building your server actions.

```ts
// app/actions.ts
'use server';

import { createServerAction } from 'next-sa/server';

export const sayHello = createServerAction()
  .input(z.string().min(3).max(32))
  .timeout({ after: '10s' })
  .definition(async name => `Hello ${name}!`);
//                   ^? string
```

### 📝 Using a server action

There are a few ways to use a server action, and Next SA provides two methods intended to make working with Next SA server actions super easy.

On the client, you can use the `useServerAction` hook.

```tsx
// app/page.tsx
'use client';

import { useServerAction } from 'next-sa/client';
import { sayHello } from './actions';

export default function Page() {
  const { execute, data, error, isPending } = useServerAction(sayHello);

  return <>
    {isPending && <p>Loading...</p>}
    {error && <p>Error: {error.message}</p>}
    {data && <p>Data: {data}</p>}
    <button onClick={execute.bind(null, 'World')}>Say Hello</button>
  </>;
}
```

While on the server (also works on the client), you can use the `executeServerAction` function to immediately execute a server action.

```tsx
// app/page.tsx
'use server';

import { executeServerAction } from 'next-sa/client';
import { sayHello } from './actions';

export default async function Page() {
  // Will throw an error if the action fails
  const data = await executeServerAction(sayHello, 'World');

  return <p>Data: {data}</p>;
}
```
