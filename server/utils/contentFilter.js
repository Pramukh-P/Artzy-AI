/**
 * Content moderation filter
 * Blocks sexual / explicit / nudity / harmful content
 * Uses word-boundary matching to avoid false positives.
 */

const BLOCKED_WORDS = [
  // Sexual / Nudity
  'nude',
  'naked',
  'nudity',
  'nsfw',
  'porn',
  'pornographic',
  'pornography',
  'explicit',
  'hentai',
  'erotic',
  'erotica',
  'xxx',
  'topless',
  'bottomless',
  'genitalia',
  'genital',
  'penis',
  'vagina',
  'vulva',
  'anus',
  'nipple',
  'boobs',
  'bra',
  'thong',
  'panties',
  'sexy',
  'cleavage',

  // Child safety
  'loli',
  'shota',
  'csam',

  // Violence / Gore
  'gore',
  'gory',
  'snuff',
];

const BLOCKED_PARTIALS = [
  // Stem-based matching
  'masturbat',
  'orgasm',
  'mutilat',
  'decapitat',
  'dismember',
  'sexuali',
];

const BLOCKED_PHRASES = [
  'sex scene',
  'child nude',
  'minor nude',
  'underage nude',
  'child porn',
  'graphic corpse',
  'dead body explicit',
];

/**
 * Regex patterns for more advanced unsafe content
 */
const BLOCKED_PATTERNS = [
  /\b(naked|nude|topless|bottomless)\s+(woman|man|girl|boy|person|model|photo|image|body|figure)\b/i,

  /\b(sexual|erotic|explicit)\s+(content|image|photo|scene|art)\b/i,

  /\bno\s+(clothes|clothing|underwear|shirt|pants|bra|bikini)\b/i,

  /\bwithout\s+(clothes|clothing|underwear|shirt|pants)\b/i,

  /\bfully\s+(naked|nude|exposed|undressed)\b/i,

  /\b(realistic|hyperrealistic)\s+photo\s+of\s+(a\s+)?(real|actual)\b/i,

  /\bdeepfake\b/i,

  /\b(minor|child|kid|teen(ager)?)\s+(nude|naked|sexual|explicit)\b/i,

  /\bsexually\s+(suggestive|explicit|provocative)\b/i,
];

/**
 * Check prompt/message safety
 * @param {string} text
 * @returns {{ blocked: boolean, reason?: string }}
 */
export const checkContent = (text) => {
  if (!text) {
    return { blocked: false };
  }

  const lower = text.toLowerCase();

  // Exact word matching
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');

    if (regex.test(text)) {
      console.log('BLOCKED WORD:', word);

      return {
        blocked: true,
        reason: word,
      };
    }
  }

  // Stem matching
  for (const partial of BLOCKED_PARTIALS) {
    if (lower.includes(partial)) {
      console.log('BLOCKED PARTIAL:', partial);

      return {
        blocked: true,
        reason: partial,
      };
    }
  }

  // Phrase matching
  for (const phrase of BLOCKED_PHRASES) {
    if (lower.includes(phrase)) {
      console.log('BLOCKED PHRASE:', phrase);

      return {
        blocked: true,
        reason: phrase,
      };
    }
  }

  // Regex pattern matching
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      console.log('BLOCKED PATTERN:', pattern);

      return {
        blocked: true,
        reason: 'unsafe_pattern',
      };
    }
  }

  return {
    blocked: false,
  };
};

export const BLOCK_MESSAGE =
  "This content violates our community guidelines. We don't support generation of sexual, explicit, nudity, graphic violence, or harmful content. Please try a different creative prompt! 🎨";
