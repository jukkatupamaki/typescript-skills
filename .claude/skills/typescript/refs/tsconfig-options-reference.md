# TSConfig Options Reference

## Type Checking

- **Allow Unreachable Code**: Disable error reporting for unreachable code.
- **Allow Unused Labels**: Disable error reporting for unused labels.
- **Always Strict**: Ensure 'use strict' is always emitted.
- **Exact Optional Property Types**: Interpret optional property types as written, rather than adding `undefined`.
- **No Fallthrough Cases In Switch**: Enable error reporting for fallthrough cases in switch statements.
- **No Implicit Any**: Enable error reporting for expressions and declarations with an implied `any` type.
- **No Implicit Override**: Ensure overriding members in derived classes are marked with an override modifier. Default: `behavior`.
- **No Implicit Returns**: Enable error reporting for codepaths that do not explicitly return in a function.
- **No Implicit This**: Enable error reporting when `this` is given the type `any`.
- **No Property Access From Index Signature**: Enforces using indexed accessors for keys declared using an indexed type.
- **No Unchecked Indexed Access**: Add `undefined` to a type when accessed using an index.
- **Strict Bind Call Apply**: Check that the arguments for `bind`, `call`, and `apply` methods match the original function.
- **Strict Function Types**: When assigning functions, check to ensure parameters and the return values are subtype-compatible.
- **Strict Null Checks**: When type checking, take into account `null` and `undefined`.
- **Strict Property Initialization**: Check for class properties that are declared but not set in the constructor.
- **Strict**: Enable all strict type-checking options.

## Modules

- **Allow Importing TS Extensions**: Allow imports to include TypeScript file extensions.
- **Base URL**: Specify the base directory to resolve bare specifier module names.
- **Custom Conditions**: Conditions to set in addition to the resolver-specific defaults when resolving imports.
- **Module Resolution**: Specify how TypeScript looks up a file from a given module specifier.
- **Module Suffixes**: List of file name suffixes to search when resolving a module. Default: `list of file name suffixes to search when resolving a module.`.
- **Module**: Specify what module code is generated.
- **Paths**: Specify a set of entries that re-map imports to additional lookup locations.
- **Resolve JSON Module**: Enable importing .json files.
- **Resolve package.json Exports**: Use the package.json 'exports' field when resolving package imports.
- **Resolve package.json Imports**: Use the package.json 'imports' field when resolving imports.
- **Root Dir**: Specify the root folder within your source files. Default: `is instead the directory containing the`.
- **Root Dirs**: Allow multiple folders to be treated as one when resolving modules.
- **Type Roots**: Specify multiple folders that act like `./node_modules/@types`. Default: `all _visible_ "`.
- **Types**: Specify type package names to be included without being referenced in a source file. Default: `all _visible_ "`.

## Emit

