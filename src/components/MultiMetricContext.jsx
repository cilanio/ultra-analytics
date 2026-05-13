import { METRICS, METRIC_COLORS, RATIO_TIPS } from '../constants/metrics';
import { getVal, avg, perGameRatio, goalsByPeriod } from '../utils/stats';

function InfoIcon({ tipKey }) {
  return (
    <span className="info-wrap">
      <span className="info-icon">i</span>
      <span className="info-tip">{RATIO_TIPS[tipKey] || ''}</span>
    </span>
  );
}

function RatioRow({ label, value, colorStyle, tipKey }) {
  const display = value === null || isNaN(value) || !isFinite(value)
    ? '–' : value.toFixed(1) + '%';
  return (
    <>
      <span className="multi-eff-label">{label}:</span>
      <span className="multi-eff-ratio" style={colorStyle}>{display}</span>
      <InfoIcon tipKey={tipKey} />
    </>
  );
}

export default function MultiMetricContext({ metricKeys, games, mode, period }) {
  if (!metricKeys.some(Boolean)) return null;
  const activeKeys = metricKeys.filter(Boolean);
  const valMap = {};
  activeKeys.forEach((k) => { valMap[k] = games.map((g) => getVal(g, k, mode, period)); });

  if (activeKeys.length === 1 && activeKeys[0] === 'Total_Shots') {
    const shots    = valMap['Total_Shots'];
    const goalsArr = games.map((g) => goalsByPeriod(g, mode, period));
    const eff      = perGameRatio(goalsArr, shots);
    const mean     = parseFloat(avg(shots).toFixed(2));
    return (
      <div className="context-box">
        <div className="ctx-title">Análise Multi-Métrica</div>
        <div className="multi-eff-grid">
          <div className="multi-eff-row">
            <div className="multi-eff-dot" style={{ background: METRIC_COLORS[0] }} />
            <span className="multi-eff-name">Finalizações</span>
            <span className="multi-eff-avg">Méd: {mean}</span>
            <RatioRow label="Eficiência (Gols/Fin.)" value={eff} colorStyle={{ color: 'var(--good)' }} tipKey="eff_shots" />
          </div>
        </div>
      </div>
    );
  }

  const rows = activeKeys.map((key, i) => {
    const vals  = valMap[key];
    const mean  = parseFloat(avg(vals).toFixed(2));
    const color = METRIC_COLORS[i] || '#fff';
    let ratioContent = null;

    if (key === 'Shots_On_Target' && valMap['Total_Shots']) {
      const r = perGameRatio(vals, valMap['Total_Shots']);
      ratioContent = <RatioRow label="Precisão" value={r} colorStyle={{ color: 'var(--a)' }} tipKey="precision" />;
    } else if (key === 'Goals_For') {
      const parts = [];
      if (valMap['Shots_On_Target']) {
        const r = perGameRatio(vals, valMap['Shots_On_Target']);
        parts.push(<RatioRow key="conv" label="Conversão (÷ Alvo)" value={r} colorStyle={{ color: 'var(--good)' }} tipKey="conversion" />);
      }
      if (valMap['Total_Shots']) {
        const r = perGameRatio(vals, valMap['Total_Shots']);
        parts.push(<RatioRow key="efic" label="Efic. Bruta (÷ Fin.)" value={r} colorStyle={{ color: 'var(--lime)' }} tipKey="eff_bruta" />);
      }
      if (valMap['Big_Chances']) {
        const r = perGameRatio(vals, valMap['Big_Chances']);
        parts.push(<RatioRow key="conv2" label="Conv. Chances" value={r} colorStyle={{ color: 'var(--warn)' }} tipKey="chances_conv" />);
      }
      ratioContent = parts;
    } else if (key === 'Big_Chances' && valMap['Total_Shots']) {
      const r = perGameRatio(vals, valMap['Total_Shots']);
      ratioContent = <RatioRow label="Chances/Chute" value={r} colorStyle={{ color: 'var(--warn)' }} tipKey="chances_rate" />;
    } else if (key === 'Corners' && valMap['Total_Shots']) {
      const r = perGameRatio(vals, valMap['Total_Shots']);
      ratioContent = <RatioRow label="Escanteios/Chute" value={r} colorStyle={{ color: '#76e4f7' }} tipKey="corner_rate" />;
    } else if (key === 'Total_Shots' && valMap['Total_Shots_All']) {
      const r = perGameRatio(vals, valMap['Total_Shots_All']);
      ratioContent = <RatioRow label="Part. nas Finalizações" value={r} colorStyle={{ color: 'var(--a)' }} tipKey="shots_share" />;
    } else if (key === 'Shots_On_Target' && valMap['Shots_On_Target_All'] && !valMap['Total_Shots']) {
      const r = perGameRatio(vals, valMap['Shots_On_Target_All']);
      ratioContent = <RatioRow label="Part. no Alvo Total" value={r} colorStyle={{ color: 'var(--a)' }} tipKey="ontarget_share" />;
    }

    return (
      <div key={key} className="multi-eff-row">
        <div className="multi-eff-dot" style={{ background: color }} />
        <span className="multi-eff-name">{METRICS[key]}</span>
        <span className="multi-eff-avg">Méd: {mean}</span>
        {ratioContent}
      </div>
    );
  });

  return (
    <div className="context-box">
      <div className="ctx-title">Análise Multi-Métrica</div>
      <div className="multi-eff-grid">{rows}</div>
    </div>
  );
}