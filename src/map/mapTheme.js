// Canvas colours per theme matching SeuImposto aesthetics
export const MAP_THEMES = {
  dark: {
    background: '#0F0E0D',
    municipalityBorder: 'rgba(0, 0, 0, 0.18)',
    stateBorder: 'rgba(255, 255, 255, 0.22)',
    coast: 'rgba(255, 255, 255, 0.4)',
    stateOutline: '#fafaf9',
    focus: '#ffffff',
    focusGlow: 'rgba(255, 255, 255, 0.45)',
    hover: 'rgba(255, 255, 255, 0.9)',
    calloutLine: 'rgba(255, 255, 255, 0.45)',
  },
  light: {
    background: '#f6f7f9',
    municipalityBorder: 'rgba(0, 0, 0, 0.08)',
    stateBorder: 'rgba(20, 24, 33, 0.3)',
    coast: 'rgba(20, 24, 33, 0.5)',
    stateOutline: '#141821',
    focus: '#141821',
    focusGlow: 'rgba(20, 24, 33, 0.3)',
    hover: 'rgba(20, 24, 33, 0.85)',
    calloutLine: 'rgba(20, 24, 33, 0.45)',
  },
};

const INK_ON_LIGHT = '#141821';
const INK_ON_DARK = '#ffffff';

/** Text colour that stays legible on top of a `#rrggbb` map fill. */
export function inkOn(hex) {
  if (!hex || hex[0] !== '#') return INK_ON_DARK;
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  const luminance = .2126 * r + .7152 * g + .0722 * b;
  return luminance > .3 ? INK_ON_LIGHT : INK_ON_DARK;
}
