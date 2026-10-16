import { html } from '../lib/html.js';
import { OFFICES } from '../data/mocks.js';
import { Icon } from './Icon.js';

export function TopBar({ office, onOffice, theme, onToggleTheme, onSearch, onDownload, tseMode, onOpenTse, electionId, onElection, onExterior, onOpenDf, uf }) {
  const nextTheme = theme === 'dark' ? 'claro' : 'escuro';
  const isLive = tseMode === 'ao-vivo';

  return html`<header class="topbar">
    <div class="brand">
      <h1>Apuração 2026</h1>
      <button class=${'sim-chip' + (isLive ? ' is-live' : '')} onClick=${onOpenTse}
        style=${{
          cursor: 'pointer',
          background: isLive ? 'rgba(34, 197, 94, 0.2)' : undefined,
          color: isLive ? '#22c55e' : undefined,
          border: isLive ? '1px solid rgba(34, 197, 94, 0.4)' : undefined,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}
        title="Clique para configurar a conexão com o TSE ao vivo">
        ${isLive ? html`<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22c55e; animation:pulse 1.5s infinite;"></span> TSE Ao Vivo` : '⚙️ Simulação (Configurar TSE)'}
      </button>

      <div class="turn-switch" style="display:inline-flex; align-items:center; background:rgba(255,255,255,0.06); border-radius:20px; padding:2px; border:1px solid rgba(255,255,255,0.1); margin-left:12px;">
        <button style=${{
          all: 'unset',
          cursor: 'pointer',
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: electionId === '6257' ? '#fff' : 'rgba(255,255,255,0.45)',
          background: electionId === '6257' ? 'rgba(255,255,255,0.18)' : 'transparent',
          boxShadow: electionId === '6257' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.15s ease'
        }} onClick=${() => onElection && onElection('6257')} title="1º Turno Oficial TSE (Eleição 6257 - 12 Candidatos)">
          1º Turno (6257)
        </button>
        <button style=${{
          all: 'unset',
          cursor: 'pointer',
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: electionId === '6258' ? '#fff' : 'rgba(255,255,255,0.45)',
          background: electionId === '6258' ? 'rgba(255,255,255,0.18)' : 'transparent',
          boxShadow: electionId === '6258' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.15s ease'
        }} onClick=${() => onElection && onElection('6258')} title="2º Turno Oficial TSE (Eleição 6258 - Duelo Final)">
          2º Turno (6258)
        </button>
      </div>
    </div>

    <nav class="office-tabs" aria-label="Cargo">
      ${OFFICES.map(name => {
        const label = (uf === 'DF' && name === 'Deputado Estadual') ? 'Deputado Distrital' : name;
        return html`<button key=${name} class="office-tab" aria-pressed=${name === office}
          onClick=${() => onOffice(name)}>${label}</button>`;
      })}
    </nav>

    <div class="topbar-actions">
      <button class="icon-button df-pill" onClick=${onOpenDf}
        style=${{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          height: '32px',
          padding: '0 10px',
          borderRadius: '100px',
          background: 'rgba(33, 150, 243, 0.15)',
          border: '1px solid rgba(33, 150, 243, 0.35)',
          color: '#60a5fa',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginRight: '4px'
        }}
        title="Ver todas as 35 RAs do DF e votação detalhada por seção eleitoral">
        <span>🏛️</span><span>DF: 35 RAs & Seções</span>
      </button>
      <button class="icon-button exterior-pill" onClick=${onExterior}
        style=${{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          height: '32px',
          padding: '0 10px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          color: '#FAFAF9',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginRight: '4px'
        }}
        title="Ver apuração no Exterior (Zona ZZ)">
        <span>🌐</span><span>Exterior</span>
      </button>

      <button class="search-trigger" onClick=${onSearch} aria-label="Buscar estado ou município" aria-keyshortcuts="/">
        <${Icon} name="search" size=${16}/><span>Buscar um lugar</span><kbd>/</kbd>
      </button>
      <button class="icon-button" onClick=${onToggleTheme} aria-label=${`Mudar para o tema ${nextTheme}`} title=${`Tema ${nextTheme}`}>
        <${Icon} name=${theme === 'dark' ? 'sun' : 'moon'}/>
      </button>
      <button class="icon-button" onClick=${onDownload} aria-label="Salvar mapa como imagem" title="Salvar mapa como imagem">
        <${Icon} name="download"/>
      </button>
    </div>
  </header>`;
}
