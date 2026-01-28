# Tsconfig Guide

## Project References

### An Example Project

```ts
// converter-tests.ts
import * as converter from "../src/converter";

assert.areEqual(converter.celsiusToFahrenheit(0), 32);
```

## Modules - Choosing Compiler Options

### I’m writing ES modules for the browser, with no bundler or module compiler

```ts
import {} from "lodash";
// Browser: https://esm.sh/lodash@4.17.21
// TypeScript: ./node_modules/@types/lodash/index.d.ts
```

### I’m writing a library

```ts
export interface Super {
    foo: string;
  }
  export interface Sub extends Super {
    foo: string | undefined;
  }
```

### Considerations for bundling libraries

```ts
import { Component } from "./extensionless-relative-import";
```
