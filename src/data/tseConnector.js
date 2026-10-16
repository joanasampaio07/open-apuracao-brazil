/**
 * Conector Oficial do TSE (Tribunal Superior Eleitoral)
 * Decodifica nativamente o formato oficial JWS (JSON Web Signature) do TSE.
 * Suporta o 1º Turno (6257) e 2º Turno (6258) com todos os candidatos oficiais.
 */

import rawCandidates from './candidatos.json';

const CANDIDATE_META = {
  "22": { name: "Flávio Bolsonaro", party: "PL", color: "#4162e2", photo: "/images/flavio.webp" },
  "13": { name: "Lula", party: "PT", color: "#ee2d35", photo: "/images/lula.webp" },
  "70": { name: "Augusto Cury", party: "AVANTE", color: "#ff5722", photo: null },
  "14": { name: "Renan Santos", party: "MISSÃO", color: "#e65100", photo: null },
  "55": { name: "Ronaldo Caiado", party: "PSD", color: "#e91e63", photo: null },
  "30": { name: "Romeu Zema", party: "NOVO", color: "#ff6f00", photo: null },
  "80": { name: "Samara Martins", party: "UP", color: "#d81b60", photo: null },
  "16": { name: "Hertz Dias", party: "PSTU", color: "#b71c1c", photo: null },
  "27": { name: "Clariana Barão", party: "DC", color: "#303f9f", photo: null },
  "21": { name: "Edmilson Costa", party: "PCB", color: "#c2185b", photo: null },
  "35": { name: "Wilson Grassi", party: "DEMOCRATA", color: "#009688", photo: null },
  "29": { name: "Rui Costa Pimenta", party: "PCO", color: "#c62828", photo: null }
};

function decodeBase64Url(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

class TseConnector {
  constructor() {
    this.mode = localStorage.getItem('apuracao:tse_mode') || 'ao-vivo';
    this.electionId = localStorage.getItem('apuracao:tse_election') || '6257'; // 1º Turno por padrão (completo)
    this.tseUrl = this.buildUrl(this.electionId);
    this.listeners = new Set();
    this.intervalId = null;
    this.lastFetch = null;
    this.lastData = null;
    this.error = null;
    this.isPolling = false;

    if (this.mode === 'ao-vivo') {
      this.startPolling(15000);
    }
  }

  buildUrl(electionId) {
    return `https://resultados.tse.jus.br/oficial/ele2026/${electionId}/dados/br/br-c0001-e00${electionId}-u.jws`;
  }

  getMode() {
    return this.mode;
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem('apuracao:tse_mode', mode);
    this.notify();
    if (mode === 'ao-vivo') {
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  getElectionId() {
    return this.electionId;
  }

  setElectionId(id) {
    this.electionId = String(id);
    this.tseUrl = this.buildUrl(this.electionId);
    localStorage.setItem('apuracao:tse_election', this.electionId);
    localStorage.setItem('apuracao:tse_url', this.tseUrl);
    this.notify();
    if (this.mode === 'ao-vivo') {
      this.fetchLiveData();
    }
  }

  getUrl() {
    return this.tseUrl;
  }

  setUrl(url) {
    this.tseUrl = url.trim();
    localStorage.setItem('apuracao:tse_url', this.tseUrl);
    this.notify();
    if (this.mode === 'ao-vivo') {
      this.fetchLiveData();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener({
          mode: this.mode,
          electionId: this.electionId,
          url: this.tseUrl,
          lastFetch: this.lastFetch,
          lastData: this.lastData,
          error: this.error,
          isPolling: this.isPolling
        });
      } catch (err) {
        console.error('[TSE Connector] Erro no listener:', err);
      }
    }
  }

  startPolling(intervalMs = 15000) {
    if (this.intervalId) clearInterval(this.intervalId);
    this.isPolling = true;
    this.fetchLiveData();
    this.intervalId = setInterval(() => this.fetchLiveData(), intervalMs);
    this.notify();
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    this.notify();
  }

  async fetchLiveData() {
    if (!this.tseUrl) return null;
    try {
      this.error = null;
      const targetUrl = this.tseUrl.includes('nocache') ? this.tseUrl : `${this.tseUrl}${this.tseUrl.includes('?') ? '&' : '?'}nocache=${Date.now()}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(targetUrl, {
        headers: { 'Accept': '*/*' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let payloadJson;

      // Se for formato JWS oficial do TSE (header.payload.signature)
      if (text.includes('.') && text.split('.').length === 3) {
        const payloadStr = decodeBase64Url(text.split('.')[1]);
        payloadJson = JSON.parse(payloadStr);
      } else {
        payloadJson = JSON.parse(text);
      }

      this.lastFetch = new Date();
      this.lastData = this.parseTsePayload(payloadJson);
      this.notify();
      return this.lastData;
    } catch (err) {
      this.error = err.message;
      this.notify();
      console.warn('[TSE Connector] Erro ao sincronizar com TSE:', err.message);
      return null;
    }
  }

  /**
   * Converte a estrutura oficial JWS do TSE em formato consumido pelo placar e mapa.
   */
  parseTsePayload(payload) {
    if (!payload) return null;

    if (payload.carg && Array.isArray(payload.carg)) {
      const s = payload.s || {};
      const v = payload.v || {};
      
      const secoesTotal = Number(s.ts || 0);
      const secoesApuradas = Number(s.st || 0);
      const completion = secoesTotal ? secoesApuradas / secoesTotal : 0;
      
      const comparecimento = Number(v.tv || 0);
      const validos = Number(v.vv || 0);
      const brancos = Number(v.vb || 0);
      const nulos = Number(v.vn || 0);

      const candidates = [];
      const carg = payload.carg[0];
      const officeName = carg?.nmn || 'Presidente';

      if (carg?.agr) {
        for (const ag of carg.agr) {
          if (ag.par) {
            for (const p of ag.par) {
              if (p.cand) {
                for (const c of p.cand) {
                  const numStr = String(c.n);
                  const meta = CANDIDATE_META[numStr] || {};
                  const votes = Number(c.vap || 0);
                  const pvap = c.pvap ? parseFloat(c.pvap.replace(',', '.')) : (validos ? (votes / validos) * 100 : 0);

                  candidates.push({
                    number: Number(c.n),
                    name: meta.name || c.nmu || c.nm,
                    fullName: c.nm,
                    party: meta.party || p.sg || '',
                    color: meta.color || '#8c8577',
                    photo: meta.photo || null,
                    votes,
                    share: pvap / 100,
                    percentual: pvap.toFixed(2) + '%',
                    isElected: c.e === 'S',
                    status: c.dvt || 'Válido'
                  });
                }
              }
            }
          }
        }
      }

      candidates.sort((a, b) => b.votes - a.votes);

      return {
        type: 'tse-jws-2026',
        electionId: String(payload.ele || this.electionId),
        turno: payload.t || (payload.ele === '6258' ? 2 : 1),
        office: officeName,
        generationTime: `${payload.dg} às ${payload.hg}`,
        completion,
        secoesTotal,
        secoesApuradas,
        comparecimento,
        validos,
        brancos,
        nulos,
        candidates,
        raw: payload
      };
    }

    return {
      type: 'generic-json',
      data: payload
    };
  }
}

export const tse = new TseConnector();
