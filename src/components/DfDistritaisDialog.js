import { useState, useMemo } from 'preact/hooks';
import { html } from '../lib/html.js';
import dfData from '../data/df_distritais_data.json';
import { Icon } from './Icon.js';

export function DfDistritaisDialog({ onClose, initialRa = 'all' }) {
  const [selectedRa, setSelectedRa] = useState(initialRa);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('marcela'); // Abre por padrão no Dossiê Marcela Passamani!

  const d = dfData.marcelaPassamaniDossie;

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
        ra.secoesExemplos.some(s => String(s.numero).includes(q) || s.local.toLowerCase().includes(q) || s.votosCandidatos.some(vc => vc.nome.toLowerCase().includes(q) || String(vc.numero).includes(q)))
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
    if (q && !q.includes('marcela') && !q.includes('15555')) {
      list = list.filter(s =>
        String(s.numero).includes(q) ||
        s.local.toLowerCase().includes(q) ||
        s.zona.toLowerCase().includes(q) ||
        s.raNome.toLowerCase().includes(q) ||
        s.votosCandidatos.some(vc => vc.nome.toLowerCase().includes(q) || String(vc.numero).includes(q))
      );
    }
    return list;
  }, [activeRas, search]);

  const currentRa = selectedRa !== 'all' ? dfData.regioesAdministrativas.find(r => String(r.id) === String(selectedRa)) : null;

  return html`<div class="search-backdrop" onClick=${onClose}
    style="display:flex; align-items:center; justify-content:center; padding:16px; z-index:10000; background:rgba(0,0,0,0.85); backdrop-filter:blur(24px); position:fixed; inset:0;">
    <div class="search-dialog" onClick=${e => e.stopPropagation()}
      style="max-width:1160px; width:100%; height:90vh; display:flex; flex-direction:column; background:#151412; border:1px solid rgba(255,255,255,0.18); border-radius:20px; box-shadow:0 30px 70px rgba(0,0,0,0.95); overflow:hidden;">
      
      <!-- TOP BAR -->
      <div style="padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02);">
        <div>
          <div style="display:flex; align-items:center; gap:10px;">
            <h2 style="margin:0; font-size:1.25rem; font-weight:700; display:flex; align-items:center; gap:8px;">
              <span>🏛️</span><span>Distrito Federal — Apuração Oficial por Regiões Administrativas e Seções</span>
            </h2>
            <span style="font-size:0.75rem; background:#22c55e22; color:#22c55e; border:1px solid #22c55e44; padding:2px 8px; border-radius:100px; font-weight:600;">100,00% Apurado</span>
          </div>
          <p style="margin:4px 0 0; font-size:0.8rem; color:#A6A39C;">
            Dados Oficiais TRE-DF / TSE (Eleição 6259) · 35 RAs · 19 Zonas Eleitorais · 6.969 Seções Eleitorais
          </p>
        </div>
        <button class="icon-button" onClick=${onClose} aria-label="Fechar"
          style="width:32px; height:32px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,0.08); color:#FAFAF9; font-weight:bold; cursor:pointer;">
          <${Icon} name="close" size=${16}/>
        </button>
      </div>

      <!-- TABS -->
      <div style="padding:10px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:10px; align-items:center; background:rgba(0,0,0,0.3);">
        <button onClick=${() => setTab('marcela')}
          style="all:unset; cursor:pointer; padding:6px 16px; border-radius:100px; font-weight:700; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; transition:all .15s; ${tab === 'marcela' ? 'background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff;' : 'background:transparent; color:#f59e0b; border:1px solid rgba(245,158,11,0.5);'}">
          ⭐ Dossiê Eleitoral: Marcela Passamani (15555 · MDB)
        </button>
        <button onClick=${() => setTab('geral')}
          style="all:unset; cursor:pointer; padding:6px 14px; border-radius:100px; font-weight:600; font-size:0.85rem; transition:all .15s; ${tab === 'geral' ? 'background:rgba(255,255,255,0.15); color:#fff;' : 'background:transparent; color:rgba(255,255,255,0.6);'}">
          📊 Quadro Geral das 35 RAs (Todos os Distritais)
        </button>
      </div>

      <!-- FILTER / SEARCH BAR -->
      <div style="padding:12px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:14px; align-items:center; flex-wrap:wrap; background:rgba(0,0,0,0.2);">
        <div style="flex:1; min-width:260px; position:relative;">
          <input type="text" placeholder="🔍 Buscar por Candidato (ex: Marcela, 15555), RA, Zona ou Seção..."
            value=${search} onInput=${e => {
              const val = e.target.value;
              setSearch(val);
              if (val.toLowerCase().includes('marcela') || val.includes('15555')) {
                setTab('marcela');
              }
            }}
            style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.14); border-radius:100px; padding:8px 16px; color:#fff; font-size:0.85rem; outline:none;" />
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.8rem; color:#A6A39C;">Região Administrativa:</span>
          <select value=${selectedRa} onChange=${e => setSelectedRa(e.target.value)}
            style="background:#22201D; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 12px; color:#FAFAF9; font-size:0.85rem; outline:none; cursor:pointer;">
            <option value="all">Todas as 35 Regiões Administrativas (DF Completo)</option>
            ${dfData.regioesAdministrativas.map(ra => html`<option key=${ra.id} value=${String(ra.id)}>${ra.codigo} - ${ra.nome} (${ra.votosMarcelaPassamani ? ra.votosMarcelaPassamani.toLocaleString('pt-BR') + ' votos Marcela' : ''})</option>`)}
          </select>
        </div>
      </div>

      <!-- MAIN SPLIT CONTENT -->
      <div style="flex:1; overflow-y:auto; padding:18px 24px; display:grid; grid-template-columns:390px 1fr; gap:20px;">
        <!-- LEFT: DOSSIÊ OU QUADRO GERAL -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; overflow-y:auto; max-height:64vh;">
          ${tab === 'marcela' ? html`
            <div>
              <!-- PERFIL MARCELA -->
              <div style="background:linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.05)); border:1px solid rgba(245,158,11,0.4); border-radius:12px; padding:14px; margin-bottom:16px;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
                  <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); display:grid; place-items:center; font-weight:700; font-size:1.1rem; color:#fff; box-shadow:0 0 12px rgba(245,158,11,0.5);">
                    MP
                  </div>
                  <div>
                    <div style="font-size:1.15rem; font-weight:700; color:#fff;">Marcela Passamani</div>
                    <div style="font-size:0.8rem; color:#f59e0b; font-weight:600;">MDB · Número 15555 · Suplente CLDF</div>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.08);">
                  <div>
                    <div style="font-size:0.7rem; color:#A6A39C;">Total Geral no DF:</div>
                    <b style="font-size:1.15rem; color:#22c55e;">16.622 votos</b>
                  </div>
                  <div>
                    <div style="font-size:0.7rem; color:#A6A39C;">Apuração TRE-DF:</div>
                    <b style="font-size:1rem; color:#fff;">100,00%</b>
                  </div>
                </div>
              </div>

              <!-- DESEMPENHO NAS 35 RAs -->
              <div style="margin-bottom:14px;">
                <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:8px; display:flex; justify-content:space-between;">
                  <span>Votação em Todas as 35 RAs:</span>
                  <span style="color:#f59e0b; font-size:0.75rem;">Clique para filtrar</span>
                </div>
                <div style="max-height:30vh; overflow-y:auto; padding-right:4px;">
                  ${d.votosPorRa.map((r, idx) => html`
                    <div key=${r.id} onClick=${() => setSelectedRa(String(r.id))}
                      style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:rgba(255,255,255,0.02); border-radius:8px; margin-bottom:4px; border-left:3px solid #f59e0b;">
                      <div>
                        <div style="font-weight:600; font-size:0.8rem; color:#fff;">${idx + 1}º ${r.codigo} - ${r.nome}</div>
                        <div style="font-size:0.7rem; color:#A6A39C;">${r.zonas} · ${r.secoes} seções</div>
                      </div>
                      <div style="text-align:right;">
                        <b style="font-size:0.85rem; color:#f59e0b;">${r.votosMarcela.toLocaleString('pt-BR')} votos</b>
                        <div style="font-size:0.7rem; color:#22c55e;">${r.percentualRa}</div>
                      </div>
                    </div>
                  `)}
                </div>
              </div>

              <!-- VOTAÇÃO NAS 19 ZONAS -->
              <div>
                <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:8px;">
                  Votação Oficial nas 19 Zonas Eleitorais (TRE-DF):
                </div>
                <div style="max-height:22vh; overflow-y:auto; padding-right:4px; background:rgba(0,0,0,0.25); border-radius:8px; padding:6px;">
                  ${d.votosPorZona.map(z => html`
                    <div key=${z.zona} style="display:flex; justify-content:space-between; align-items:center; padding:5px 8px; font-size:0.75rem; border-bottom:1px solid rgba(255,255,255,0.04);">
                      <span style="color:#D6D4CF;">Zona ${z.zona} (${z.nome})</span>
                      <span><b style="color:#f59e0b;">${z.votos.toLocaleString('pt-BR')}</b> <span style="color:#A6A39C;">(${z.percentual})</span></span>
                    </div>
                  `)}
                </div>
              </div>
            </div>
          ` : (!currentRa ? html`
            <div style="font-size:0.8rem; font-weight:600; color:#A6A39C; margin-bottom:8px;">24 Deputados Distritais Eleitos (CLDF):</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${dfData.candidatosDistritais.slice(0, 28).map((c, idx) => html`
                <div key=${c.numero} style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:${c.numero === '15555' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)'}; border-radius:8px; border-left:3px solid ${c.cor};">
                  <div>
                    <div style="font-weight:600; font-size:0.85rem; color:${c.numero === '15555' ? '#f59e0b' : '#fff'};">${idx + 1}º ${c.nome} ${c.numero === '15555' ? '⭐' : ''}</div>
                    <div style="font-size:0.75rem; color:#A6A39C;">${c.partido} ${c.numero}</div>
                  </div>
                  <div style="text-align:right;">
                    <b style="font-size:0.9rem; color:${c.cor};">${c.totalVotos.toLocaleString('pt-BR')}</b>
                    <div style="font-size:0.7rem; color:${c.eleito ? '#22c55e' : '#f59e0b'};">${c.eleito ? 'Eleito' : c.situacao}</div>
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
                <div style="margin-top:8px; padding:6px 8px; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); border-radius:6px; font-size:0.75rem; color:#f59e0b;">
                  ⭐ <b>Marcela Passamani (15555):</b> ${currentRa.votosMarcelaPassamani ? currentRa.votosMarcelaPassamani.toLocaleString('pt-BR') : 0} votos nesta RA
                </div>
              </div>
              <div style="font-size:0.8rem; font-weight:600; color:#A6A39C; margin-bottom:8px;">Mais votados em ${currentRa.nome}:</div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${currentRa.rankingCandidatos.slice(0, 10).map((c, idx) => html`
                  <div key=${c.numero} style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:${c.numero === '15555' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)'}; border-radius:6px; border-left:3px solid ${c.cor};">
                    <div>
                      <div style="font-size:0.8rem; font-weight:600; color:${c.numero === '15555' ? '#f59e0b' : '#fff'};">${idx + 1}º ${c.nome} ${c.numero === '15555' ? '⭐' : ''}</div>
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
          `)}
        </div>

        <!-- RIGHT: SEÇÕES ELEITORAIS & VOTOS DETALHADOS -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; overflow-y:auto; max-height:64vh; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0; font-size:0.95rem; font-weight:600; color:#fff;">
              ${tab === 'marcela' ? (selectedRa === 'all' ? 'Votação de Marcela Passamani por Seção Eleitoral no DF' : `Votos de Marcela Passamani nas Seções de ${currentRa?.nome || ''}`) : (selectedRa === 'all' ? 'Seções Eleitorais do DF (Amostragem Completa das 35 RAs)' : `Seções Eleitorais de ${currentRa?.nome || ''}`)}
            </h3>
            <span style="font-size:0.75rem; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:12px; color:#A6A39C;">
              ${allSecoes.length} seções detalhadas
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; overflow-y:auto;">
            ${allSecoes.length === 0 ? html`
              <div style="padding:20px; text-align:center; color:#A6A39C;">Nenhuma seção encontrada para o filtro informado.</div>
            ` : allSecoes.map(sec => html`
              <div key=${sec.raCodigo + sec.numero} style="background:rgba(255,255,255,0.03); border:1px solid ${tab === 'marcela' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}; border-radius:10px; padding:12px;">
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

                <!-- DESTAQUE EXCLUSIVO SEÇÃO MARCELA -->
                <div style="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.25); border-radius:6px; padding:6px 10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
                  <span style="color:#f59e0b; font-weight:700; display:flex; align-items:center; gap:5px;">
                    <span>⭐</span> Marcela Passamani (15555 - MDB):
                  </span>
                  <span style="font-weight:700; color:#fff;">
                    ${sec.votosMarcela || 0} votos na urna
                  </span>
                </div>

                <div style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:0.7rem; text-transform:uppercase; color:#A6A39C; margin-bottom:4px; font-weight:600;">
                    Demais candidatos distritais nesta seção:
                  </div>
                  <div style="display:flex; flex-direction:column; gap:3px;">
                    ${sec.votosCandidatos.slice(0, 6).map(v => html`
                      <div key=${v.numero} style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; padding:3px 6px; border-radius:4px; background:${v.numero === '15555' ? 'rgba(245,158,11,0.15)' : 'transparent'}; border-bottom:1px solid rgba(255,255,255,0.03);">
                        <span style="display:flex; align-items:center; gap:5px;">
                          <span style="width:6px; height:6px; border-radius:50%; background:${v.cor};"></span>
                          <b style="color:${v.numero === '15555' ? '#f59e0b' : '#fff'};">${v.nome} ${v.numero === '15555' ? '⭐' : ''}</b> (${v.partido} ${v.numero})
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
