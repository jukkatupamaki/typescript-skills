# Modules And Namespaces

## Modules

- JavaScript has a long history of different ways to handle modularizing code.

## Modules - Introduction

This document is divided into four sections:
1. The first section develops the [**theory**](/docs/handbook/modules/theory.html) behind how TypeScript approaches modules. If you want to be able to write the correct module-related compiler options for any situation, reason about how to integrate TypeScript with other tools, or understand how TypeScript processes dependency packages, this is the place to start. While there are guides and reference pages on these topics, building an understanding of these fundamentals will make reading the guides easier, and give you a mental framework for dealing with real-world problems not specifically covered here.
2. The [**guides**](/docs/handbook/modules/guides/choosing-compiler-options.html) show how to accomplish specific real-world tasks, starting with picking the right compilation settings for a new project. The guides are a good place to start both for beginners who want to get up and running as quickly as possible and for experts who already have a good grasp of the theory but want concrete guidance on a complicated task.
3. The [**reference**](/docs/handbook/modules/reference.html) section provides a more detailed look at the syntaxes and configurations presented in previous sections.
4. The [**appendices**](/docs/handbook/modules/appendices/esm-cjs-interop.html) cover complicated topics that deserve additional explanation in more detail than the theory or reference sections allow.

## Modules - Theory

### Scripts and modules in JavaScript

- In the early days of JavaScript, when the language only ran in browsers, there were no modules, but it was still possibl
- This approach had some downsides, especially as web pages grew larger and more complex.
- Any system that solves this problem by giving files their own scope while still providing a way to make bits of code available to other files can be called a “module system.
### TypeScript’s job concerning modules

