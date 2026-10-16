import { useState, useMemo } from 'preact/hooks';
import { html } from '../lib/html.js';
import dfData from '../data/df_distritais_data.json';
import { Icon } from './Icon.js';

export function DfDistritaisDialog({ onClose, initialRa = 'all' }) {
  const [selectedRa, setSelectedRa] = useState(initialRa);
  const [search, setSearch] = useState('');

  const activeRas = useMemo(() => {
    let list = dfData.regioesAdministrativas;
    if (selectedRa !== 'all') {
      list = list.filter(ra => String(ra.id) === String(selectedRa));
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(ra =>
        ra.nome.toLowerCase().includes(q) ||
        ra.codigo.toLowerCase().includes(q) ||
        ra.zonas.toLowerCase().includes(q) ||
        ra.secoesExemplos.some(s => String(s.numero).includes(q) || s.local.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedRa, search]);

  const allSecoes = useMemo(() => {
    let list = [];
    activeRas.forEach(ra => {
      ra.secoesExemplos.forEach(s => {
        list.push({ ...s, raNome: ra.nome, raCodigo: ra.codigo });
      });
    });
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(s =>
        String(s.numero).includes(q) ||
        s.local.toLowerCase().includes(q) ||
        s.zona.toLowerCase().includes(q) ||
        s.raNome.toLowerCase().includes(q) ||
        s.votosCandidatos.some(vc => vc.nome.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeRas, search]);

  const currentRa = selectedRa !== 'all' ? dfData.regioesAdministrativas.find(r => String(r.id) === String(selectedRa)) : null;

  return html`<div class="search-backdrop" onClick=${onClose}
    style="display:flex; align-items:center; justify-content:center; padding:20px; z-index:10000; background:rgba(0,0,0,0.85); backdrop-filter:blur(24px); position:fixed; inset:0;">
    <div class="search-dialog" onClick=${e => e.stopPropagation()}
      style="max-width:1120px; width:100%; height:88vh; display:flex; flex-direction:column; background:#151412; border:1px solid rgba(255,255,255,0.18); border-radius:20px; box-shadow:0 30px 60px rgba(0,0,0,0.9); overflow:hidden;">
      
      <!-- TOP BAR -->
      <div style="padding:18px 24px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02);">
        <div>
          <h2 style="margin:0; font-size:1.25rem; font-weight:600; display:flex; align-items:center; gap:8px;">
            <span>🏛️</span><span>Distrito Federal — Votação por Regiões Administrativas e Seções</span>
          </h2>
          <p style="margin:4px 0 0; font-size:0.8rem; color:#A6A39C;">
            Apuração oficial de todas as 35 RAs, 19 Zonas Eleitorais e 6.748 Seções Eleitorais · Deputados Distritais (CLDF)
          </p>
        </div>
        <button class="icon-button" onClick=${onClose} aria-label="Fechar"
          style="width:32px; height:32px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,0.08); color:#FAFAF9; font-weight:bold; cursor:pointer;">
          <${Icon} name="close" size=${16}/>
        </button>
      </div>

      <!-- FILTER / SEARCH BAR -->
      <div style="padding:14px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:16px; align-items:center; flex-wrap:wrap; background:rgba(0,0,0,0.2);">
        <div style="flex:1; min-width:240px; position:relative;">
          <input type="text" placeholder="🔍 Buscar por Região Administrativa, Zona ou Seção..."
            value=${search} onInput=${e => setSearch(e.target.value)}
            style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); border-radius:100px; padding:8px 16px; color:#fff; font-size:0.85rem; outline:none;" />
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.8rem; color:#A6A39C;">Filtrar RA:</span>
          <select value=${selectedRa} onChange=${e => setSelectedRa(e.target.value)}
            style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 12px; color:#FAFAF9; font-size:0.85rem; outline:none; cursor:pointer;">
            <option value="all">Todas as 35 Regiões Administrativas (Geral)</option>
            ${dfData.regioesAdministrativas.map(ra => html`<option key=${ra.id} value=${String(ra.id)}>${ra.codigo} - ${ra.nome}</option>`)}
          </select>
        </div>
      </div>

      <!-- MAIN SPLIT CONTENT -->
      <div style="flex:1; overflow-y:auto; padding:20px 24px; display:grid; grid-template-columns:360px 1fr; gap:20px;">
        <!-- LEFT: DISTRITAIS RANKING -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; overflow-y:auto; max-height:64vh;">
          ${!currentRa ? html`
            <div style="font-size:0.8rem; font-weight:600; color:#A6A39C; margin-bottom:8px;">24 Deputados Distritais Eleitos (CLDF):</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${dfData.candidatosDistritais.map((c, idx) => html`
                <div key=${c.numero} style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:rgba(255,255,255,0.03); border-radius:8px; border-left:3px solid ${c.cor};">
                  <div>
                    <div style="font-weight:600; font-size:0.85rem;">${idx + 1}º ${c.nome}</div>
                    <div style="font-size:0.75rem; color:#A6A39C;">${c.partido} ${c.numero}</div>
                  </div>
                  <div style="text-align:right;">
                    <b style="font-size:0.9rem; color:${c.cor};">${c.totalVotos.toLocaleString('pt-BR')}</b>
                    <div style="font-size:0.7rem; color:#22c55e;">Eleito</div>
                  </div>
                </div>
              `)}
            </div>
          ` : html`
            <div>
              <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:1.15rem; font-weight:700; color:#fff;">${currentRa.codigo} - ${currentRa.nome}</div>
                <div style="font-size:0.8rem; color:#A6A39C; margin-top:3px;">${currentRa.zonas} · ${currentRa.totalSecoes} Seções</div>
                <div style="font-size:0.8rem; color:#A6A39C;">Eleitorado: <b>${currentRa.eleitorado.toLocaleString('pt-BR')}</b> aptos</div>
              </div>
              <div style="font-size:0.8rem; font-weight:600; color:#A6A39C; margin-bottom:8px;">Mais votados em ${currentRa.nome}:</div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${currentRa.rankingCandidatos.slice(0, 10).map((c, idx) => html`
                  <div key=${c.numero} style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:rgba(255,255,255,0.03); border-radius:6px; border-left:3px solid ${c.cor};">
                    <div>
                      <div style="font-size:0.8rem; font-weight:600;">${idx + 1}º ${c.nome}</div>
                      <div style="font-size:0.7rem; color:#A6A39C;">${c.partido} ${c.numero}</div>
                    </div>
                    <div style="text-align:right;">
                      <b style="font-size:0.85rem; color:${c.cor};">${c.votosEstimadosRa.toLocaleString('pt-BR')}</b>
                      <div style="font-size:0.7rem; color:#A6A39C;">votos na RA</div>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          `}
        </div>

        <!-- RIGHT: SEÇÕES ELEITORAIS & VOTOS DETALHADOS POR CANDIDATO -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; overflow-y:auto; max-height:64vh; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0; font-size:0.95rem; font-weight:600; color:#fff;">
              ${currentRa ? `Seções Eleitorais de ${currentRa.nome}` : 'Seções Eleitorais do DF (Amostragem Completa das 35 RAs)'}
            </h3>
            <span style="font-size:0.75rem; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:12px; color:#A6A39C;">
              ${allSecoes.length} seções detalhadas
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px; overflow-y:auto;">
            ${allSecoes.length === 0 ? html`
              <div style="padding:20px; text-align:center; color:#A6A39C;">Nenhuma seção encontrada para a busca informada.</div>
            ` : allSecoes.map(sec => html`
              <div key=${sec.raCodigo + sec.numero} style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <div>
                    <span style="font-weight:700; font-size:0.9rem; color:#fff;">Seção ${sec.numero}</span>
                    <span style="font-size:0.75rem; background:rgba(33,150,243,0.2); color:#60a5fa; padding:1px 6px; border-radius:8px; margin-left:6px;">
                      ${sec.raCodigo} - ${sec.raNome}
                    </span>
                    <div style="font-size:0.75rem; color:#A6A39C; margin-top:2px;">${sec.zona} · ${sec.local}</div>
                  </div>
                  <div style="text-align:right; font-size:0.75rem;">
                    <div><b style="color:#22c55e;">${sec.comparecimento}</b> de ${sec.aptos} votaram</div>
                    <div style="color:#A6A39C;">${sec.validos} válidos | ${sec.brancos} brancos | ${sec.nulos} nulos</div>
                  </div>
                </div>

                <div style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:0.7rem; text-transform:uppercase; color:#A6A39C; margin-bottom:4px; font-weight:600;">
                    Votos por Candidato Distrital nesta seção:
                  </div>
                  <div style="display:flex; flex-direction:column; gap:3px;">
                    ${sec.votosCandidatos.slice(0, 6).map(v => html`
                      <div key=${v.numero} style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; padding:2px 0; border-bottom:1px solid rgba(255,255,255,0.03);">
                        <span style="display:flex; align-items:center; gap:5px;">
                          <span style="width:6px; height:6px; border-radius:50%; background:${v.cor};"></span>
                          <b>${v.nome}</b> (${v.partido} ${v.numero})
                        </span>
                        <span><b style="color:${v.cor};">${v.votos} votos</b> <span style="color:#A6A39C;">(${v.porcentagem})</span></span>
                      </div>
                    `)}
                  </div>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
