import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Setup creates correct library tsconfig",
  mode: "setup",
  input: "setup a TypeScript library that will be published to npm, with declaration files and source maps",
  evaluations: [
    { type: "tsconfig-valid", value: "", description: "Output contains valid tsconfig.json" },
    { type: "contains", value: "declaration", description: "Enables declaration generation" },
    { type: "contains", value: "strict", description: "Enables strict mode" },
    { type: "regex", value: "declarationMap|sourceMap", description: "Enables source maps" },
  ],
};
