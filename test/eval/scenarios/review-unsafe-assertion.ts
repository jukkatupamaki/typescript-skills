import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Review catches unsafe type assertions",
  mode: "review",
  input: `Review the following TypeScript code:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return data as User;
}

function getProperty(obj: object, key: string): string {
  return (obj as Record<string, string>)[key];
}

function processItems(items: unknown[]) {
  for (const item of items) {
    console.log((item as { name: string }).name);
    const value = (item as any).value!;
    doSomething(value);
  }
}

function doSomething(v: string) { console.log(v); }
\`\`\``,
  evaluations: [
    { type: "regex", value: "assert|as\\b|cast", description: "Identifies type assertions" },
    { type: "regex", value: "narrow|guard|check|validate", description: "Suggests type narrowing" },
    { type: "regex", value: "!|non-null", description: "Flags non-null assertion" },
  ],
};
