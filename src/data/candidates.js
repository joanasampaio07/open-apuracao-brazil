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

  if (office === 'Deputado Federal') {
    return [
      { name: 'Fábio Felix', party: 'PSOL', number: 5050, tone: 'other', color: '#fbc02d', photo: null },
      { name: 'Rafael Prudente', party: 'MDB', number: 1515, tone: 'other', color: '#ff9800', photo: null },
      { name: 'Alberto Fraga', party: 'PL', number: 2222, tone: 'blue', color: '#4162e2', photo: null },
      { name: 'Thiago Manzoni', party: 'PL', number: 2233, tone: 'blue', color: '#4162e2', photo: null },
      { name: 'Julio Cesar', party: 'REPUBLICANOS', number: 1010, tone: 'other', color: '#2196f3', photo: null },
      { name: 'Izalci Lucas', party: 'PL', number: 2200, tone: 'blue', color: '#4162e2', photo: null },
      { name: 'Fred Linhares', party: 'REPUBLICANOS', number: 1020, tone: 'other', color: '#2196f3', photo: null },
      { name: 'Agnelo Queiroz', party: 'PT', number: 1310, tone: 'red', color: '#ee2d35', photo: null },
      { name: 'Prof. Reginaldo Veras', party: 'PV', number: 4343, tone: 'other', color: '#4caf50', photo: null },
      { name: 'Mariana Naime', party: 'PL', number: 2201, tone: 'blue', color: '#4162e2', photo: null }
    ];
  }

  if (office === 'Deputado Estadual' || office === 'Deputado Distrital') {
    return [
      { name: 'Marcela Passamani', party: 'MDB', number: 15555, tone: 'other', color: '#ff9800', photo: null },
      { name: 'Max Maciel', party: 'PSOL', number: 50100, tone: 'other', color: '#fbc02d', photo: null },
      { name: 'Eduardo Pedrosa', party: 'UNIÃO', number: 44000, tone: 'other', color: '#1565c0', photo: null },
      { name: 'Chico Vigilante', party: 'PT', number: 13100, tone: 'red', color: '#ee2d35', photo: null },
      { name: 'Joaquim Roriz Neto', party: 'PL', number: 22000, tone: 'blue', color: '#4162e2', photo: null },
      { name: 'Estefane Sampaio', party: 'REPUBLICANOS', number: 10222, tone: 'other', color: '#2196f3', photo: null },
      { name: 'Múcio', party: 'PSB', number: 40061, tone: 'other', color: '#ffc107', photo: null },
      { name: 'Gabriel Magno', party: 'PT', number: 13131, tone: 'red', color: '#ee2d35', photo: null },
      { name: 'Keka Bagno', party: 'PSOL', number: 50123, tone: 'other', color: '#fbc02d', photo: null },
      { name: 'Roosevelt Vilela', party: 'PL', number: 22193, tone: 'blue', color: '#4162e2', photo: null },
      { name: 'Robério Negreiros', party: 'PODE', number: 20000, tone: 'other', color: '#00acc1', photo: null },
      { name: 'Jaqueline Silva', party: 'MDB', number: 15900, tone: 'other', color: '#ff9800', photo: null },
      { name: 'Rôney Nemer', party: 'PP', number: 11111, tone: 'other', color: '#0083ca', photo: null },
      { name: 'Pepa', party: 'PP', number: 11011, tone: 'other', color: '#0083ca', photo: null },
      { name: 'Ricardo Vale', party: 'PT', number: 13013, tone: 'red', color: '#ee2d35', photo: null },
      { name: 'Pastor Daniel de Castro', party: 'PP', number: 11133, tone: 'other', color: '#0083ca', photo: null },
      { name: 'Martins Machado', party: 'REPUBLICANOS', number: 10123, tone: 'other', color: '#2196f3', photo: null }
    ];
  }

  if (office === 'Deputados') {
    return [
      { name: 'Federação Brasil da Esperança (PT/PCdoB/PV)', party: 'FE BRASIL', number: 13, tone: 'red', color: '#ee2d35', photo: null },
      { name: 'Partido Liberal (PL)', party: 'PL', number: 22, tone: 'blue', color: '#4162e2', photo: null },
      { name: 'União Brasil (UNIÃO)', party: 'UNIÃO', number: 44, tone: 'other', color: '#1565c0', photo: null },
      { name: 'Progressistas (PP)', party: 'PP', number: 11, tone: 'other', color: '#0083ca', photo: null }
    ];
  }

  return CANDIDATES_PRESIDENTE;
}
