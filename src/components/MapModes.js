import { html } from '../lib/html.js';

const UNIT_LABELS = { estados: 'Estados', municipios: 'Municípios', eleitorado: 'Eleitorado' };
const METRIC_LABELS = { lider: 'Quem lidera', apurado: 'Apurado' };
const VIEW_LABELS = { '2d': '2D', '3d': '3D' };

function Segmented({ label, options, value, onChange }) {
  return html`<div class="segmented" role="group" aria-label=${label}>
    ${Object.entries(options).map(([key, text]) => html`<button key=${key} aria-pressed=${value === key} onClick=${() => onChange(key)}>${text}</button>`)}
  </div>`;
}

/** What the map draws, what its colour means, and whether it is in 2D or 3D view. */
export function MapModes({ units, unit, metric, is3d, onUnit, onMetric, onToggle3d }) {
  const unitOptions = Object.fromEntries(units.map(key => [key, UNIT_LABELS[key]]));
  return html`<div class="map-modes">
    <${Segmented} label="Projeção do mapa" options=${VIEW_LABELS} value=${is3d ? '3d' : '2d'} onChange=${v => onToggle3d(v === '3d')}/>
    ${units.length > 1 && html`<${Segmented} label="Recorte do mapa" options=${unitOptions} value=${unit} onChange=${onUnit}/>`}
    <${Segmented} label="Cor do mapa" options=${METRIC_LABELS} value=${metric} onChange=${onMetric}/>
  </div>`;
}
