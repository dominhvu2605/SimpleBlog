import { marked, type Renderer } from 'marked';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Convert a heading text to a URL-safe id */
function toId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // remove special chars
    .trim()
    .replace(/\s+/g, '-');      // spaces → hyphens
}

/** Parse h2/h3 headings from raw markdown */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);

    if (h3) {
      const text = h3[1].trim();
      headings.push({ id: toId(text), text, level: 3 });
    } else if (h2) {
      const text = h2[1].trim();
      headings.push({ id: toId(text), text, level: 2 });
    }
  }

  return headings;
}

/** Build a marked renderer that injects id attributes on h2/h3 */
function buildRenderer(): Partial<Renderer> {
  return {
    heading({ text, depth }: { text: string; depth: number }): string {
      if (depth === 2 || depth === 3) {
        const id = toId(text);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      }
      return `<h${depth}>${text}</h${depth}>\n`;
    },
  };
}

/** Render markdown to HTML with heading ids injected */
export async function renderMarkdown(markdown: string): Promise<string> {
  marked.use({ renderer: buildRenderer() });
  return marked(markdown);
}
