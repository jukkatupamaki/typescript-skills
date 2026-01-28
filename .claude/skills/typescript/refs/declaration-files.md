# Declaration Files

## Introduction

- The Declaration Files section is designed to teach you how to write a high-quality TypeScript Declaration File.
- If you haven't already, you should read the [TypeScript Handbook](/docs/handbook/2/basic-types.
- The most common case for learning how .
- The Declaration Files section is broken down into the following sections.
### [Declaration Reference](/docs/handbook/declaration-files/by-example.html)

- We are often faced with writing a declaration file when we only have examples of the underlying library to guide us.
### [Library Structures](/docs/handbook/declaration-files/library-structures.html)

- The [Library Structures](/docs/handbook/declaration-files/library-structures.
- In the Template section you'll find a number of declaration files that serve as a useful starting point when writing a new file.
### [Do's and Don'ts](/docs/handbook/declaration-files/do-s-and-don-ts.html)

- Many common mistakes in declaration files can be easily avoided.
### [Deep Dive](/docs/handbook/declaration-files/deep-dive.html)

- For seasoned authors interested in the underlying mechanics of how declaration files work, the [Deep Dive](/docs/handbook/declaration-files/deep-dive.
### [Publish to npm](/docs/handbook/declaration-files/publishing.html)

The [Publishing](/docs/handbook/declaration-files/publishing.html) section explains how to publish your declaration files to an npm package, and shows how to manage your dependent packages.
### [Find and Install Declaration Files](/docs/handbook/declaration-files/consumption.html)

For JavaScript library users, the [Consumption](/docs/handbook/declaration-files/consumption.html) section offers a few simple steps to locate and install corresponding declaration files.

## Declaration Reference

- The purpose of this guide is to teach you how to write a high-quality definition file.
- These examples are ordered in approximately increasing order of complexity.
### Objects with Properties

- _Documentation_
### Overloaded Functions

- _Documentation_
### Reusable Types (Interfaces)

- _Documentation_
### Reusable Types (Type Aliases)

- _Documentation_
### Organizing Types

- _Documentation_
- > The `greeter` object can log to a file or display an alert.
- _Code_
### Classes

- _Documentation_
### Global Variables

- _Documentation_
### Global Functions


## Do's and Don'ts

### General Types

#### `Number`, `String`, `Boolean`, `Symbol` and `Object`

- ❌ **Don't** ever use the types `Number`, `String`, `Boolean`, `Symbol`, or `Object` These types refer to non-primitive boxed objects that are almost never used appropriately in JavaScript code.
#### Generics

- ❌ **Don't** ever have a generic type which doesn't use its type parameter.
#### any

- ❌ **Don't** use `any` as a type unless you are in the process of migrating a JavaScript project to TypeScript.
### Callback Types

#### Return Types of Callbacks

- ❌ **Don't** use the return type `any` for callbacks whose value will be ignored:
#### Optional Parameters in Callbacks

- ❌ **Don't** use optional parameters in callbacks unless you really mean it:
#### Overloads and Callbacks

- ❌ **Don't** write separate overloads that differ only on callback arity:
### Function Overloads

#### Ordering

- ❌ **Don't** put more general overloads before more specific overloads:

## Deep Dive

### Declaration File Theory: A Deep Dive

- Structuring modules to give the exact API shape you want can be tricky.
### Key Concepts

- You can fully understand how to make any shape of declaration by understanding some key concepts of how TypeScript works.
#### Types

- If you're reading this guide, you probably already roughly know what a type in TypeScript is.
#### Values

- As with types, you probably already understand what a value is.
#### Namespaces

- Types can exist in _namespaces_.
### Simple Combinations: One name, multiple meanings

- Given a name `A`, we might find up to three different meanings for `A`: a type, a value or a namespace.
#### Built-in Combinations

- Astute readers will notice that, for example, `class` appeared in both the _type_ and _value_ lists.
#### User Combinations

- Let's say we wrote a module file `foo.
- Then consumed it:
### Advanced Combinations


## Library Structures

- Broadly speaking, the way you _structure_ your declaration file depends on how the library is consumed.
- Each type of major library structuring pattern has a corresponding file in the [Templates](/docs/handbook/declaration-files/templates.
### Identifying Kinds of Libraries

- First, we'll review the kinds of libraries TypeScript declaration files can represent.
#### What should you look for?

- Question to ask yourself while looking at a library you are trying to type.
#### Smaller samples for different types of libraries

#### Modular Libraries

- Almost every modern Node.
#### Identifying a Module Library from Code

- Modular libraries will typically have at least some of the following:
#### Templates For Modules

- There are four templates available for modules, [`module.
#### Global Libraries

- A _global_ library is one that can be accessed from the global scope (i.
#### Identifying a Global Library from Code

- Global library code is usually extremely simple.
#### Examples of Global Libraries


## Publishing

- Now that you have authored a declaration file following the steps of this guide, it is time to publish it to npm.
- 1.
- If your types are generated by your source code, publish the types with your source code.
### Including declarations in your npm package

- If your package has a main `.
### Dependencies

- All dependencies are managed by npm.
- Here, our package depends on the `browserify` and `typescript` packages.
### Red flags

#### `/// <reference path="..." />`

- _Don't_ use `/// ` in your declaration files.
#### Packaging dependent declarations

- If your type definitions depend on another package:
### Version selection with `typesVersions`

When TypeScript opens a `package.json` file to figure out which files it needs to read, it first looks at a field called `typesVersions`.
#### Folder redirects (using `*`)

- A `package.
#### File redirects

- When you want to only change the resolution for a single file at a time, you can tell TypeScript the file to resolve dif

## Consumption

### Downloading

Getting type declarations requires no tools apart from npm.
As an example, getting the declarations for a library like lodash takes nothing more than the following command
It is worth noting that if the npm package already includes its declaration file as described in [Publishing](/docs/handbook/declaration-files/publishing.html), downloading the corresponding `@types` package is not needed.
### Consuming

From there you’ll be able to use lodash in your TypeScript code with no fuss.
This works for both modules and global code.
For example, once you’ve `npm install`-ed your type declarations, you can use imports and write
or if you’re not using modules, you can just use the global variable `_`.

```ts
_.padStart("Hello TypeScript!", 20, " ");
```
### Searching

- For the most part, type declaration packages should always have the same name as the package name on `npm`, but prefixed with `@types/`, but if you need, you can use the [Yarn package search](https://yarnpkg.
- > Note: if the declaration file you are searching for is not present, you can always contribute one back and help out the next developer looking for it.
