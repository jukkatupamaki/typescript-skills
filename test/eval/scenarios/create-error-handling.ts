import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Create typed error handling",
  mode: "create",
  input: "create a typed error handling system with a base AppError class, specific error subclasses (NotFoundError, ValidationError, AuthError), and a function that catches unknown errors and converts them to AppError instances.",
  evaluations: [
    { type: "compiles", value: "strict", description: "Code compiles under strict mode" },
    { type: "no-any", value: "", description: "No 'any' types used" },
    { type: "contains", value: "unknown", description: "Uses unknown in catch clause" },
    { type: "contains", value: "extends", description: "Uses class inheritance" },
  ],
};
