# Type System Core

## The Basics

- Each and every value in JavaScript has a set of behaviors you can observe from running different operations.
- If we break this down, the first runnable line of code accesses a property called `toLowerCase` and then calls it.
- But assuming we don't know the value of `message` - and that's pretty common - we can't reliably say what results we'll get from trying to run any of this code.
- - Is `message` callable?
- The answers to these questions are usually things we keep in our heads when we write JavaScript, and we have to hope we got all the details right.
- Let's say `message` was defined in the following way.
### Static type-checking

- Think back to that `TypeError` we got earlier from trying to call a `string` as a function.
### Non-exception Failures

- So far we've been discussing certain things like runtime errors - cases where the JavaScript runtime tells us that it thinks something is nonsensical.
- For example, the specification says that trying to call something that isn't callable should throw an error.
- Ultimately, a static type system has to make the call over what code should be flagged as an error in its system, even if it's "valid" JavaScript that won't immediately throw an error.
- While sometimes that implies a trade-off in what you can express, the intent is to catch legitimate bugs in our programs.
- For example: typos,
### Types for Tooling

- TypeScript can catch bugs when we make mistakes in our code.
### `tsc`, the TypeScript compiler

- We've been talking about type-checking, but we haven't yet used our type-_checker_.
- > This installs the TypeScript Compiler `tsc` globally.
- Now let's move to an empty folder and try writing our first TypeScript program: `hello.
- Notice there are no frills here; this "hello world" program looks identical to what you'd write for a "hello world" program in JavaScript.
- Tada!

```ts
// Greets the world.
console.log("Hello world!");
```
### Emitting with Errors

- One thing you might not have noticed from the last example was that our `hello.
### Explicit Types

- Up until now, we haven't told TypeScript what `person` or `date` are.
- What we did was add _type annotations_ on `person` and `date` to describe what types of values `greet` can be called with.
- With this, TypeScript can tell us about other cases where `greet` might have been called incorrectly.
- Huh?
### Erased Types

- Let's take a look at what happens when we compile the above function `greet` with `tsc` to output JavaScript:
### Downleveling

- One other difference from the above was that our template string was rewritten from
- to
### Strictness

- Different users come to TypeScript looking for different things in a type-checker.
### `noImplicitAny`

- Recall that in some places, TypeScript doesn't try to infer types for us and instead falls back to the most lenient type: `any`.
### `strictNullChecks`

- By default, values like `null` and `undefined` are assignable to any other type.

## Everyday Types

- In this chapter, we'll cover some of the most common types of values you'll find in JavaScript code, and explain the corresponding ways to describe those types in TypeScript.

## Narrowing

- Imagine we have a function called `padLeft`.
- If `padding` is a `number`, it will treat that as the number of spaces we want to prepend to `input`.
- Uh-oh, we're getting an error on `padding`.
- If this mostly looks like uninteresting JavaScript code, that's sort of the point.
### `typeof` type guards

- As we've seen, JavaScript supports a `typeof` operator which can give very basic information about the type of values we have at runtime.
## Truthiness narrowing

- Truthiness might not be a word you'll find in the dictionary, but it's very much something you'll hear about in JavaScript.
- In JavaScript, we can use any expression in conditionals, `&&`s, `||`s, `if` statements, Boolean negations (`!
- In JavaScript, constructs like `if` first "coerce" their conditions to `boolean`s to make sense of them, and then choose their branches depending on whether the result is `true` or `false`.
- - `0` - `NaN` - `""` (the empty string) - `0n` (the `bigint` version of zero) - `null` - `undefined`
### Equality narrowing

