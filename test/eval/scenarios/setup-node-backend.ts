import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Setup creates correct Node.js backend tsconfig",
  mode: "setup",
  input: "setup a Node.js 20 backend API project with TypeScript",
  evaluations: [
    { type: "tsconfig-valid", value: "", description: "Output contains valid tsconfig.json" },
    { type: "regex", value: "nodenext", description: "Uses nodenext module/moduleResolution" },
    { type: "contains", value: "strict", description: "Enables strict mode" },
    { type: "regex", value: "ES202[2-9]|ESNext", description: "Targets modern ES" },
  ],
};
