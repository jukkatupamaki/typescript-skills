# TypeScript Code Review Checklist

## Strict Mode and Type Safety
- Always enable `strict: true` in tsconfig.json
- Never use `any` — prefer `unknown` and narrow with type guards
- Avoid type assertions (`as`) unless unavoidable; prefer type narrowing
- Use `satisfies` operator to validate types without widening
- Enable `noUncheckedIndexedAccess` for safer array/object access

## Type Design
- Prefer discriminated unions over optional properties for state variants
- Use `interface` for object shapes that may be extended, `type` for unions/intersections/mapped types
- Prefer `readonly` properties and `ReadonlyArray` for immutable data
- Use branded types for domain values that shouldn't be interchangeable (e.g., UserId vs OrderId)
- Avoid `enum` in most cases — prefer `as const` objects or union types

## Functions
- Add explicit return types on exported functions
- Use function overloads only when the return type varies by input type
- Prefer generic constraints (`T extends X`) over `any` parameters
- Use `never` for exhaustiveness checks in switch/if-else chains

## Error Handling
- Type catch clause variables as `unknown`, not `any`
- Create typed error classes or discriminated error unions
- Use `Result<T, E>` patterns for expected failures instead of exceptions

## Common Anti-Patterns
- Using `Object`, `Function`, `String` (uppercase) instead of `object`, `Function`, `string`
- Overusing type assertions to silence errors instead of fixing types
- Not narrowing union types before access
- Using non-null assertion operator without guarantees
- Ignoring `strictNullChecks` errors with optional chaining when null is a real concern
- Using `@ts-ignore` instead of `@ts-expect-error`
- Barrel files that break tree-shaking

## Module Best Practices
- Use `nodenext` module resolution for Node.js projects
- Use `bundler` module resolution for frontend bundler projects
- Prefer explicit file extensions in imports for ESM
- Use `type` imports (`import type { X }`) for type-only imports
- Avoid namespace imports when tree-shaking matters

## Declaration File Rules

- DON'T: ever use the types `Number`, `String`, `Boolean`, `Symbol`, or `Object`
- DO: use the types `number`, `string`, `boolean`, and `symbol`.
- DON'T: ever have a generic type which doesn't use its type parameter.
- DON'T: use `any` as a type unless you are in the process of migrating a JavaScript project to TypeScript. The compiler _effectively_ treats `any` as "please turn off type checking for this thing". It is similar to putting an `@ts-ignore` comment around every usage of the variable. This can be very helpful when you are first migrating a JavaScript project to TypeScript as you can set the type for stuff you haven't migrated yet as `any`, but in a full TypeScript project you are disabling type checking for any parts of your program that use it.
- DON'T: use the return type `any` for callbacks whose value will be ignored:
- DO: use the return type `void` for callbacks whose value will be ignored:
- DON'T: use optional parameters in callbacks unless you really mean it:
- DO: write callback parameters as non-optional:
- DON'T: write separate overloads that differ only on callback arity:
- DO: write a single overload using the maximum arity:
- DON'T: put more general overloads before more specific overloads:
- DO: sort overloads by putting the more general signatures after more specific signatures:
- DON'T: write several overloads that differ only in trailing parameters:
- DO: use optional parameters whenever possible:
- DON'T: write overloads that differ by type in only one argument position:
- DO: use union types whenever possible:

Wrong:
```ts
/* WRONG */
function reverse(s: String): String;
```
Right:
```ts
/* OK */
function reverse(s: string): string;
```

Wrong:
```ts
/* WRONG */
function fn(x: () => any) {
  x();
}
```
Right:
```ts
/* OK */
function fn(x: () => void) {
  x();
}
```

Wrong:
```ts
/* WRONG */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime?: number) => void): void;
}
```
Right:
```ts
/* OK */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime: number) => void): void;
}
```