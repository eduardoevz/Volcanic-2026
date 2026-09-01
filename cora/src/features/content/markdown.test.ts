import { parseInline, parseMarkdown } from './markdown';

describe('parseInline', () => {
  it('devuelve un único segmento sin negrita para texto plano', () => {
    expect(parseInline('hola mundo')).toEqual([{ text: 'hola mundo', bold: false }]);
  });

  it('detecta un segmento en negrita entre **', () => {
    expect(parseInline('esto es **importante** de verdad')).toEqual([
      { text: 'esto es ', bold: false },
      { text: 'importante', bold: true },
      { text: ' de verdad', bold: false },
    ]);
  });
});

describe('parseMarkdown', () => {
  it('parsea un encabezado ##', () => {
    expect(parseMarkdown('## Título')).toEqual([{ type: 'heading', text: 'Título' }]);
  });

  it('parsea una lista de líneas "- "', () => {
    const blocks = parseMarkdown('- uno\n- dos');
    expect(blocks).toEqual([
      { type: 'list', items: [[{ text: 'uno', bold: false }], [{ text: 'dos', bold: false }]] },
    ]);
  });

  it('parsea un párrafo con negrita inline', () => {
    const blocks = parseMarkdown('Un párrafo con **énfasis** normal.');
    expect(blocks).toEqual([
      {
        type: 'paragraph',
        segments: [
          { text: 'Un párrafo con ', bold: false },
          { text: 'énfasis', bold: true },
          { text: ' normal.', bold: false },
        ],
      },
    ]);
  });

  it('ignora bloques vacíos entre separadores de doble salto de línea', () => {
    const blocks = parseMarkdown('## Título\n\n\n\nTexto');
    expect(blocks).toEqual([
      { type: 'heading', text: 'Título' },
      { type: 'paragraph', segments: [{ text: 'Texto', bold: false }] },
    ]);
  });

  it('con string vacío devuelve un array vacío', () => {
    expect(parseMarkdown('')).toEqual([]);
  });
});
