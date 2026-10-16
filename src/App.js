import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { html } from './lib/html.js';
import { buildTrend, recentUpdates, stateFlips } from './data/history.js';
import { buildSnapshot, OFFICES, STATES, zoneResults } from './data/mocks.js';
import { tse } from './data/tseConnector.js';
import { useClock } from './hooks/useClock.js';
import { useHistory } from './hooks/useHistory.js';
import { useHotkey } from './hooks/useHotkey.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import { useRoute } from './hooks/useRoute.js';
import { useTheme } from './hooks/useTheme.js';
import { exportMap } from './map/exportMap.js';
import { Insights } from './components/Insights.js';
import { MapStage } from './components/MapStage.js';
import { Scoreboard } from './components/Scoreboard.js';
import { SearchDialog } from './components/SearchDialog.js';
import { SidePanel } from './components/SidePanel.js';
import { TopBar } from './components/TopBar.js';
import { TseDialog } from './components/TseDialog.js';
import { DfDistritaisDialog } from './components/DfDistritaisDialog.js';

// The capital's presidential zones have hand-set shares, so the state calibration skips it.
const FIXED_CAPITAL = '3550308';
const DF_IBGE = '5300108';
// Mirrors styles/layout.css: three columns when wide, a bottom sheet when narrow.
const WIDE_LAYOUT = '(min-width: 1440px)';
const SHEET_LAYOUT = '(max-width: 999px)';
const FLIP_HIGHLIGHT_MS = 2500;
const NO_FLIPS = new Set();

/** States that changed hands since the previous snapshot, kept for a moment so the map can outline them. */
function useFlipped(states, office) {
  const [flipped, setFlipped] = useState(NO_FLIPS);
  const previous = useRef(null), timer = useRef();

  useEffect(() => {
    const winners = Object.fromEntries(Object.entries(states).map(([uf, result]) => [uf, result.winner]));
    const before = previous.current;
    previous.current = { office, winners };
    if (!before || before.office !== office) return;
    const changed = Object.keys(winners).filter(uf => winners[uf] !== before.winners[uf]);
    if (!changed.length) return;
    setFlipped(new Set(changed));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlipped(NO_FLIPS), FLIP_HIGHLIGHT_MS);
  }, [states]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return flipped;
}

