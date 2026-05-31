/**
 * Content moderation filter
 * Blocks sexual/explicit/nudity/harmful content
 */

const BLOCKED_KEYWORDS = [
  // Sexual / nudity
  'nude', 'naked', 'nudity', 'nsfw', 'porn', 'pornographic', 'pornography',
  'explicit', 'hentai', 'erotic', 'erotica', 'xxx', 'topless', 'bottomless',
  'genitalia', 'genital', 'penis', 'vagina', 'vulva', 'anus', 'nipple',
  'masturbat', 'orgasm', 'intercourse', 'sex scene', 'sexuali',
  // Child safety (absolute block)
  'child nude', 'minor nude', 'underage nude', 'loli', 'shota',
  'child porn', 'cp ', 'csam',
  // Gore / extreme violence
  'gore', 'gory', 'decapitat', 'mutilat', 'snuff', 'dismember',
  'graphic corpse', 'dead body explicit',
];

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
 * Check if text contains blocked content
 * @param {string} text - prompt or message to check
 * @returns {{ blocked: boolean, reason?: string }}
 */
export const checkContent = (text) => {
  if (!text) return { blocked: false };
  const lower = text.toLowerCase();

  for (const kw of BLOCKED_KEYWORDS) {
    if (lower.includes(kw)) {
      return { blocked: true, reason: 'inappropriate_content' };
    }
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: 'inappropriate_pattern' };
    }
  }

  return { blocked: false };
};

export const BLOCK_MESSAGE =
  "This content violates our community guidelines. We don't support generation of sexual, explicit, nudity, graphic violence, or harmful content. Please try a different, creative prompt! 🎨";
