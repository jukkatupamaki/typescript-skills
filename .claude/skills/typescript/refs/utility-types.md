# Utility Types

## Utility Types

TypeScript provides several utility types to facilitate common type transformations. These utilities are available globally.
### `Awaited<Type>`

This type is meant to model operations like `await` in `async` functions, or the
`.then()` method on `Promise`s - specifically, the way that they recursively
unwrap `Promise`s.
#### Example

### `Partial<Type>`

Constructs a type with all properties of `Type` set to optional. This utility will return a type that represents all subsets of a given type.
#### Example

### `Required<Type>`

Constructs a type consisting of all properties of `Type` set to required. The opposite of [`Partial`](#partialtype).
#### Example

### `Readonly<Type>`

Constructs a type with all properties of `Type` set to `readonly`, meaning the properties of the constructed type cannot be reassigned.
#### Example

This utility is useful for representing assignment expressions that will fail at runtime (i.e. when attempting to reassign properties of a [frozen object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)).
#### `Object.freeze`

### `Record<Keys, Type>`

Constructs an object type whose property keys are `Keys` and whose property values are `Type`. This utility can be used to map the properties of a type to another type.
#### Example

### `Pick<Type, Keys>`

Constructs a type by picking the set of properties `Keys` (string literal or union of string literals) from `Type`.
#### Example

### `Omit<Type, Keys>`

Constructs a type by picking all properties from `Type` and then removing `Keys` (string literal or union of string literals). The opposite of [`Pick`](#picktype-keys).
#### Example

### `Exclude<UnionType, ExcludedMembers>`

Constructs a type by excluding from `UnionType` all union members that are assignable to `ExcludedMembers`.
#### Example

### `Extract<Type, Union>`

Constructs a type by extracting from `Type` all union members that are assignable to `Union`.
#### Example

### `NonNullable<Type>`

Constructs a type by excluding `null` and `undefined` from `Type`.
#### Example

### `Parameters<Type>`

Constructs a tuple type from the types used in the parameters of a function type `Type`.
For overloaded functions, this will be the parameters of the _last_ signature; see [Inferring Within Conditional Types](/docs/handbook/2/conditional-types.html#inferring-within-conditional-types).
#### Example

### `ConstructorParameters<Type>`

Constructs a tuple or array type from the types of a constructor function type. It produces a tuple type with all the parameter types (or the type `never` if `Type` is not a function).
#### Example

### `ReturnType<Type>`

Constructs a type consisting of the return type of function `Type`.
For overloaded functions, this will be the return type of the _last_ signature; see [Inferring Within Conditional Types](/docs/handbook/2/conditional-types.html#inferring-within-conditional-types).
#### Example

### `InstanceType<Type>`

Constructs a type consisting of the instance type of a constructor function in `Type`.
#### Example

### `NoInfer<Type>`

Blocks inferences to the contained type. Other than blocking inferences, `NoInfer` is
identical to `Type`.
#### Example

### `ThisParameterType<Type>`

Extracts the type of the [this](/docs/handbook/functions.html#this-parameters) parameter for a function type, or [unknown](/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type) if the function type has no `this` parameter.
#### Example

### `OmitThisParameter<Type>`

Removes the [`this`](/docs/handbook/functions.html#this-parameters) parameter from `Type`. If `Type` has no explicitly declared `this` parameter, the result is simply `Type`. Otherwise, a new function type with no `this` parameter is created from `Type`. Generics are erased and only the last overload signature is propagated into the new function type.
#### Example

### `ThisType<Type>`

This utility does not return a transformed type. Instead, it serves as a marker for a contextual [`this`](/docs/handbook/functions.html#this) type. Note that the [`noImplicitThis`](/tsconfig#noImplicitThis) flag must be enabled to use this utility.
#### Example

In the example above, the `methods` object in the argument to `makeObject` has a contextual type that includes `ThisType` and therefore the type of [this](/docs/handbook/functions.html#this) in methods within the `methods` object is `{ x: number, y: number } & { moveBy(dx: number, dy: number): void }`. Notice how the type of the `methods` property simultaneously is an inference target and a source for the `this` type in methods.
The `ThisType` marker interface is simply an empty interface declared in `lib.d.ts`. Beyond being recognized in the contextual type of an object literal, the interface acts like any empty interface.
### Intrinsic String Manipulation Types

#### `Uppercase<StringType>`

#### `Lowercase<StringType>`

#### `Capitalize<StringType>`

#### `Uncapitalize<StringType>`

To help with string manipulation around template string literals, TypeScript includes a set of types which can be used in string manipulation within the type system. You can find those in the [Template Literal Types](/docs/handbook/2/template-literal-types.html#uppercasestringtype) documentation.