export function App({ geo }) {
  const route = useRoute(geo);
  const clock = useClock(route.replay, minute => route.setReplay(minute == null ? null : Math.round(minute)));
  const [theme, toggleTheme] = useTheme();
  const [searching, setSearching] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [is3d, setIs3d] = useState(true); // Default to 3D view as requested
  const [tseOpen, setTseOpen] = useState(false);
  const [dfOpen, setDfOpen] = useState(false);
  const [tseMode, setTseMode] = useState(tse.getMode());
  const [electionId, setElectionId] = useState(tse.getElectionId());
  const [tseData, setTseData] = useState(tse.lastData);

  const wide = useMediaQuery(WIDE_LAYOUT), asSheet = useMediaQuery(SHEET_LAYOUT);
  const stage = useRef();

  useEffect(() => {
    return tse.subscribe(s => {
      setTseMode(s.mode);
      setElectionId(s.electionId);
      setTseData(s.lastData);
    });
  }, []);

  const { uf, office } = route;

  // No Distrito Federal, seleciona automaticamente Brasília (5300108) para abrir as zonas eleitorais imediatamente
  const effectiveMuniId = (!route.municipalityId && uf === 'DF') ? DF_IBGE : route.municipalityId;
  const municipality = effectiveMuniId ? geo.byId.get(effectiveMuniId) : null;

  const snapshot = useMemo(() => buildSnapshot(geo, clock.minute, office), [geo, clock.minute, office]);
  const zoneRows = useMemo(() => {
    const geometry = municipality && geo.zonesFor(municipality.id);
    if (!geometry) return null;
    const fixed = municipality.id === FIXED_CAPITAL && office === OFFICES[0];
    return zoneResults(municipality, geometry, clock.minute, office, fixed ? 0 : (snapshot.adjustments[municipality.uf] || 0));
  }, [geo, municipality, snapshot, office, clock.minute]);

  const zzResult = useMemo(() => ({
    electorate: 341766,
    cast: 341766,
    valid: 330811,
    blank: 3824,
    nulls: 7131,
    sections: 1351,
    done: 1351,
    completion: 1,
    turnout: 0.476,
    winner: 1,
    votes: [143900, 157387, 29524],
    name: 'Exterior'
  }), []);

  const scope = municipality && uf !== 'DF'
    ? { name: municipality.name, result: snapshot.results.get(municipality.id) }
    : uf === 'ZZ'
      ? { name: 'Exterior', result: zzResult }
      : uf ? { name: STATES[uf]?.[0] || uf, result: snapshot.states[uf] || snapshot.national }
      : { name: 'Brasil', result: snapshot.national };

  const history = useHistory(geo, office);
  const trend = useMemo(
    () => buildTrend(geo, history, { uf: uf === 'ZZ' ? null : uf, municipality }, office, clock.minute, scope.result),
    [geo, history, municipality, snapshot, uf, office, clock.minute, scope.result],
  );
  const updates = useMemo(() => recentUpdates(trend, scope.result, clock.minute, { national: !uf }), [trend, scope.result, clock.minute, uf]);
  const flips = useMemo(() => uf ? null : stateFlips(history, clock.minute, snapshot.states), [history, snapshot, uf, clock.minute]);
  const flipped = useFlipped(snapshot.states, office);

  // Picking a place from the sheet closes it, so the map underneath shows the result.
  const navigation = {
    ...route,
    openState: code => { route.openState(code); setSheetOpen(false); },
    openMunicipality: id => { route.openMunicipality(id); setSheetOpen(false); },
  };

  useHotkey('/', event => { event.preventDefault(); setSearching(true); }, { enabled: !searching });
  useHotkey('Escape', () => {
    if (asSheet && sheetOpen) setSheetOpen(false);
    else if (uf) route.back();
  }, { enabled: !searching });

  const saveMap = () => exportMap({
    frame: stage.current,
    theme,
    filename: `mapa-${municipality?.id || uf || 'brasil'}-${is3d ? '3d' : '2d'}.png`,
  });

  const insights = html`<${Insights} place=${scope.name} result=${scope.result} trend=${trend}
    flips=${flips} updates=${updates} onMoment=${clock.replay}
    tseData=${tseData} isTseLive=${tseMode === 'ao-vivo'}/>`;

  return html`<div class="app">
    <${TopBar} office=${office} onOffice=${route.setOffice} theme=${theme} onToggleTheme=${toggleTheme}
      onSearch=${() => setSearching(true)} onDownload=${saveMap} tseMode=${tseMode} onOpenTse=${() => setTseOpen(true)}
      electionId=${electionId} onElection=${id => tse.setElectionId(id)}
      onExterior=${() => navigation.openState('ZZ')}
      onOpenDf=${() => setDfOpen(true)} uf=${uf}/>

    <main>
      <${Scoreboard} office=${office} uf=${uf} scope=${scope.name} result=${scope.result} majorityRule=${office === OFFICES[0] && !uf}
        tseData=${tseData} isTseLive=${tseMode === 'ao-vivo'} electionId=${electionId}/>
      <div class=${'workspace' + (wide ? ' is-wide' : '')}>
        ${wide && html`<aside class="insights-column" aria-label="Andamento da apuração">${insights}</aside>`}
        <${MapStage} stageRef=${stage} geo=${geo} snapshot=${snapshot} route=${navigation}
          municipality=${municipality} zoneRows=${zoneRows} theme=${theme} clock=${clock} flipped=${flipped}
          is3d=${is3d} onToggle3d=${setIs3d}/>
        ${asSheet && sheetOpen && html`<div class="sheet-backdrop" onClick=${() => setSheetOpen(false)}></div>`}
        <${SidePanel} geo=${geo} snapshot=${snapshot} route=${navigation} municipality=${municipality}
          zoneRows=${zoneRows} theme=${theme} placeName=${scope.name} insights=${wide ? null : insights}
          sheet=${asSheet ? { open: sheetOpen, toggle: () => setSheetOpen(open => !open) } : null}/>
      </div>
    </main>

    ${searching && html`<${SearchDialog} geo=${geo} onState=${navigation.openState}
      onMunicipality=${navigation.openMunicipality} onClose=${() => setSearching(false)}/>`}

    ${tseOpen && html`<${TseDialog} onClose=${() => setTseOpen(false)}/>`}

    ${dfOpen && html`<${DfDistritaisDialog} onClose=${() => setDfOpen(false)}/>`}
  </div>`;
}
