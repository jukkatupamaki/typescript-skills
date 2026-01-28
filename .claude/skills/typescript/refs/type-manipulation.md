# Type Manipulation

## Creating Types from Types

TypeScript's type system is very powerful because it allows expressing types _in terms of other types_.
The simplest form of this idea is generics. Additionally, we have a wide variety of _type operators_ available to use.
It's also possible to express types in terms of _values_ that we already have.
By combining various type operators, we can express complex operations and values in a succinct, maintainable way.
In this section we'll cover ways to express a new type in terms of an existing type or value.
- [Generics](/docs/handbook/2/generics.html) - Types which take parameters
- [Keyof Type Operator](/docs/handbook/2/keyof-types.html) - Using the `keyof` operator to create new types
- [Typeof Type Operator](/docs/handbook/2/typeof-types.html) - Using the `typeof` operator to create new types
- [Indexed Access Types](/docs/handbook/2/indexed-access-types.html) - Using `Type['a']` syntax to access a subset of a type
- [Conditional Types](/docs/handbook/2/conditional-types.html) - Types which act like if statements in the type system
- [Mapped Types](/docs/handbook/2/mapped-types.html) - Creating types by mapping each property in an existing type
- [Template Literal Types](/docs/handbook/2/template-literal-types.html) - Mapped types which change properties via template literal strings

## Conditional Types

