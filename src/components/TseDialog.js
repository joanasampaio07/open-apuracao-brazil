import { useState, useEffect } from 'preact/hooks';
import { html } from '../lib/html.js';
import { tse } from '../data/tseConnector.js';
import { Icon } from './Icon.js';

export function TseDialog({ onClose }) {
  const [mode, setMode] = useState(tse.getMode());
  const [url, setUrl] = useState(tse.getUrl());
  const [status, setStatus] = useState({
    lastFetch: tse.lastFetch,
    error: tse.error,
    isPolling: tse.isPolling
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    return tse.subscribe(s => {
      setStatus({
        lastFetch: s.lastFetch,
        error: s.error,
        isPolling: s.isPolling
      });
    });
  }, []);

  const handleSave = () => {
    tse.setUrl(url);
    tse.setMode(mode);
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      tse.setUrl(url);
      const res = await tse.fetchLiveData();
      if (res) {
        setTestResult({ success: true, message: `Conexão bem sucedida! ${res.candidates ? res.candidates.length + ' candidatos carregados.' : 'Dados recebidos.'}` });
      } else {
        setTestResult({ success: false, message: tse.error || 'Não foi possível ler os dados da URL.' });
      }
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  return html`<div class="search-backdrop" onClick=${onClose}>
    <div class="search-dialog tse-dialog" role="dialog" aria-modal="true" aria-label="Configuração do TSE" onClick=${e => e.stopPropagation()}>
      <header class="search-head">
        <${Icon} name="refresh" size=${20}/>
        <h2 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Conexão Oficial com o TSE</h2>
        <button class="icon-button" onClick=${onClose} aria-label="Fechar" style="margin-left: auto;">✕</button>
      </header>

      <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8;">Fonte de Dados</label>
          <div style="display: flex; gap: 8px;">
            <button class=${'button' + (mode === 'sim' ? ' is-active' : '')}
              style=${{ flex: 1, padding: '10px', borderRadius: '6px', border: mode === 'sim' ? '2px solid var(--blue)' : '1px solid var(--line)', background: mode === 'sim' ? 'rgba(65, 98, 226, 0.15)' : 'var(--surface)', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}
              onClick=${() => setMode('sim')}>
              Demonstrativo / Simulado
            </button>
            <button class=${'button' + (mode === 'ao-vivo' ? ' is-active' : '')}
              style=${{ flex: 1, padding: '10px', borderRadius: '6px', border: mode === 'ao-vivo' ? '2px solid #22c55e' : '1px solid var(--line)', background: mode === 'ao-vivo' ? 'rgba(34, 197, 94, 0.15)' : 'var(--surface)', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}
              onClick=${() => setMode('ao-vivo')}>
              🔴 Ao Vivo (TSE Oficial)
            </button>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8;">URL do Feed Oficial do TSE</label>
          <input type="text" value=${url} onInput=${e => setUrl(e.target.value)}
            placeholder="Ex: https://resultados.tse.jus.br/oficial/ele2026/..."
            style="width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); color: inherit; font-size: 0.85rem; font-family: monospace;" />
          <p style="margin: 6px 0 0; font-size: 0.75rem; opacity: 0.7;">
            Cole aqui a URL que você extrair do portal do TSE. O sistema fará requisições periódicas a cada 15 segundos para atualizar os votos ao vivo.
          </p>
        </div>

        <div style="background: var(--surface); padding: 12px; border-radius: 8px; border: 1px solid var(--line); font-size: 0.8rem; display: flex; flex-direction: column; gap: 4px;">
          <div><strong>Status da Conexão:</strong> ${status.isPolling ? '🟢 Conectado e atualizando' : mode === 'ao-vivo' ? '🟡 Aguardando requisição' : '⚪ Modo Simulado ativo'}</div>
          ${status.lastFetch && html`<div><strong>Última atualização:</strong> ${status.lastFetch.toLocaleTimeString()}</div>`}
          ${status.error && html`<div style="color: #ef4444;"><strong>Aviso / Erro:</strong> ${status.error}</div>`}
          ${testResult && html`<div style=${{ color: testResult.success ? '#22c55e' : '#ef4444', marginTop: '4px', fontWeight: 600 }}>${testResult.message}</div>`}
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
          <button type="button" onClick=${handleTest} disabled=${testing}
            style="padding: 8px 16px; border-radius: 6px; border: 1px solid var(--line); background: var(--surface); color: inherit; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
            ${testing ? 'Testando...' : 'Testar Conexão Agora'}
          </button>
          <button type="button" onClick=${handleSave}
            style="padding: 8px 18px; border-radius: 6px; border: none; background: var(--blue); color: #fff; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
            Salvar e Aplicar
          </button>
        </div>
      </div>
    </div>
  </div>`;
}
