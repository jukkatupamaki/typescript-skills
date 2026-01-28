import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Create a typed React component with generics",
  mode: "create",
  input: "create a generic React select component that accepts an array of options with a value and label, and calls onChange with the selected value. Use proper TypeScript generics so the value type is inferred.",
  evaluations: [
    { type: "no-any", value: "", description: "No 'any' types used" },
    { type: "regex", value: "<\\w+", description: "Uses generic type parameter" },
    { type: "contains", value: "onChange", description: "Includes onChange handler" },
    { type: "regex", value: "interface|type", description: "Defines props type" },
  ],
};