- At the heart of most useful programs, we have to make decisions based on input.
- Conditional types take a form that looks a little like conditional expressions (`condition ?
- When the type on the left of the `extends` is assignable to the one on the right, then you'll get the type in the first branch (the "true" branch); otherwise you'll get the type in the latter branch (the "false" branch).
- From the examples above, conditional types might not immediately seem useful - we can tell ourselves whether or not `Dog extends Animal` and pick `number` or `string`!
- For example, let's take the following `createLabel` function:
- These overloads for createLabel describe a single JavaScript function that makes a choice based on the types of its inputs.
- 1.
- Instead, we can encode that logic in a conditional type:
- We can then use that conditional type to simplify our overloads down to a single function with no overloads.
#### Conditional Type Constraints

- Often, the checks in a conditional type will provide us with some new information.
- For example, let's take the following:
- In this example, TypeScript errors because `T` isn't known to have a property called `message`.
- However, what if we wanted `MessageOf` to take any type, and default to something like `never` if a `message` property isn't available?
- Within the true branch, TypeScript knows that `T` _will_ have a `message` property.
- As another example, we could also write a type called `Flatten` that flattens array types to their element types, but le

```ts
type MessageOf<T> = T["message"];
```
#### Inferring Within Conditional Types

- We just found ourselves using conditional types to apply constraints and then extract out types.
- Conditional types provide us with a way to infer from types we compare against in the true branch using the `infer` keyword.
- Here, we used the `infer` keyword to declaratively introduce a new generic type variable named `Item` instead of specifying how to retrieve the element type of `Type` within the true branch.
- We can write some useful helper type aliases using the `infer` keyword.

```ts
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
```
### Distributive Conditional Types

- When conditional types act on a generic type, they become _distributive_ when given a union type.
- If we plug a union type into `ToArray`, then the conditional type will be applied to each member of that union.
- What happens here is that `ToArray` distributes on:
- and maps over each member type of the union, to what is effectively:
- which leaves us with:

```ts
type ToArray<Type> = Type extends any ? Type[] : never;
```

## Mapped Types

When you don't want to repeat yourself, sometimes a type needs to be based on another type.
Mapped types build on the syntax for index signatures, which are used to declare the types of properties which have not been declared ahead of time:
A mapped type is a generic type which uses a union of `PropertyKey`s (frequently created [via a `keyof`](/docs/handbook/2/indexed-access-types.html)) to iterate through keys to create a type:
In this example, `OptionsFlags` will take all the properties from the type `Type` and change their values to be a boolean.

```ts
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
```
#### Mapping Modifiers

There are two additional modifiers which can be applied during mapping: `readonly` and `?` which affect mutability and optionality respectively.
You can remove or add these modifiers by prefixing with `-` or `+`. If you don't add a prefix, then `+` is assumed.
### Key Remapping via `as`

In TypeScript 4.1 and onwards, you can re-map keys in mapped types with an `as` clause in a mapped type:
You can leverage features like [template literal types](/docs/handbook/2/template-literal-types.html) to create new property names from prior ones:
You can filter out keys by producing `never` via a conditional type:
You can map over arbitrary unions, not just unions of `string | number | symbol`, but unions of any type:

```ts
type MappedTypeWithNewProperties<Type> = {
    [Properties in keyof Type as NewKeyType]: Type[Properties]
}
```
#### Further Exploration

Mapped types work well with other features in this type manipulation section, for example here is [a mapped type using a conditional type](/docs/handbook/2/conditional-types.html) which returns either a `true` or `false` depending on whether an object has the property `pii` set to the literal `true`:

## Template Literal Types

- Template literal types build on [string literal types](/docs/handbook/2/everyday-types.
- They have the same syntax as [template literal strings in JavaScript](https://developer.
- When a union is used in the interpolated position, the type is the set of every possible string literal that could be re
- For each interpolated position in the template literal, the unions are cross multiplied:
- We generally recommend that people use ahead-of-time generation for large string unions, but this is useful in smaller cases.
#### String Unions in Types

- The power in template literals comes when defining a new string based on information inside a type.
- Consider the case where a function (`makeWatchedObject`) adds a new function called `on()` to a passed object.
- The `on` function that will be added to the base object expects two arguments, an `eventName` (a `string`) and a `callback` (a `function`).
- The `eventName` should be of the form `attributeInThePassedObject + "Changed"`; thus, `firstNameChanged` as derived from the attribute `firstName` in the base object.
- The `callback` function, when called: * Should be passed a value of the type associated with the name `attributeInThePassedObject`; thus, since `firstName` is typed as `string`, the callback for the `firstNameChanged` event expects a `string` to be passed to it at call time.
- The naive function signature of `on()` might thus be: `on(eventName: string, callback: (newValue: any) => void)`.
- Notice that `on` listens on the event `"firstNameChanged"`, not just `"firstName"`.
- With this, we can build something that errors when given the wrong property:

```ts
const passedObject = {
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
};
```
#### Inference with Template Literals

- Notice that we did not benefit from all the information provided in the original passed object.
- The key insight that makes this possible is this: we can use a function with a generic such that:
- 1.
- Here we made `on` into a generic method.
- When a user calls with the string `"firstNameChanged"`, TypeScript will try to infer the right type for `Key`.
### Intrinsic String Manipulation Types

To help with string manipulation, TypeScript includes a set of types which can be used in string manipulation. These types come built-in to the compiler for performance and can't be found in the `.d.ts` files included with TypeScript.
#### `Uppercase<StringType>`

Converts each character in the string to the uppercase version.
#### Example

#### `Lowercase<StringType>`

Converts each character in the string to the lowercase equivalent.
#### Example

#### `Capitalize<StringType>`

Converts the first character in the string to an uppercase equivalent.
#### Example


## Indexed Access Types

We can use an _indexed access type_ to look up a specific property on another type:
The indexing type is itself a type, so we can use unions, `keyof`, or other types entirely:
You'll even see an error if you try to index a property that doesn't exist:
Another example of indexing with an arbitrary type is using `number` to get the type of an array's elements.
We can combine this with `typeof` to conveniently capture the element type of an array literal:
You can only use types when indexing, meaning you can't use a `const` to make a variable reference:
However, you can use a type alias for a similar style of refactor:

```ts
type Person = { age: number; name: string; alive: boolean };
type Age = Person["age"];
```

## Keyof Type Operator

### The `keyof` type operator

The `keyof` operator takes an object type and produces a string or numeric literal union of its keys.
The following type `P` is the same type as `type P = "x" | "y"`:
If the type has a `string` or `number` index signature, `keyof` will return those types instead:
Note that in this example, `M` is `string | number` -- this is because JavaScript object keys are always coerced to a string, so `obj[0]` is always the same as `obj["0"]`.
`keyof` types become especially useful when combined with mapped types, which we'll learn more about later.

```ts
type Point = { x: number; y: number };
type P = keyof Point;
```

## Typeof Type Operator

### The `typeof` type operator

JavaScript already has a `typeof` operator you can use in an _expression_ context:
TypeScript adds a `typeof` operator you can use in a _type_ context to refer to the _type_ of a variable or property:
This isn't very useful for basic types, but combined with other type operators, you can use `typeof` to conveniently express many patterns.
For an example, let's start by looking at the predefined type `ReturnType`.
It takes a _function type_ and produces its return type:
If we try to use `ReturnType` on a function name, we see an instructive error:
Remember that _values_ and _types_ aren't the same thing.
To refer to the _type_ that the _value `f`_ has, we use `typeof`:

```ts
// Prints "string"
console.log(typeof "Hello world");
```
#### Limitations

TypeScript intentionally limits the sorts of expressions you can use `typeof` on.
Specifically, it's only legal to use `typeof` on identifiers (i.e. variable names) or their properties.
This helps avoid the confusing trap of writing code you think is executing, but isn't:
