const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const decimal1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const decimal2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const int = value => integer.format(Math.round(value));
export const percent = (ratio, digits = 2) => {
  if (ratio == null || isNaN(ratio)) return '0,00%';
  if (digits === 0) return integer.format(Math.round(ratio * 100)) + '%';
  if (digits === 1) return decimal1.format(ratio * 100) + '%';
  return decimal2.format(ratio * 100) + '%';
};

export const points = ratio => decimal2.format(ratio * 100) + ' pts';

export function compact(value) {
  if (value >= 1e6) return decimal2.format(value / 1e6) + ' mi';
  if (value >= 1e3) return int(value / 1e3) + ' mil';
  return int(value);
}

export const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function clockTime(seconds) {
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, Math.floor(seconds) % 60]
    .map(part => String(part).padStart(2, '0')).join(':');
}

/** Share of valid votes held by candidate `index`. */
export const share = (result, index) => result.votes[index] / Math.max(1, result.valid);
export const leaderShare = result => share(result, result.winner);
export const marginShare = result => Math.abs(result.votes[0] - result.votes[1]) / Math.max(1, result.valid);
export const blankShare = result => (result.blank + result.nulls) / Math.max(1, result.cast);
