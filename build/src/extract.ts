/**
 * Markdown parser for TypeScript documentation files.
 * Extracts frontmatter, sections, and code blocks.
 */

import matter from "gray-matter";

export interface DocFile {
  path: string;
  frontmatter: Record<string, unknown>;
  sections: Section[];
  rawContent: string;
}

export interface Section {
  heading: string;
  level: number;
  parentHeading: string;
  content: string;
  codeBlocks: CodeBlock[];
}

export interface CodeBlock {
  lang: string;
  content: string;
  isTwoslash: boolean;
  lines: number;
}

/**
 * Parse a markdown documentation file into structured sections.
 */
export function extractDoc(filePath: string, rawMarkdown: string): DocFile {
  const { data: frontmatter, content: rawContent } = matter(rawMarkdown);
  const content = rawContent.replace(/\r\n/g, "\n");
  const sections = splitIntoSections(content);

  return {
    path: filePath,
    frontmatter,
    sections,
    rawContent: content,
  };
}

/**
 * Split markdown content into sections by headings.
 * Tracks parent headings so that generic sub-headings like "Example"
 * can be resolved to their parent context (e.g., "Partial<Type>").
 */
function splitIntoSections(content: string): Section[] {
  const lines = content.split("\n");
  const sections: Section[] = [];
  let currentHeading = "";
  let currentLevel = 0;
  let currentLines: string[] = [];
  // Track the most recent heading at each level (1-6)
  const headingStack: string[] = ["", "", "", "", "", "", ""];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      // Save previous section
      if (currentLines.length > 0 || currentHeading) {
        const parent = findParentHeading(currentLevel, headingStack);
        sections.push(buildSection(currentHeading, currentLevel, parent, currentLines));
      }
      currentHeading = headingMatch[2];
      currentLevel = headingMatch[1].length;
      headingStack[currentLevel] = currentHeading;
      // Clear deeper levels when a higher heading appears
      for (let i = currentLevel + 1; i < headingStack.length; i++) {
        headingStack[i] = "";
      }
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Save last section
  if (currentLines.length > 0 || currentHeading) {
    const parent = findParentHeading(currentLevel, headingStack);
    sections.push(buildSection(currentHeading, currentLevel, parent, currentLines));
  }

  return sections;
}

/**
 * Find the nearest parent heading (the most recent heading at a shallower level).
 */
function findParentHeading(level: number, headingStack: string[]): string {
  for (let i = level - 1; i >= 1; i--) {
    if (headingStack[i]) return headingStack[i];
  }
  return "";
}

function buildSection(heading: string, level: number, parentHeading: string, lines: string[]): Section {
  const content = lines.join("\n");
  const codeBlocks = extractCodeBlocks(content);

  return {
    heading,
    level,
    parentHeading,
    content,
    codeBlocks,
  };
}

/**
 * Extract fenced code blocks from markdown content.
 */
export function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```(\w*)\s*(twoslash)?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const lang = match[1] || "text";
    const isTwoslash = match[2] === "twoslash";
    const code = match[3];

    blocks.push({
      lang,
      content: code,
      isTwoslash,
      lines: code.split("\n").length,
    });
  }

  return blocks;
}

/**
 * Clean twoslash directives from a code block, keeping the TypeScript code.
 */
export function cleanTwoslash(code: string): string {
  return code
    .split("\n")
    .filter((line) => !line.match(/^\/\/\s*@\w/)) // Remove @directive lines
    .filter((line) => !line.match(/^\/\/\s*\^/)) // Remove pointer lines
    .filter((line) => !line.match(/^\/\/\s*---cut---/)) // Remove cut markers
    .join("\n")
    .trim();
}

/**
 * Strip HTML tags and blocks from markdown content.
 */
export function stripHtml(content: string): string {
  return content
    .replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/g, "")
    .replace(/<details[^>]*>[\s\S]*?<\/details>/g, "")
    .replace(/<div[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<p[^>]*>[\s\S]*?<\/p>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * Strip markdown links, keeping only the link text.
 * [text](url) → text
 * Also removes bare relative URLs like (/docs/...).
 */
export function stripLinks(content: string): string {
  return content
    // [text](url) → text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Remove bare parenthesized relative URLs left over
    .replace(/\(\/docs\/[^)]*\)/g, "");
}

/**
 * Get the title from frontmatter, falling back to display or the filename.
 */
export function getTitle(doc: DocFile): string {
  const fm = doc.frontmatter;
  return (
    (fm.title as string) ||
    (fm.display as string) ||
    doc.path.replace(/.*\//, "").replace(/\.md$/, "")
  );
}
