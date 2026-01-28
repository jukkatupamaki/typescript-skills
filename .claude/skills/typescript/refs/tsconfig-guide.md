# Tsconfig Guide

## What is a tsconfig.json

### Overview

- The presence of a `tsconfig.
- JavaScript projects can use a `jsconfig.
### Using `tsconfig.json` or `jsconfig.json`

- - By invoking tsc with no input files, in which case the compiler searches for the `tsconfig.
### Examples

Example `tsconfig.json` files:
- Using the [`files`](/tsconfig#files) property
- Using the [`include`](/tsconfig#include) and [`exclude`](/tsconfig#exclude) properties
### TSConfig Bases

Depending on the JavaScript runtime environment which you intend to run your code in, there may be a base configuration which you can use at [github.com/tsconfig/bases](https://github.com/tsconfig/bases/).
These are `tsconfig.json` files which your project extends from which simplifies your `tsconfig.json` by handling the runtime support.
For example, if you were writing a project which uses Node.js version 12 and above, then you could use the npm module [`@tsconfig/node12`](https://www.npmjs.com/package/@tsconfig/node12):
This lets your `tsconfig.json` focus on the unique choices for your project, and not all of the runtime mechanics. There are a few tsconfig bases already, and we're hoping the community can add more for different environments.
### Details

The `"compilerOptions"` property can be omitted, in which case the compiler's defaults are used. See our full list of supported [Compiler Options](/tsconfig).
### TSConfig Reference

To learn more about the hundreds of configuration options in the [TSConfig Reference](/tsconfig).
### Schema

The `tsconfig.json` Schema can be found at [the JSON Schema Store](https://json.schemastore.org/tsconfig).

## tsc CLI Options

### Using the CLI

- Running `tsc` locally will compile the closest project defined by a `tsconfig.
## Run a compile based on a backwards look through the fs for a tsconfig.json

tsc
## Emit JS for just the index.ts with the compiler defaults

tsc index.ts
## Emit JS for any .ts files in the folder src, with the default settings

