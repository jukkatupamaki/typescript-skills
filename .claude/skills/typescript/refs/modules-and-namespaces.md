# Modules And Namespaces

## Modules

### Non-modules

```ts
export {};
```

### ES Module Syntax

```ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

### Additional Import Syntax

```ts
export var pi = 3.14;
import { pi as π } from "./maths.js";

console.log(π);
```

### TypeScript Specific ES Module Syntax

```ts
export type Cat = { breed: string; yearOfBirth: number };

export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}

import { Cat, Dog } from "./animal.js";
type Animals = Cat | Dog;
```

### `import type`

```ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";

import type { Cat, Dog } from "./animal.js";
export type Animals = Cat | Dog;

import type { createCatName } from "./animal.js";
const name = createCatName();
```

### Inline `type` imports

```ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";
import { createCatName, type Cat, type Dog } from "./animal.js";

export type Animals = Cat | Dog;
const name = createCatName();
```

### ES Module Syntax with CommonJS Behavior

```ts
/// <reference types="node" />
import fs = require("fs");
const code = fs.readFileSync("hello.ts", "utf8");
```

### Exporting

```ts
/// <reference types="node" />
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
```

### TypeScript's Module Output Options

```ts
export const valueOfPi = 3.142;
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

### `ES2020`

```ts
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

### `CommonJS`

```ts
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

### `UMD`

```ts
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

## Modules - Theory

### TypeScript’s job concerning modules

```ts
import sayHello from "greetings";
sayHello("world");
```

### Input module syntax

```ts
Object.defineProperty(exports, "__esModule", { value: true });
const greetings_1 = require("greetings");
(0, greetings_1.sayHello)("world");
```

### Module specifiers are not transformed by default

```ts
import { add } from "./math.mjs";
add(1, 2);
```

### Module resolution

```ts
import sayHello from "greetings";
sayHello("world");
```

### Module resolution is host-defined

```ts
import monkey from "🐒"; // Looks for './eats/bananas.js'
import cow from "🐄";    // Looks for './eats/grass.js'
import lion from "🦁";   // Looks for './eats/you.js'
```

### TypeScript imitates the host’s module resolution, but with types

```ts
export function add(a: number, b: number) {
  return a + b;
}

import { add } from "./math";
add(1, 2);
```

### Module resolution for bundlers, TypeScript runtimes, and Node.js loaders

```ts
export function add(a: number, b: number) {
  return a + b;
}

import { add } from "./math.ts";
// An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.
```

### Module resolution for libraries

```ts
export * from "./utils";
```

## Modules - Reference

### Importing and exporting TypeScript-specific declarations

```ts
import * as mod from "./module.js";
mod.f();
mod.SomeType; // Property 'SomeType' does not exist on type 'typeof import("./module.js")'
let x: mod.SomeType; // Ok
```

### Type-only imports and exports

```ts
import type { f } from "./module.js";
f(); // 'f' cannot be used as a value because it was imported using 'import type'
let otherFunction: typeof f = () => {}; // Ok
```

### `import()` types

```ts
// Access an exported type:
type WriteFileOptions = import("fs").WriteFileOptions;
// Access the type of an exported value:
type WriteFileFunction = typeof import("fs").writeFile;
```

### `export =` and `import = require()`

```ts
import fs = require("fs");
export = fs.readFileSync("...");

"use strict";
const fs = require("fs");
module.exports = fs.readFileSync("...");
```

### Ambient modules

```ts
declare module "*.html" {
  const content: string;
  export default content;
}
```

### Emit

```ts
import x = require("mod");
```

### `preserve`

```ts
import x, { y, z } from "mod";
import mod = require("mod");
const dynamic = import("mod");

export const e1 = 0;
export default "default export";
```

### `es2015`, `es2020`, `es2022`, `esnext`

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

### `commonjs`

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

### `system`

```ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

### `amd`

## Namespaces

## Namespaces and Modules
