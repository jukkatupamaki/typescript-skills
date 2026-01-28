import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Setup creates correct React app tsconfig",
  mode: "setup",
  input: "setup a React application using Vite with TypeScript",
  evaluations: [
    { type: "tsconfig-valid", value: "", description: "Output contains valid tsconfig.json" },
    { type: "regex", value: "bundler|preserve", description: "Uses bundler-compatible module settings" },
    { type: "contains", value: "strict", description: "Enables strict mode" },
    { type: "regex", value: "react-jsx|jsx", description: "Configures JSX" },
  ],
};
