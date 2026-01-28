import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Create type guards for discriminated union",
  mode: "create",
  input: "create a Result type that is either Success with a data field or Failure with an error field. Include type guard functions and an exhaustive match function that uses never.",
  evaluations: [
    { type: "compiles", value: "strict", description: "Code compiles under strict mode" },
    { type: "no-any", value: "", description: "No 'any' types used" },
    { type: "contains", value: "never", description: "Uses never for exhaustiveness" },
    { type: "regex", value: "is\\s+(Success|Failure|Result)", description: "Uses type predicate" },
  ],
};