- TypeScript also uses `switch` statements and equality checks like `===`, `!
- When we checked that `x` and `y` are both equal in the above example, TypeScript knew their types also had to be equal.
### The `in` operator narrowing

- JavaScript has an operator for determining if an object or its prototype chain has a property with a name: the `in` operator.
### `instanceof` narrowing

- JavaScript has an operator for checking whether or not a value is an "instance" of another value.
### Assignments

- As we mentioned earlier, when we assign to any variable, TypeScript looks at the right side of the assignment and narrows the left side appropriately.
### Control flow analysis

- Up until this point, we've gone through some basic examples of how TypeScript narrows within specific branches.
### Using type predicates

- We've worked with existing JavaScript constructs to handle narrowing so far, however sometimes you want more direct control over how types change throughout your code.
- To define a user-defined type guard, we simply need to define a function whose return type is a _type predicate_:
### Assertion functions

Types can also be narrowed using [Assertion functions](/docs/handbook/release-notes/typescript-3-7.html#assertion-functions).
## Discriminated unions

- Most of the examples we've looked at so far have focused around narrowing single variables with simple types like `string`, `boolean`, and `number`.
- For some motivation, let's imagine we're trying to encode shapes like circles and squares.
- Notice we're using a union of string literal types: `"circle"` and `"square"` to tell us whether we should treat the shape as a circle or square respectively.
- We can write a `getArea` function that applies the right logic based on if it's dealing with a circle or square.
- Under [`strictNullChecks`](/tsconfig#strictNullChecks) that gives us an error - which is appropriate since `radius` might not be defined.
- Hmm, TypeScript still doesn't know what to do here.
- But this doesn't feel ideal.
- The problem with this encoding of `Shape` is that the type-checker doesn't have any way to know whether or not `radius` or `sideLength` are present based on the `kind` property.
- Here, we've properly separated `Shape` out into two types with different values for the `kind` property, but `radius` and `sideLength` are declared as required properties in their respective types.

```ts
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}
```
## The `never` type


## Object Types

- In JavaScript, the fundamental way that we group and pass around data is through objects.
- As we've seen, they can be anonymous:
- or they can be named by using either an interface:
### Quick Reference

We have cheat-sheets available for both [`type` and `interface`](https://www.typescriptlang.org/cheatsheets), if you want a quick look at the important every-day syntax at a glance.
### Property Modifiers

Each property in an object type can specify a couple of things: the type, whether the property is optional, and whether the property can be written to.
#### Optional Properties

- Much of the time, we'll find ourselves dealing with objects that _might_ have a property set.
- In this example, both `xPos` and `yPos` are considered optional.
- We can also read from those properties - but when we do under [`strictNullChecks`](/tsconfig#strictNullChecks), TypeScript will tell us they're potentially `undefined`.
#### `readonly` Properties

- Properties can also be marked as `readonly` for TypeScript.
#### Index Signatures

- Sometimes you don't know all the names of a type's properties ahead of time, but you do know the shape of the values.
- In those cases you can use an index signature to describe the types of possible values, for example:
### Excess Property Checks

- Where and how an object is assigned a type can make a difference in the type system.
- Notice the given argument to `createSquare` is spelled _`colour`_ instead of `color`.
- You could argue that this program is correctly typed, since the `width` properties are compatible, there's no `color` property present, and the extra `colour` property is insignificant.
### Extending Types

- It's pretty common to have types that might be more specific versions of other types.
### Intersection Types

- `interface`s allowed us to build up new types from other types by extending them.
### Interface Extension vs. Intersection

- We just looked at two ways to combine types which are similar, but are actually subtly different.
### Generic Object Types

- Let's imagine a `Box` type that can contain any value - `string`s, `number`s, `Giraffe`s, whatever.
- Right now, the `contents` property is typed as `any`, which works, but can lead to accidents down the line.
- We could instead use `unknown`, but that would mean that in cases where we already know the type of `contents`, we'd need to do precautionary checks, or use error-prone type assertions.
- One type safe approach would be to instead scaffold out different `Box` types for every type of `contents`.
- But that means we'll have to create different functions, or overloads of functions, to operate on these types.
#### The `Array` Type

- Generic object types are often some sort of container type that work independently of the type of elements they contain.
#### The `ReadonlyArray` Type

- The `ReadonlyArray` is a special type that describes arrays that shouldn't be changed.
#### Tuple Types

- A _tuple type_ is another sort of `Array` type that knows exactly how many elements it contains, and exactly which types it contains at specific positions.
- Here, `StringNumberPair` is a tuple type of `string` and `number`.
- If we try to index past the number of elements, we'll get an error.
- We can also [destructure tuples](https://developer.

```ts
type StringNumberPair = [string, number];
```

## Type Compatibility

- Type compatibility in TypeScript is based on structural subtyping.
- In nominally-typed languages like C# or Java, the equivalent code would be an error because the `Dog` class does not explicitly describe itself as being an implementer of the `Pet` interface.
- TypeScript's structural type system was designed based on how JavaScript code is typically written.
### A Note on Soundness

TypeScript's type system allows certain operations that can't be known at compile-time to be safe. When a type system has this property, it is said to not be "sound". The places where TypeScript allows unsound behavior were carefully considered, and throughout this document we'll explain where these happen and the motivating scenarios behind them.
### Starting out

- The basic rule for TypeScript's structural type system is that `x` is compatible with `y` if `y` has at least the same members as `x`.
- To check whether `dog` can be assigned to `pet`, the compiler checks each property of `pet` to find a corresponding compatible property in `dog`.
- The same rule for assignment is used when checking function call arguments:

```ts
let dog: Pet = { name: "Lassie", owner: "Rudd Weatherwax" }; // Error
```
### Comparing two functions

- While comparing primitive types and object types is relatively straightforward, the question of what kinds of functions should be considered compatible is a bit more involved.
- To check if `x` is assignable to `y`, we first look at the parameter list.
- The second assignment is an error, because `y` has a required second parameter that `x` does not have, so the assignment is disallowed.
#### Function Parameter Bivariance

- When comparing the types of function parameters, assignment succeeds if either the source parameter is assignable to the target parameter, or vice versa.
- You can have TypeScript raise errors when this happens via the compiler flag [`strictFunctionTypes`](/tsconfig#strictFunctionTypes).
#### Optional Parameters and Rest Parameters

- When comparing functions for compatibility, optional and required parameters are interchangeable.
#### Functions with overloads

- When a function has overloads, each overload in the target type must be matched by a compatible signature on the source type.
### Enums

Enums are compatible with numbers, and numbers are compatible with enums. Enum values from different enum types are considered incompatible. For example,
### Classes

- Classes work similarly to object literal types and interfaces with one exception: they have both a static and an instance type.
#### Private and protected members in classes

- Private and protected members in a class affect their compatibility.
### Generics

- Because TypeScript is a structural type system, type parameters only affect the resulting type when consumed as part of the type of a member.
- In the above, `x` and `y` are compatible because their structures do not use the type argument in a differentiating way.
- In this way, a generic type that has its type arguments specified acts just like a non-generic type.
### Advanced Topics

#### Subtype vs Assignment

- So far, we've used "compatible", which is not a term defined in the language spec.
### `any`, `unknown`, `object`, `void`, `undefined`, `null`, and `never` assignability

- The following table summarizes assignability between some abstract types.
- any unknown object void undefined null never
- any →
- ✓ ✓ ✓ ✓ ✓ ✕

## Type Inference

- In TypeScript, there are several places where type inference is used to provide type information when there is no explicit type annotation.
- The type of the `x` variable is inferred to be `number`.
- In most cases, type inference is straightforward.
### Best common type

When a type inference is made from several expressions, the types of those expressions are used to calculate a "best common type". For example,
To infer the type of `x` in the example above, we must consider the type of each array element.
Here we are given two choices for the type of the array: `number` and `null`.
The best common type algorithm considers each candidate type, and picks the type that is compatible with all the other candidates.
Because the best common type has to be chosen from the provided candidate types, there are some cases where types share a common structure, but no one type is the super type of all candidate types. For example:
Ideally, we may want `zoo` to be inferred as an `Animal[]`, but because there is no object that is strictly of type `Animal` in the array, we make no inference about the array element type.
To correct this, explicitly provide the type when no one type is a super type of all other candidates:
When no best common type is found, the resulting inference is the union array type, `(Rhino | Elephant | Snake)[]`.

```ts
let x = [0, 1, null];
```
### Contextual Typing

Type inference also works in "the other direction" in some cases in TypeScript.
This is known as "contextual typing". Contextual typing occurs when the type of an expression is implied by its location. For example:
Here, the TypeScript type checker used the type of the `Window.onmousedown` function to infer the type of the function expression on the right hand side of the assignment.
When it did so, it was able to infer the [type](https://developer.mozilla.org/docs/Web/API/MouseEvent) of the `mouseEvent` parameter, which does contain a `button` property, but not a `kangaroo` property.
This works because window already has `onmousedown` declared in its type:
TypeScript is smart enough to infer types in other contexts as well:
Based on the fact that the above function is being assigned to `Window.onscroll`, TypeScript knows that `uiEvent` is a [UIEvent](https://developer.mozilla.org/docs/Web/API/UIEvent), and not a [MouseEvent](https://developer.mozilla.org/docs/Web/API/MouseEvent) like the previous example. `UIEvent` objects contain no `button` property, and so TypeScript will throw an error.
If this function were not in a contextually typed position, the function's argument would implicitly have type `any`, and no error would be issued (unless you are using the [`noImplicitAny`](/tsconfig#noImplicitAny) option):
We can also explicitly give type information to the function's argument to override any contextual type:
However, this code will log `undefined`, since `uiEvent` has no property called `button`.
Contextual typing applies in many cases.
Common cases include arguments to function calls, right hand sides of assignments, type assertions, members of object and array literals, and return statements.
The contextual type also acts as a candidate type in best common type. For example:
In this example, best common type has a set of four candidates: `Animal`, `Rhino`, `Elephant`, and `Snake`.
Of these, `Animal` can be chosen by the best common type algorithm.

```ts
window.onscroll = function (uiEvent: any) {
  console.log(uiEvent.button); // <- Now, no error is given
};
```
