import { useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { compact, int, marginShare, percent, points, share } from '../lib/format.js';
import { getCandidatesFor } from '../data/candidates.js';
import { outlook } from '../data/outlook.js';

function Contender({ candidate, votes, shareVal, isLeading }) {
  if (!candidate) return null;
  return html`<div class=${'contender tone-' + (candidate.tone || 'other')}>
    ${candidate.photo ? html`<img src=${candidate.photo} alt="" width="44" height="44"/>` :
      html`<div style="width:44px; height:44px; border-radius:50%; background:var(--surface); display:grid; place-items:center; font-weight:700; font-size:1.1rem; border:2px solid ${candidate.color}; color:${candidate.color};">${candidate.party || candidate.name[0]}</div>`}
    <div class="contender-id">
      <strong>${candidate.name}</strong>
      <span><b class="party">${candidate.party ? `${candidate.party} ${candidate.number || ''}` : ''}</b>${isLeading && html`<em class="lead-mark">na frente</em>`}</span>
    </div>
    <div class="contender-score">
      <b>${percent(shareVal)}</b>
      <span>${int(votes)} votos</span>
    </div>
  </div>`;
}

/** Share bar anchored at both ends, showing who is closer to winning outright. */
export function DuelBar({ aShare, bShare, aColor = 'var(--blue)', bColor = 'var(--red)', aName = '', bName = '', marker = false }) {
  const label = `${aName} ${percent(aShare)}, ${bName} ${percent(bShare)}`;
  return html`<div class="duel-bar" role="img" aria-label=${label}>
    <i style=${{ width: (aShare || 0) * 100 + '%', background: aColor }}></i>
    <i style=${{ width: (bShare || 0) * 100 + '%', background: bColor }}></i>
    ${marker && html`<span class="duel-mid"></span>`}
  </div>`;
}

/** One sentence answering "can this still change?" from what is left to count. */
function Outlook({ result, majorityRule, leaderName, isTseLive, tseData }) {
  if (isTseLive && tseData) {
    if (tseData.secoesApuradas === 0) {
      return html`<p class="outlook" aria-live="polite">
        <b style="color: #22c55e;">Conexão Oficial com o TSE ativa.</b> ${int(tseData.secoesTotal)} seções preparadas para apuração.
      </p>`;
    }
  }

  const { remaining, gap, status, runoff } = outlook(result, { majorityRule });
  const leader = leaderName || 'O candidato';
  const verdict = {
    closed: html`<b>Apuração oficial TSE concluída.</b>`,
    decided: html`<b>${leader} matematicamente consolidado.</b>`,
    open: html`<b>Disputa aberta.</b>`,
  }[status] || html`<b>Apuração em andamento.</b>`;
  const second = { certain: 'Ninguém chega a 50%: haverá 2º turno.', outright: `${leader} vence no 1º turno.` }[runoff];
  return html`<p class="outlook" aria-live="polite">${verdict}${second && html` <span class="outlook-runoff">${second}</span>`}</p>`;
}

export function Scoreboard({ office, uf, scope, result, majorityRule, tseData, isTseLive, electionId }) {
  const [showAllCands, setShowAllCands] = useState(false);
  const candidates = getCandidatesFor(office, uf);

  let cand0, cand1, s0, s1, v0, v1, otherCands = [];

  const hasLiveTse = isTseLive && tseData && tseData.candidates && tseData.candidates.length > 0;

  if (hasLiveTse && (office === 'Presidente' || !office) && !uf) {
    const list = tseData.candidates;
    const first = list[0];
    const second = list[1] || list[0];

    cand0 = {
      name: first.name,
      party: first.party,
      number: first.number,
      tone: 'blue',
      color: first.color,
      photo: first.photo
    };
    cand1 = {
      name: second.name,
      party: second.party,
      number: second.number,
      tone: 'red',
      color: second.color,
      photo: second.photo
    };

    s0 = first.share;
    s1 = second.share;
    v0 = first.votes;
    v1 = second.votes;

    otherCands = list.slice(2);
  } else {
    cand0 = candidates[0] || { name: 'Candidato 1', party: '1', tone: 'blue', color: '#4162e2' };
    cand1 = candidates[1] || { name: 'Candidato 2', party: '2', tone: 'red', color: '#ee2d35' };
    s0 = share(result, 0);
    s1 = share(result, 1);
    v0 = result.votes ? result.votes[0] || 0 : 0;
    v1 = result.votes ? result.votes[1] || 0 : 0;
  }

  const isLeading0 = v0 >= v1;
  const leaderName = isLeading0 ? cand0.name : cand1.name;
  const completionVal = (isTseLive && tseData && !uf) ? tseData.completion : result.completion;

  return html`<section class="scoreboard" aria-label=${`${office}: resultado em ${scope}`}>
    <div class="duel">
      <${Contender} candidate=${cand0} votes=${v0} shareVal=${s0} isLeading=${isLeading0}/>
      <${Contender} candidate=${cand1} votes=${v1} shareVal=${s1} isLeading=${!isLeading0}/>
    </div>
    <${DuelBar} aShare=${s0} bShare=${s1} aColor=${cand0.color} bColor=${cand1.color} aName=${cand0.name} bName=${cand1.name} marker=${true}/>
    
    <div class="scoreboard-foot">
      <h2>${office}<span> em ${scope} (${electionId === '6257' ? '1º Turno' : '2º Turno'})</span></h2>
      <${Outlook} result=${result} majorityRule=${majorityRule} leaderName=${leaderName} isTseLive=${isTseLive} tseData=${tseData}/>
      <p class="counting">
        <span>${isTseLive && tseData ? `TSE Oficial (${tseData.generationTime || '2026'})` : `Diferença de ${points(marginShare(result))}`}</span>
        <span><i class="pulse" style=${isTseLive ? { background: '#22c55e' } : {}}></i>${percent(completionVal)} das seções</span>
      </p>
    </div>

    ${otherCands.length > 0 && html`
      <div class="other-candidates" style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column;">
        <button onClick=${() => setShowAllCands(!showAllCands)}
          style="all:unset; cursor:pointer; font-size:0.75rem; font-weight:600; color:#FAFAF9; background:rgba(255,255,255,0.06); padding:4px 12px; border-radius:100px; align-self:flex-start; display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(255,255,255,0.12); transition:all 0.15s ease;">
          <span>${showAllCands ? '▲ Ocultar candidatos' : `▼ Ver todos os 12 candidatos oficiais (${otherCands.length} outros)`}</span>
        </button>
        ${showAllCands && html`
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:6px; margin-top:8px; max-height:220px; overflow-y:auto; padding:4px 0;">
            ${otherCands.map((c, idx) => html`
              <div key=${c.number} style="display:flex; align-items:center; justify-content:space-between; padding:5px 8px; background:rgba(255,255,255,0.03); border-radius:6px; font-size:0.8rem; border:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  <span style="font-weight:700; color:var(--text-subtle); font-size:0.72rem; min-width:18px;">${idx + 3}º</span>
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${c.color}; flex-shrink:0;"></span>
                  <span style="font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title=${c.name}>${c.name}</span>
                  <small style="color:var(--text-subtle); font-size:0.7rem;">(${c.party})</small>
                </div>
                <div style="text-align:right; flex-shrink:0; margin-left:8px;">
                  <b style="font-variant-numeric:tabular-nums; font-size:0.82rem;">${c.percentual}</b>
                  <span style="display:block; font-size:0.65rem; color:var(--text-subtle); font-variant-numeric:tabular-nums;">${int(c.votes)}</span>
                </div>
              </div>
            `)}
          </div>
        `}
      </div>
    `}
  </section>`;
}
