import type { TestScenario } from "../runner.js";

export const scenario: TestScenario = {
  name: "Review catches excessive any usage",
  mode: "review",
  input: `Review the following TypeScript code:

\`\`\`typescript
function processData(data: any): any {
  const items = data.items as any[];
  return items.map((item: any) => ({
    id: item.id,
    name: item.name as string,
    // @ts-ignore
    value: item.getValue(),
  }));
}

export function handleRequest(req: any, res: any) {
  const body = req.body;
  const result = processData(body);
  res.json(result);
}
\`\`\``,
  evaluations: [
    { type: "contains", value: "any", description: "Identifies the any problem" },
    { type: "contains", value: "unknown", description: "Suggests unknown as alternative" },
    { type: "regex", value: "ts-ignore|ts-expect-error", description: "Flags ts-ignore usage" },
    { type: "regex", value: "interface|type", description: "Suggests defining types" },
  ],
};
