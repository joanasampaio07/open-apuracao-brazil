import rawCandidates from './candidatos.json';

const PARTY_COLORS = {
  PT: '#ee2d35',
  PL: '#4162e2',
  PP: '#0083ca',
  MDB: '#ff9800',
  PSD: '#e91e63',
  PSDB: '#0288d1',
  REPUBLICANOS: '#2196f3',
  PSB: '#ffc107',
  PDT: '#d32f2f',
  NOVO: '#ff6f00',
  PSOL: '#fbc02d',
  REDE: '#009688',
  PSTU: '#b71c1c',
  PCO: '#c62828',
  UP: '#d81b60',
  UNIÃO: '#1565c0',
  UNIAO: '#1565c0',
  AVANTE: '#ff5722',
  SOLIDARIEDADE: '#ff7043',
  PRD: '#795548',
  AGIR: '#3f51b5',
  DC: '#303f9f',
  PRTB: '#2e7d32',
  MOBILIZA: '#8bc34a',
  MISSÃO: '#e65100',
  MISSAO: '#e65100',
  PCB: '#c2185b',
  PODE: '#00bcd4',
  PODEMOS: '#00bcd4'
};

export const CANDIDATES_PRESIDENTE = rawCandidates.presidente.map((c, i) => ({
  name: c.exib || c.nome,
  fullName: c.nomeCompleto || c.nome,
  party: c.partido,
  number: Number(c.n),
  vice: c.vice || '',
  tone: c.partido === 'PL' ? 'blue' : c.partido === 'PT' ? 'red' : 'other',
  color: PARTY_COLORS[c.partido] || '#8c8577',
  photo: c.n === '22' ? '/images/flavio.webp' : c.n === '13' ? '/images/lula.webp' : null,
  sq: c.sq
}));

export function getCandidatesFor(office, uf = null) {
  if (office === 'Presidente' || !office) {
    return CANDIDATES_PRESIDENTE;
  }

  if (office === 'Governadores') {
    const list = (uf && rawCandidates.governador[uf]) || rawCandidates.governador.DF || [];
    return list.map((c, i) => ({
      name: c.exib || c.nome,
      party: c.partido,
      number: Number(c.n),
      coligacao: c.coligacao || '',
      tone: i === 0 ? 'blue' : i === 1 ? 'red' : 'other',
      color: PARTY_COLORS[c.partido] || (i === 0 ? '#4162e2' : i === 1 ? '#ee2d35' : '#8c8577'),
      photo: null,
      sq: c.sq
    }));
  }

  if (office === 'Senado') {
    const list = (uf && rawCandidates.senador[uf]) || rawCandidates.senador.DF || [];
    return list.map((c, i) => ({
      name: c.exib || c.nome,
      party: c.partido,
      number: Number(c.n),
      coligacao: c.coligacao || '',
      tone: i === 0 ? 'blue' : i === 1 ? 'red' : 'other',
      color: PARTY_COLORS[c.partido] || (i === 0 ? '#4162e2' : i === 1 ? '#ee2d35' : '#8c8577'),
      photo: null,
      sq: c.sq
    }));
  }

  if (office === 'Deputados') {
    // Deputados Federais / Distritais (Bancadas e líderes)
    return [
      { name: 'Federação Brasil da Esperança (PT/PCdoB/PV)', party: 'FE BRASIL', number: 13, tone: 'red', color: '#ee2d35', photo: null },
      { name: 'Partido Liberal (PL)', party: 'PL', number: 22, tone: 'blue', color: '#4162e2', photo: null },
      { name: 'União Brasil (UNIÃO)', party: 'UNIÃO', number: 44, tone: 'other', color: '#1565c0', photo: null },
      { name: 'Progressistas (PP)', party: 'PP', number: 11, tone: 'other', color: '#0083ca', photo: null },
      { name: 'Partido Social Democrático (PSD)', party: 'PSD', number: 55, tone: 'other', color: '#e91e63', photo: null },
      { name: 'Movimento Democrático Brasileiro (MDB)', party: 'MDB', number: 15, tone: 'other', color: '#ff9800', photo: null },
      { name: 'Republicanos', party: 'REP', number: 10, tone: 'other', color: '#2196f3', photo: null },
      { name: 'Outras legendas', party: '', number: 0, tone: 'other', color: '#8c8577', photo: null }
    ];
  }

  return CANDIDATES_PRESIDENTE;
}
