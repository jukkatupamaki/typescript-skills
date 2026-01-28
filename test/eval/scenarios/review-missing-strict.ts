import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Review identifies missing strict mode and enum issues",
  mode: "review",
  input: `Review the following TypeScript code and tsconfig:

tsconfig.json:
\`\`\`json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "outDir": "./dist"
  }
}
\`\`\`

src/types.ts:
\`\`\`typescript
enum Status {
  Active,
  Inactive,
  Pending,
}

enum Role {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}

function getStatusLabel(status: Status): string {
  switch (status) {
    case Status.Active:
      return "Active";
    case Status.Inactive:
      return "Inactive";
  }
}
\`\`\``,
  evaluations: [
    { type: "contains", value: "strict", description: "Flags missing strict mode" },
    { type: "regex", value: "enum|as const", description: "Comments on enum usage" },
    { type: "regex", value: "exhausti|Pending|never|missing case", description: "Catches non-exhaustive switch" },
  ],
};
