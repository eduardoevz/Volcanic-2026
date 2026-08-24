/**
 * Parser reducido de markdown: solo el subconjunto usado por los artículos
 * de la biblioteca (## encabezados, listas "- ", negrita **texto**,
 * párrafos). Ningún artículo publicado necesita más que esto — evita
 * agregar una dependencia de markdown completa para 25 artículos propios.
 */

export type InlineSegment = { text: string; bold: boolean };

export type MarkdownBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; segments: InlineSegment[] }
  | { type: 'list'; items: InlineSegment[][] };

export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      segments.push({ text: part.slice(2, -2), bold: true });
    } else {
      segments.push({ text: part, bold: false });
    }
  }
  return segments;
}

export function parseMarkdown(md: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const rawBlocks = md.trim().split(/\n\s*\n/);

  for (const raw of rawBlocks) {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (lines[0].startsWith('## ')) {
      blocks.push({ type: 'heading', text: lines[0].slice(3).trim() });
      continue;
    }

    if (lines.every((l) => l.startsWith('- '))) {
      blocks.push({ type: 'list', items: lines.map((l) => parseInline(l.slice(2).trim())) });
      continue;
    }

    blocks.push({ type: 'paragraph', segments: parseInline(lines.join(' ')) });
  }

  return blocks;
}