- The TypeScript compiler’s chief goal is to prevent certain kinds of runtime errors by catching them at compile time.
- To check this file, the compiler needs to know the type of `sayHello` (is it a function that can accept one string argument?
### Who is the host?

- Before we move on, it’s worth making sure we’re on the same page about the term _host_, because it will come up frequently.
### The module output format

- In any project, the first question about modules we need to answer is what kinds of modules the host expects, so TypeScript can set its output format for each file to match.
#### Module format detection

- Node.
#### Input module syntax

- It’s important to note that the _input_ module syntax seen in input source files is somewhat decoupled from the output module syntax emitted to JS files.
#### ESM and CJS interoperability

- Can an ES module `import` a CommonJS module?
#### Module specifiers are not transformed by default

- While the `module` compiler option can transform imports and exports in input files to different module formats in output files, the module _specifier_ (the string `from` which you `import`, or pass to `require`) is emitted as-written.
### Module resolution

- Let’s return to our [first example](#typescripts-job-concerning-modules) and review what we’ve learned about it so far:
#### Module resolution is host-defined

- While the ECMAScript specification defines how to parse and interpret `import` and `export` statements, it leaves module resolution up to the host.
#### TypeScript imitates the host’s module resolution, but with types

- Remember the three components of TypeScript’s [job](#typescripts-job-concerning-modules) concerning modules?
- 1.
- Module resolution is needed to accomplish last two.
#### The role of declaration files

- In the previous example, we saw the “remapping” part of module resolution working between input and output files.
#### Module resolution for bundlers, TypeScript runtimes, and Node.js loaders

- So far, we’ve really emphasized the distinction between _input files_ and _output files_.
#### Module resolution for libraries

- When compiling an app, you choose the `moduleResolution` option for a TypeScript project based on who the module resolution [host](#module-resolution-is-host-defined) is.

## Modules - Reference

### Module syntax

- The TypeScript compiler recognizes standard [ECMAScript module syntax](https://developer.
#### Importing and exporting TypeScript-specific declarations

- Type aliases, interfaces, enums, and namespaces can be exported from a module with an `export` modifier, like any standa
#### Type-only imports and exports

- When emitting imports and exports to JavaScript, by default, TypeScript automatically elides (does not emit) imports that are only used in type positions and exports that only refer to types.
#### `import()` types

- TypeScript provides a type syntax similar to JavaScript’s dynamic `import` for referencing the type of a module without 
#### `export =` and `import = require()`

- When emitting CommonJS modules, TypeScript files can use a direct analog of `module.
#### Ambient modules

- TypeScript supports a syntax in script (non-module) files for declaring a module that exists in the runtime but has no corresponding file.
### The `module` compiler option

This section discusses the details of each `module` compiler option value. See the [_Module output format_](/docs/handbook/modules/theory.html#the-module-output-format) theory section for more background on what the option is and how it fits into the overall compilation process. In brief, the `module` compiler option was historically only used to control the output module format of emitted JavaScript files. The more recent `node16`, `node18`, and `nodenext` values, however, describe a wide range of characteristics of Node.js’s module system, including what module formats are supported, how the module format of each file is determined, and how different module formats interoperate.
#### `node16`, `node18`, `node20`, `nodenext`

- Node.
#### Module format detection

- - `.
#### Interoperability rules

- - **When an ES module references a CommonJS module:** - The `module.
#### Emit

- The emit format of each file is determined by the [detected module format](#module-format-detection) of each file.
#### Implied and enforced options

- - `--module nodenext` implies and enforces `--moduleResolution nodenext`.
#### Summary

- - `node16`, `node18`, and `nodenext` are the only correct `module` options for all apps and libraries that are intended to run in Node.
#### `preserve`

- In `--module preserve` ([added](https://www.
#### Examples

#### Implied and enforced options

- - `--module preserve` implies `--moduleResolution bundler`.
#### `es2015`, `es2020`, `es2022`, `esnext`


## Namespaces

- > **A note about terminology:** > It's important to note that in TypeScript 1.
- This post outlines the various ways to organize your code using namespaces (previously "internal modules") in TypeScript.
### First steps

- Let's start with the program we'll be using as our example throughout this page.
### Validators in a single file

### Namespacing

- As we add more validators, we're going to want to have some kind of organization scheme so that we can keep track of our types and not worry about name collisions with other objects.
### Namespaced Validators

### Splitting Across Files

As our application grows, we'll want to split the code across multiple files to make it easier to maintain.
### Multi-file namespaces

- Here, we'll split our `Validation` namespace across many files.
#### Validation.ts

#### LettersOnlyValidator.ts

#### ZipCodeValidator.ts

#### Test.ts

- Once there are multiple files involved, we'll need to make sure all of the compiled code gets loaded.
- First, we can use concatenated output using the [`outFile`](/tsconfig#outFile) option to compile all of the input files 
- The compiler will automatically order the output file based on the reference tags present in the files.
- Alternatively, we can use per-file compilation (the default) to emit one JavaScript file for each input file.
#### MyTestPage.html (excerpt)

### Aliases

- Another way that you can simplify working with namespaces is to use `import q = x.
### Working with Other JavaScript Libraries

- To describe the shape of libraries not written in TypeScript, we need to declare the API that the library exposes.
### Ambient Namespaces

- The popular library D3 defines its functionality in a global object called `d3`.
#### D3.d.ts (simplified excerpt)


## Namespaces and Modules

- This post outlines the various ways to organize your code using modules and namespaces in TypeScript.
- See the [Modules](/docs/handbook/modules.
- Note: In _very_ old versions of TypeScript namespaces were called 'Internal Modules', these pre-date JavaScript module systems.
### Using Modules

- Modules can contain both code and declarations.
- Modules also have a dependency on a module loader (such as CommonJs/Require.
### Using Namespaces

- Namespaces are a TypeScript-specific way to organize code.
### Pitfalls of Namespaces and Modules

In this section we'll describe various common pitfalls in using namespaces and modules, and how to avoid them.
#### `/// <reference>`-ing a module

- A common mistake is to try to use the `/// ` syntax to refer to a module file, rather than using an `import` statement.
- The compiler will try to find a `.
- - `myModules.
- - `myOtherModule.
- The reference tag here allows us to locate the declaration file that contains the declaration for the ambient module.

```ts
/// <reference path="myModules.d.ts" />
  import * as m from "SomeModule";
```
#### Needless Namespacing

If you're converting a program from namespaces to modules, it can be easy to end up with a file that looks like this:
- `shapes.ts`
The top-level namespace here `Shapes` wraps up `Triangle` and `Square` for no reason.
This is confusing and annoying for consumers of your module:
- `shapeConsumer.ts`
A key feature of modules in TypeScript is that two different modules will never contribute names to the same scope.
Because the consumer of a module decides what name to assign it, there's no need to proactively wrap up the exported symbols in a namespace.
To reiterate why you shouldn't try to namespace your module contents, the general idea of namespacing is to provide logical grouping of constructs and to prevent name collisions.
Because the module file itself is already a logical grouping, and its top-level name is defined by the code that imports it, it's unnecessary to use an additional module layer for exported objects.
Here's a revised example:
- `shapes.ts`
- `shapeConsumer.ts`

```ts
import * as shapes from "./shapes";
  let t = new shapes.Shapes.Triangle(); // shapes.Shapes?
```
#### Trade-offs of Modules

- Just as there is a one-to-one correspondence between JS files and modules, TypeScript has a one-to-one correspondence between module source files and their emitted JS files.
