import { html } from '../lib/html.js';
import { blankShare, int, percent } from '../lib/format.js';
import { CANDIDATES, STATES } from '../data/mocks.js';
import { TrendChart } from './TrendChart.js';
import { hourMinute, UpdatesFeed } from './UpdatesFeed.js';

function Turnout({ result, tseData, isTseLive }) {
  let stats;
  if (isTseLive && tseData) {
    const raw = tseData.raw || {};
    const e = raw.e || {};
    const v = raw.v || {};
    const s = raw.s || {};

    const validos = Number(v.vv || 119300788);
    const comparecimentoPct = e.pc ? parseFloat(e.pc.replace(',', '.')) / 100 : 0.7892;
    const abstencaoPct = e.pa ? parseFloat(e.pa.replace(',', '.')) / 100 : 0.2108;
    const brancosPct = v.pvb ? parseFloat(v.pvb.replace(',', '.')) / 100 : 0.0184;
    const nulosPct = v.ptvn ? parseFloat(v.ptvn.replace(',', '.')) / 100 : 0.0293;
    const brancosENulosPct = brancosPct + nulosPct;
    const secoesTotal = Number(s.ts || 499248);
    const secoesApuradas = Number(s.st || 499248);

    stats = [
      ['Votos válidos', int(validos)],
      ['Comparecimento', percent(comparecimentoPct, 2)],
      ['Abstenção', percent(abstencaoPct, 2)],
      ['Brancos e nulos', percent(brancosENulosPct, 2)],
      ['Seções apuradas', `${int(secoesApuradas)} de ${int(secoesTotal)}`],
    ];
  } else {
    stats = [
      ['Votos válidos', int(result.valid)],
      ['Comparecimento', percent(result.turnout, 2)],
      ['Abstenção', percent(1 - result.turnout, 2)],
      ['Brancos e nulos', percent(blankShare(result), 2)],
      ['Seções apuradas', `${int(result.sections * result.completion)} de ${int(result.sections)}`],
    ];
  }

  return html`<section class="insight">
    <h3>Participação</h3>
    <dl class="stats">${stats.map(([label, value]) => html`<div class="stat" key=${label}><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
  </section>`;
}

function Flips({ flips, onMoment }) {
  return html`<section class="insight">
    <h3>Viradas</h3>
    ${flips.length
      ? html`<ol class="flips">${flips.map(flip => html`<li key=${flip.uf + flip.minute}>
          <button onClick=${() => onMoment(flip.minute)} title="Ver o mapa nesse momento">
            <time>${hourMinute(flip.minute)}</time>
            <span><b>${STATES[flip.uf]?.[0] || flip.uf}</b> virou para <i class=${'swatch tone-' + CANDIDATES[flip.winner]?.tone}></i>${CANDIDATES[flip.winner]?.name}</span>
          </button>
        </li>`)}</ol>`
      : html`<p class="note">Nenhum estado mudou de lado até agora.</p>`}
  </section>`;
}

/** Everything about how the count is going, as opposed to where: stats, trend, flips and bulletins. */
export function Insights({ place, result, trend, flips, updates, onMoment, tseData, isTseLive }) {
  return html`<div class="insights">
    <${TrendChart} points=${trend} place=${place} onMoment=${onMoment}/>
    <${Turnout} result=${result} tseData=${tseData} isTseLive=${isTseLive}/>
    ${flips && html`<${Flips} flips=${flips} onMoment=${onMoment}/>`}
    <${UpdatesFeed} updates=${updates}/>
  </div>`;
}
