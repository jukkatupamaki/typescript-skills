# Functions And Classes

## More on Functions

- Functions are the basic building block of any application, whether they're local functions, imported from another module, or methods on a class.

## Classes

- TypeScript offers full support for the `class` keyword introduced in ES2015.

## Generics

- A major part of software engineering is building components that not only have well-defined and consistent APIs, but are also reusable.
- In languages like C# and Java, one of the main tools in the toolbox for creating reusable components is _generics_, that is, being able to create a component that can work over a variety of types rather than a single one.
### Hello World of Generics

- To start off, let's do the "hello world" of generics: the identity function.
- Without generics, we would either have to give the identity function a specific type:
- Or, we could describe the identity function using the `any` type:
- While using `any` is certainly generic in that it will cause the function to accept any and all types for the type of `arg`, we actually are losing the information about what that type was when the function returns.
- Instead, we need a way of capturing the type of the argument in such a way that we can also use it to denote what is being returned.
- We've now added a type variable `Type` to the identity function.
- We say that this version of the `identity` function is generic, as it works over a range of types.
- Once we've written the generic identity function, we can call it in one of two ways.
- Here we explicitly set `Type` to be `string` as one of the arguments to the function call, denoted using the `<>` around the arguments rather than `()`.

```ts
function identity(arg: number): number {
  return arg;
}
```
### Working with Generic Type Variables

- When you begin to use generics, you'll notice that when you create generic functions like `identity`, the compiler will enforce that you use any generically typed parameters in the body of the function correctly.
- Let's take our `identity` function from earlier:
- What if we want to also log the length of the argument `arg` to the console with each call?
- When we do, the compiler will give us an error that we're using the `.
- Let's say that we've actually intended this function to work on arrays of `Type` rather than `Type` directly.
- You can read the type of `loggingIdentity` as "the generic function `loggingIdentity` takes a type parameter `Type`, and an argument `arg` which is an array of `Type`s, and returns an array of `Type`s.
- We can alternatively write the sample example this way:

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}
```
### Generic Types

- In previous sections, we created generic identity functions that worked over a range of types.
- The type of generic functions is just like those of non-generic functions, with the type parameters listed first, simila
- We could also have used a different name for the generic type parameter in the type, so long as the number of type variables and how the type variables are used line up.
- We can also write the generic type as a call signature of an object literal type:
- Which leads us to writing our first generic interface.
- In a similar example, we may want to move the generic parameter to be a parameter of the whole interface.
- Notice that our example has changed to be something slightly different.
- In addition to generic interfaces, we can also create generic classes.

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: <Type>(arg: Type) => Type = identity;
```
### Generic Classes

- A generic class has a similar shape to a generic interface.
- This is a pretty literal use of the `GenericNumber` class, but you may have noticed that nothing is restricting it to only use the `number` type.
- Just as with interface, putting the type parameter on the class itself lets us make sure all of the properties of the class are working with the same type.
- As we cover in [our section on classes](/docs/handbook/2/classes.
### Generic Constraints

- If you remember from an earlier example, you may sometimes want to write a generic function that works on a set of types where you have _some_ knowledge about what capabilities that set of types will have.
- Instead of working with any and all types, we'd like to constrain this function to work with any and all types that *also* have the `.
- To do so, we'll create an interface that describes our constraint.
- Because the generic function is now constrained, it will no longer work over any and all types:
- Instead, we need to pass in values whose type has all the required properties:

```ts
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}
```
### Using Type Parameters in Generic Constraints

- You can declare a type parameter that is constrained by another type parameter.
### Using Class Types in Generics

When creating factories in TypeScript using generics, it is necessary to refer to class types by their constructor functions. For example,
A more advanced example uses the prototype property to infer and constrain relationships between the constructor function and the instance side of class types.
This pattern is used to power the [mixins](/docs/handbook/mixins.html) design pattern.
### Generic Parameter Defaults

- By declaring a default for a generic type parameter, you make it optional to specify the corresponding type argument.
- With generic parameter defaults we can reduce it to:
- A generic parameter default follows the following rules:
- - A type parameter is deemed optional if it has a default.
### Variance Annotations

- > This is an advanced feature for solving a very specific problem, and should only be used in situations where you've id
- [Covariance and contravariance](https://en.
- For example, if you have an interface representing an object that can `make` a certain type:
- We can use a `Producer` where a `Producer` is expected, because a `Cat` is an `Animal`.
- Conversely, if you have an interface that can `consume` a certain type:
- Then we can use a `Consumer` where a `Consumer` is expected, because any function that is capable of accepting an `Animal` must also be capable of accepting a `Cat`.
- In a structural type system like TypeScript's, covariance and contravariance are naturally emergent behaviors that follow from the definition of types.
- TypeScript has a structural type system, so when comparing two types, e.
- Note that this logic can only be used when we're examining two instantiations of the same type.
- Because variance is a naturally emergent property of structural types, TypeScript automatically *infers* the variance of every generic type.
- Only do this if you are writing the same variance that *should* occur structurally.
- > Never write a variance annotation that doesn't match the structural variance!
- It's critical to reinforce that variance annotations are only in effect during an instantiation-based comparison.
- Here, the object literal's `make` function returns `number`, which we might expect to cause an error because `number` isn't `string | number`.
- > Variance annotations don't change structural behavior and are only consulted in specific situations
- It's very important to only write variance annotations if you absolutely know why you're doing it, what their limitations are, and when they aren't in effect.
- > Do NOT write variance annotations unless they match the structural behavior of a type

```ts
interface Producer<T> {
  make(): T;
}
```