tsc src/*.ts
## Emit files referenced in with the compiler settings from tsconfig.production.json

tsc --project tsconfig.production.json
## Emit d.ts files for a js file with showing compiler options which are booleans

tsc index.js --declaration --emitDeclarationOnly
## Emit a single .js file from two files via compiler options which take string arguments

- tsc app.
### Compiler Options

- **If you're looking for more information about the compiler options in a tsconfig, check out the [TSConfig Reference](/t
- CLI Commands
- Flag Type
- --all
- --help
- --init
- --listFilesOnly
- --locale
- --project
- --showConfig
- --version
- Build Options
- Flag Type
- --build
- --clean
- --dry
### Related

- - Every option is fully explained in the [TSConfig Reference](/tsconfig).

## Project References

- Project references allows you to structure your TypeScript programs into smaller pieces, available in TypeScript 3.
- By doing this, you can greatly improve build times, enforce logical separation between components, and organize your code in new and better ways.
- We're also introducing a new mode for `tsc`, the `--build` flag, that works hand in hand with project references to enable faster TypeScript builds.
### An Example Project

- Let's look at a fairly normal program and see how project references can help us better organize it.
- The test files import the implementation files and do some testing:
- Previously, this structure was rather awkward to work with if you used a single tsconfig file:
- - It was possible for the implementation files to import the test files - It wasn't possible to build `test` and `src` a
- You could use multiple tsconfig files to solve _some_ of those problems, but new ones would appear:
- - There's no built-in up-to-date checking, so you end up always running `tsc` twice - Invoking `tsc` twice incurs more s
### What is a Project Reference?

- `tsconfig.
- The `path` property of each reference can point to a directory containing a `tsconfig.
- When you reference a project, new things happen:
### `composite`

- Referenced projects must have the new [`composite`](/tsconfig#composite) setting enabled.
### `declarationMap`

- We've also added support for [declaration source maps](https://github.
### Caveats for Project References

- Project references have a few trade-offs you should be aware of.
### Build Mode for TypeScript

- A long-awaited feature is smart incremental builds for TypeScript projects.
#### `tsc -b` Commandline

- You can specify any number of config files:
- Don't worry about ordering the files you pass on the commandline - `tsc` will re-order them if needed so that dependencies are always built first.
- There are also some flags specific to `tsc -b`:
### Caveats

- Normally, `tsc` will produce outputs (`.
### MSBuild

- If you have an msbuild project, you can enable build mode by adding
### Guidance

#### Overall Structure

- With more `tsconfig.
#### Structuring for relative modules

- In general, not much is needed to transition a repo using relative modules.
#### Structuring for outFiles


## Configuring Watch

As of TypeScript 3.8 and onward, the Typescript compiler exposes configuration which controls how it watches files and directories. Prior to this version, configuration required the use of environment variables which are still available.
### Background

- The `--watch` implementation of the compiler relies on Node's `fs.
- `fs.
### Configuring file watching using a `tsconfig.json`

The suggested method of configuring watch behavior is through the new `watchOptions` section of `tsconfig.json`. We provide an example configuration below. See the following section for detailed descriptions of the settings available.
For further details, see [the release notes for Typescript 3.8](/docs/handbook/release-notes/typescript-3-8.html#better-directory-watching-on-linux-and-watchoptions).
### Configuring file watching using environment variable `TSC_WATCHFILE`

- Option | Description -----------------------------------------------|---------------------------------------------------------------------- `PriorityPollingInterval` | Use `fs.
### Configuring directory watching using environment variable `TSC_WATCHDIRECTORY`

- For directory watches on platforms which don't natively allow recursive directory watching (i.
- **NOTE:** On platforms which support native recursive directory watching, the value of `TSC_WATCHDIRECTORY` is ignored.
- Option | Description -----------------------------------------------|---------------------------------------------------------------------- `RecursiveDirectoryUsingFsWatchFile` | Use `fs.

## Integrating with Build Tools

### Babel

#### Install

#### .babelrc

#### Using Command Line Interface

#### package.json

#### Execute Babel from the command line

### Browserify

#### Install

#### Using Command Line Interface

#### Using API

More details: [smrq/tsify](https://github.com/smrq/tsify)
### Grunt

#### Using `grunt-ts` (no longer maintained)

#### Install

#### Basic Gruntfile.js

More details: [TypeStrong/grunt-ts](https://github.com/TypeStrong/grunt-ts)
#### Using `grunt-browserify` combined with `tsify`

#### Install

#### Basic Gruntfile.js

More details: [jmreidy/grunt-browserify](https://github.com/jmreidy/grunt-browserify), [TypeStrong/tsify](https://github.com/TypeStrong/tsify)
### Gulp

#### Install

#### Basic gulpfile.js

More details: [ivogabe/gulp-typescript](https://github.com/ivogabe/gulp-typescript)
### Jspm

#### Install

- _Note: Currently TypeScript support in jspm is in 0.

## Modules - Choosing Compiler Options

### I’m writing an app

A single tsconfig.json can only represent a single environment, both in terms of what globals are available and in terms of how modules behave. If your app contains server code, DOM code, web worker code, test code, and code to be shared by all of those, each of those should have its own tsconfig.json, connected with [project references](https://www.typescriptlang.org/docs/handbook/project-references.html#handbook-content). Then, use this guide once for each tsconfig.json. For library-like projects within an app, especially ones that need to run in multiple runtime environments, use the “[I’m writing a library](#im-writing-a-library)” section.
#### I’m using a bundler

In addition to adopting the following settings, it’s also recommended _not_ to set `{ "type": "module" }` or use `.mts` files in bundler projects for now. [Some bundlers](https://andrewbranch.github.io/interop-test/#synthesizing-default-exports-for-cjs-modules) adopt different ESM/CJS interop behavior under these circumstances, which TypeScript cannot currently analyze with `"moduleResolution": "bundler"`. See [issue #54102](https://github.com/microsoft/TypeScript/issues/54102) for more information.
#### I’m compiling and running the outputs in Node.js

Remember to set `"type": "module"` or use `.mts` files if you intend to emit ES modules.
#### I’m using ts-node

ts-node attempts to be compatible with the same code and the same tsconfig.json settings that can be used to [compile and run the JS outputs in Node.js](#im-compiling-and-running-the-outputs-in-node). Refer to [ts-node documentation](https://typestrong.org/ts-node/) for more details.
#### I’m using tsx

Whereas ts-node makes minimal modifications to Node.js’s module system by default, [tsx](https://github.com/esbuild-kit/tsx) behaves more like a bundler, allowing extensionless/index module specifiers and arbitrary mixing of ESM and CJS. Use the same settings for tsx as you [would for a bundler](#im-using-a-bundler).
#### I’m writing ES modules for the browser, with no bundler or module compiler

TypeScript does not currently have options dedicated to this scenario, but you can approximate them by using a combination of the `nodenext` ESM module resolution algorithm and `paths` as a substitute for URL and import map support.
This setup allows explicitly listed HTTPS imports to use locally-installed type declaration files, while erroring on imports that would normally resolve in node_modules:
Alternatively, you can use [import maps](https://github.com/WICG/import-maps) to explicitly map a list of bare specifiers to URLs in the browser, while relying on `nodenext`’s default node_modules lookups, or on `paths`, to direct TypeScript to type declaration files for those bare specifier imports:

```ts
import {} from "lodash";
// File '/project/empty-file.ts' is not a module. ts(2306)
```
### I’m writing a library

- Choosing compilation settings as a library author is a fundamentally different process from choosing settings as an app author.
- Let’s examine why we picked each of these settings:
- - **`module: "node18"`**.
- Assuming `.
- On the other hand, if we had written:
- This would produce output that works both in Node.
- In short, `"moduleResolution": "bundler"` is infectious, allowing code that only works in bundlers to be produced.

```ts
export * from "./utils";
```
#### Considerations for bundling libraries

- If you’re using a bundler to emit your library, then all your (non-externalized) imports will be processed by the bundler with known behavior, not by your users’ unknowable environments.
#### Notes on dual-emit solutions

- A single TypeScript compilation (whether emitting or just type checking) assumes that each input file will only produce one output file.