- **Declaration Dir**: Specify the output directory for generated declaration files.
- **Declaration Map**: Create sourcemaps for d.ts files.
- **Declaration**: Generate .d.ts files from TypeScript and JavaScript files in your project.
- **Downlevel Iteration**: Emit more compliant, but verbose and less performant JavaScript for iteration.
- **Emit BOM**: Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. Default: `value of`.
- **Emit Declaration Only**: Only output d.ts files and not JavaScript files.
- **Import Helpers**: Allow importing helper functions from tslib once per project, instead of including them per-file.
- **Inline Source Map**: Include sourcemap files inside the emitted JavaScript.
- **Inline Sources**: Include source code in the sourcemaps inside the emitted JavaScript. Default: `converts to this JavaScript:`.
- **Map Root**: Specify the location where debugger should locate map files instead of generated locations.
- **New Line**: Set the newline character for emitting files.
- **No Emit On Error**: Disable emitting files if any type checking errors are reported.
- **No Emit**: Disable emitting files from a compilation.
- **Out Dir**: Specify an output folder for all emitted files.
- **Out File**: Specify a file that bundles all outputs into one JavaScript file. If [`declaration`](#declaration) is true, also designates a file that bundles all .d.ts output.
- **Preserve Const Enums**: Disable erasing `const enum` declarations in generated code. Default: `const enum`.
- **Remove Comments**: Disable emitting comments.
- **Source Map**: Create source map files for emitted JavaScript files.
- **Source Root**: Specify the root path for debuggers to find the reference source code.
- **Strip Internal**: Disable emitting declarations that have `@internal` in their JSDoc comments.

## JavaScript Support

- **Allow JS**: Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files.
- **Check JS**: Enable error reporting in type-checked JavaScript files.
- **Max Node Module JS Depth**: Specify the maximum folder depth used for checking JavaScript files from `node_modules`. Only applicable with [`allowJs`](#allowJs).

## Interop Constraints

- **Allow Synthetic Default Imports**: Allow 'import x from y' when a module doesn't have a default export. Default: `export.`.
- **ES Module Interop**: Emit additional JavaScript to ease support for importing CommonJS modules. This enables [`allowSyntheticDefaultImports`](#allowSyntheticDefaultImports) for type compatibility. Default: `(with`.
- **Force Consistent Casing In File Names**: Ensure that casing is correct in imports.
- **Isolated Modules**: Ensure that each file can be safely transpiled without relying on other imports.
- **Verbatim Module Syntax**: Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting.

## Language and Environment

- **Emit Decorator Metadata**: Emit design-type metadata for decorated declarations in source files.
- **Experimental Decorators**: Enable experimental support for TC39 stage 2 draft decorators.
- **JSX Factory**: Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. Default: `"React.createElement"`.
- **JSX Fragment Factory**: Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'.
- **JSX Import Source**: Specify module specifier used to import the JSX factory functions when using `jsx: react-jsx*`.
- **JSX**: Specify what JSX code is generated.
- **Lib**: Specify a set of bundled library declaration files that describe the target runtime environment. Default: `set of type definitions for built-in JS APIs (like`.
- **Target**: Set the JavaScript language version for emitted JavaScript and include compatible library declarations. Default: `value of [`.
- **Use Define For Class Fields**: Emit ECMAScript-standard-compliant class fields.

## Completeness

- **Composite**: Enable constraints that allow a TypeScript project to be used with project references.
- **Disable Referenced Project Load**: Reduce the number of projects loaded automatically by TypeScript.
- **Disable Solution Searching**: Opt a project out of multi-project reference checking when editing.
- **Disable Source Project Reference Redirect**: Disable preferring source files instead of declaration files when referencing composite projects.
- **Incremental**: Save .tsbuildinfo files to allow for incremental compilation of projects.
- **Skip Default Lib Check**: Skip type checking .d.ts files that are included with TypeScript. Default: `library declaration files.`.
- **Skip Lib Check**: Skip type checking all .d.ts files.
- **TS Build Info File**: The file to store `.tsbuildinfo` incremental build information in. Default: `depends on a combination of other settings:`.

## Other

- **Allow Arbitrary Extensions**: Enable importing files with any extension, provided a declaration file is present. Default: `css;`.
- **Allow Umd Global Access**: Allow accessing UMD globals from modules.
- **Assume Changes Only Affect Direct Dependencies**: Have recompiles in projects that use [`incremental`](#incremental) and `watch` mode assume that changes within a file will only affect files directly depending on it.
- **Charset**: No longer supported. In early versions, manually set the text encoding for reading files.
- **Clean**: Delete the outputs of all projects.
- **Diagnostics**: Output compiler performance information after building.
- **Disable Filename Based Type Acquisition**: Disables inference for type acquisition by looking at filenames in a project.
- **Disable Size Limit**: Remove the 20mb cap on total source code size for JavaScript files in the TypeScript language server.
- **Enable**: Disable the type acquisition for JavaScript projects.
- **Erasable Syntax Only**: Do not allow runtime constructs that are not part of ECMAScript.
- **Exclude Directories**: Remove a list of directories from the watch process.
- **Exclude Files**: Remove a list of files from the watch mode's processing.
- **Exclude**: Filters results from the [`include`](#include) option.
- **Explain Files**: Print files read during the compilation including why it was included. Default: `library for target 'es5'`.
- **Extended Diagnostics**: Output more detailed compiler performance information after building.
- **Extends**: Specify one or more path or node module references to base configuration files from which settings are inherited.
- **Fallback Polling**: Specify what approach the watcher should use if the system runs out of native file watchers.
- **Files**: Include a list of files. This does not support glob patterns, as opposed to [`include`](#include).
- **Force**: Build all projects, including those that appear to be up to date.
- **Generate CPU Profile**: Emit a v8 CPU profile of the compiler run for debugging.
- **Imports Not Used As Values**: Specify emit/checking behavior for imports that are only used for types. Default: `behavior of dropping`.
- **Include**: Specify a list of glob patterns that match files to be included in compilation.
- **Keyof Strings Only**: Make keyof only return strings instead of string, numbers or symbols. Legacy option.
- **Lib Replacement**: Enable substitution of default `lib` files with custom ones. Default: `lib`.
- **List Emitted Files**: Print the names of emitted files after a compilation.
- **List Files**: Print all of the files read during the compilation.
- **Locale**: Set the language of the messaging from TypeScript. This does not affect emit.
- **Module Detection**: Specify what method is used to detect whether a file is a script or a module.
- **No Emit Helpers**: Disable generating custom helper functions like `__extends` in compiled output.
- **No Error Truncation**: Disable truncating types in error messages.
- **No Implicit Use Strict**: Disable adding 'use strict' directives in emitted JavaScript files.
- **No Lib**: Disable including any library files, including the default lib.d.ts.
- **No Resolve**: Disallow `import`s, `require`s or `<reference>`s from expanding the number of files TypeScript should add to a project.
- **No Strict Generic Checks**: Disable strict checking of generic signatures in function types.
- **No Unused Locals**: Enable error reporting when local variables aren't read.
- **No Unused Parameters**: Raise an error when a function parameter isn't read.
- **Out**: Deprecated setting. Use [`outFile`](#outFile) instead.
- **Plugins**: Specify a list of language service plugins to include.
- **Preserve Symlinks**: Disable resolving symlinks to their realpath. This correlates to the same flag in node.
- **Preserve Value Imports**: Preserve unused imported values in the JavaScript output that would otherwise be removed.
- **Preserve Watch Output**: Disable wiping the console in watch mode.
- **Pretty**: Enable color and formatting in TypeScript's output to make compiler errors easier to read. Default: `&mdash; offers you a chance to have less terse,`.
- **React Namespace**: Specify the object invoked for `createElement`. This only applies when targeting `react` JSX emit.
- **References**: Specify an array of objects that specify paths for projects. Used in project references.
- **Suppress Excess Property Errors**: Disable reporting of excess property errors during the creation of object literals.
- **Suppress Implicit Any Index Errors**: Suppress [`noImplicitAny`](#noImplicitAny) errors when indexing objects that lack index signatures.
- **Synchronous Watch Directory**: Synchronously call callbacks and update the state of directory watchers on platforms that don`t support recursive watching natively.
- **Trace Resolution**: Log paths used during the [`moduleResolution`](#moduleResolution) process.
- **Type Acquisition**: Specify options for automatic acquisition of declaration files.
- **Use Unknown In Catch Variables**: Default catch clause variables as `unknown` instead of `any`.
- **Verbose**: Enable verbose logging.
- **Watch Directory**: Specify how directories are watched on systems that lack recursive file-watching functionality.
- **Watch File**: Specify how the TypeScript watch mode works.
- **generateTrace**: Generates an event trace and a list of types.
- **isolatedDeclarations**: Require sufficient annotation on exports so other tools can trivially generate declaration files.
- **noCheck**: Disable full type checking (only critical parse and emit errors will be reported).
- **noUncheckedSideEffectImports**: Check side effect imports.
- **rewriteRelativeImportExtensions**: Rewrite `.ts`, `.tsx`, `.mts`, and `.cts` file extensions in relative import paths to their JavaScript equivalent in output files.
- **stopBuildOnErrors**: Skip building downstream projects on error in upstream project.
- **strictBuiltinIteratorReturn**: Built-in iterators are instantiated with a TReturn type of undefined instead of any.
