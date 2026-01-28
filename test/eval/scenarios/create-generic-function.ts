import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Create a generic filter-by-type function",
  mode: "create",
  input: "create a generic function that filters an array to only include items matching a type predicate",
  evaluations: [
    { type: "compiles", value: "strict", description: "Code compiles under strict mode" },
    { type: "no-any", value: "", description: "No 'any' types used" },
    { type: "regex", value: "<\\w+", description: "Uses generic type parameter" },
    { type: "regex", value: "is\\s+\\w+", description: "Uses a type predicate" },
  ],
};
