// Letters that don't split into a base letter + accent, so normalize() can't simplify them
const TRANSLITERATIONS: Record<string, string> = {
  æ: 'ae',
  ø: 'oe',
  å: 'aa',
  ß: 'ss',
  ð: 'd',
  þ: 'th',
  œ: 'oe',
  ł: 'l',
}

// Turns a name into an ASCII URL part, e.g. 'Akershus Fæstning' → 'akershus-faestning',
// so URLs never need percent-encoding
export const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[æøåßðþœł]/g, (letter) => TRANSLITERATIONS[letter])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 96)
    .replace(/^-+|-+$/g, '')
