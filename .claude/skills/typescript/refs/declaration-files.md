# Declaration Files

## Declaration Reference

### Objects with Properties

```ts
let result = myLib.makeGreeting("hello, world");
console.log("The computed greeting is:" + result);

let count = myLib.numberOfGreetings;
```

### Overloaded Functions

```ts
let x: Widget = getWidget(43);

let arr: Widget[] = getWidget("all of them");
```

### Reusable Types (Interfaces)

```ts
greet({
  greeting: "hello world",
  duration: 4000
});
```

### Reusable Types (Type Aliases)

```ts
type GreetingLike = string | (() => string) | MyGreeter;

declare function greet(g: GreetingLike): void;
```

### Organizing Types

```ts
const g = new Greeter("Hello");
g.log({ verbose: true });
g.alert({ modal: false, title: "Current Greeting" });
```

### Classes

```ts
declare class Greeter {
  constructor(greeting: string);

  greeting: string;
  showGreeting(): void;
}
```

### Global Variables

```ts
console.log("Half the number of widgets is " + foo / 2);
```

### Global Functions

```ts
greet("hello, world");
```

## Do's and Don'ts

### `Number`, `String`, `Boolean`, `Symbol` and `Object`

- DON'T: ever use the types `Number`, `String`, `Boolean`, `Symbol`, or `Object`
- DO: use the types `number`, `string`, `boolean`, and `symbol`.

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

### Return Types of Callbacks

- DON'T: use the return type `any` for callbacks whose value will be ignored:
- DO: use the return type `void` for callbacks whose value will be ignored:

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

### Optional Parameters in Callbacks

- DON'T: use optional parameters in callbacks unless you really mean it:
- DO: write callback parameters as non-optional:

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

### Overloads and Callbacks

- DON'T: write separate overloads that differ only on callback arity:
- DO: write a single overload using the maximum arity:

Wrong:
```ts
/* WRONG */
declare function beforeAll(action: () => void, timeout?: number): void;
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

Right:
```ts
/* OK */
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

### Ordering

- DON'T: put more general overloads before more specific overloads:
- DO: sort overloads by putting the more general signatures after more specific signatures:

Wrong:
```ts
/* WRONG */
declare function fn(x: unknown): unknown;
declare function fn(x: HTMLElement): number;
declare function fn(x: HTMLDivElement): string;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: unknown, wat?
```

Right:
```ts
/* OK */
declare function fn(x: HTMLDivElement): string;
declare function fn(x: HTMLElement): number;
declare function fn(x: unknown): unknown;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: string, :)
```

### Use Optional Parameters

- DON'T: write several overloads that differ only in trailing parameters:
- DO: use optional parameters whenever possible:

Wrong:
```ts
/* WRONG */
interface Example {
  diff(one: string): number;
  diff(one: string, two: string): number;
  diff(one: string, two: string, three: boolean): number;
}
```

## Deep Dive

## Library Structures


<!-- truncated -->