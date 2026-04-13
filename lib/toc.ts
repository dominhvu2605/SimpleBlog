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

/** Build a marked renderer that injects id attributes on h2/h3, and wraps images in figure */
function buildRenderer(): Partial<Renderer> {
  return {
    heading({ text, depth }: { text: string; depth: number }): string {
      if (depth === 2 || depth === 3) {
        const id = toId(text);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      }
      return `<h${depth}>${text}</h${depth}>\n`;
    },
    // Wrap images in <figure>; use title as <figcaption> when provided
    // Markdown syntax: ![alt text](url) or ![alt text](url "caption")
    image({ href, title, text }: { href: string; title: string | null; text: string }): string {
      const img = `<img src="${href}" alt="${text}" loading="lazy">`;
      if (title) {
        return `<figure>${img}<figcaption>${title}</figcaption></figure>\n`;
      }
      return `<figure>${img}</figure>\n`;
    },
  };
}

// ─── Custom block extensions for video and audio ─────────────
// Syntax:  @[video](url)  or  @[video](url "caption")
//          @[audio](url)  or  @[audio](url "caption")

type MediaToken = { type: string; raw: string; url: string; caption: string };

function mediaExtension(mediaType: 'video' | 'audio') {
  const rule = new RegExp(
    `^@\\[${mediaType}\\]\\(([^\\)\\s]+)(?:\\s+"([^"]*)")?\\)\\n?`
  );
  return {
    name: mediaType,
    level: 'block' as const,
    start(src: string) {
      return src.indexOf(`@[${mediaType}]`);
    },
    tokenizer(src: string): MediaToken | undefined {
      const match = rule.exec(src);
      if (match) {
        return { type: mediaType, raw: match[0], url: match[1], caption: match[2] ?? '' };
      }
    },
    renderer(token: Record<string, string>): string {
      const caption = token.caption
        ? `<figcaption>${token.caption}</figcaption>`
        : '';
      if (mediaType === 'video') {
        return `<figure><video src="${token.url}" controls></video>${caption}</figure>\n`;
      }
      return `<figure><audio src="${token.url}" controls></audio>${caption}</figure>\n`;
    },
  };
}

// Register custom extensions once at module load
marked.use({
  extensions: [mediaExtension('video'), mediaExtension('audio')],
});

/** Render markdown to HTML with heading ids, figure wrapping, and media embeds */
export async function renderMarkdown(markdown: string): Promise<string> {
  marked.use({ renderer: buildRenderer() });
  return marked(markdown);
}
