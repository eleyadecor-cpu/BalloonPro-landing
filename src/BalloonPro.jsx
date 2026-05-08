import React, { useState } from 'react'
import { C, DENSITY, TEMPO_PRESETS, calcClusters } from './shared.jsx'
import BPHome     from './BPHome.jsx'
import BPBalloons from './BPBalloons.jsx'
import BPAccents  from './BPAccents.jsx'
import BPServices from './BPServices.jsx'
import BPEvent    from './BPEvent.jsx'
import BPRates    from './BPRates.jsx'
import BPResult   from './BPResult.jsx'

const INIT = {
  decorType: 'organic', garlandLen: 3, density: 'standard', numColors: 2,
  colorEntries: [
    { hex: '#805C98', name: 'Jubilee', manufacturer: 'gemar', series: 'pastello', price: 0.15, sizeInch: 10, sizeCm: 26, customDiam: false, perCluster: 4 },
    { hex: '#BD97C6', name: 'Crocus',  manufacturer: 'gemar', series: 'pastello', price: 0.15, sizeInch: 10, sizeCm: 26, customDiam: false, perCluster: 4 }
  ],
  accents: [], foilBalloons: [], signs: [], customRates: [],
  tempo: 'medium',
  customTempo: { pair10: 22, pair5: 26, b18: 30, asm: 22 },
  inflateOnSite: false,
  travelKm: 0, travelMin: 0, location: '', distError: '', calcingDist: false,
  amortPerKm: 0.35, fuelPerLiter: 2.65, fuelPer100km: 8, margin: 30,
  setupMinFixed: 15, adjustMinFixed: 10, attachSecPerCluster: 45, dismantlePercent: 50,
  rates: {
    inflation:  { enabled: true,  value: 10 },
    install:    { enabled: true,  value: 12 },
    dismantle:  { enabled: false, value: 10 },
    transport:  { enabled: false, value: 0.3 },
  },
  eventDate: '', eventStart: '', eventEnd: '',
  hasPhotoTime: false, photoTime: 10,
  bufferBefore: 15, bufferFinish: 10,
  dismSameDay: true, dismDate: '', dismTime: '',
  garlandExtra: 0, covDismissed: false,
}

function addMinToTime(timeStr, mins) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  let total = h * 60 + m + Math.round(mins)
  total = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function buildCalc(state) {
  const {
    garlandLen, density, numColors, colorEntries,
    tempo, customTempo, foilBalloons, accents, signs, customRates,
    travelKm, travelMin, fuelPerLiter, fuelPer100km, amortPerKm,
    rates, setupMinFixed, adjustMinFixed, attachSecPerCluster, dismantlePercent,
    garlandExtra,
  } = state

  const densityFactor = (DENSITY[density] || DENSITY.standard).factor
  const t = tempo === 'custom' ? customTempo : (TEMPO_PRESETS[tempo] || TEMPO_PRESETS.medium)
  const primaryColor = colorEntries[0] || { sizeCm: 26, perCluster: 4 }

  const clusters = calcClusters(garlandLen * 100, primaryColor.sizeCm, primaryColor.perCluster, densityFactor) + (garlandExtra || 0)

  const totalWeight = colorEntries.slice(0, numColors).reduce((s, c) => s + (1 / c.perCluster), 0) || 1
  const clustersPerColor = colorEntries.slice(0, numColors).map(c =>
    Math.round(clusters * (1 / c.perCluster) / totalWeight)
  )

  const colorCounts = colorEntries.slice(0, numColors).map((ce, i) => {
    const cpc = clustersPerColor[i] || 0
    const nr = cpc * ce.perCluster
    const cost = nr * (ce.price || 0)
    return { cpc, nr, cost }
  })

  const accentCounts = accents.map(ac => {
    let acClusters = clusters
    if (ac.customCount) acClusters = ac.customCountVal || 1
    else if (ac.distribution !== 'all') {
      const idx = parseInt(ac.distribution)
      acClusters = clustersPerColor[idx] || 0
    }
    const nr = acClusters * (ac.perAccent || 1)
    const cost = nr * (ac.price || 0)
    return { acClusters, nr, cost }
  })

  const tInflate = colorEntries.slice(0, numColors).reduce((s, ce, i) => {
    const nr = colorCounts[i]?.nr || 0
    const sec = ce.sizeInch <= 6 ? t.pair5 : ce.sizeInch <= 12 ? t.pair10 : t.b18
    return s + nr * sec
  }, 0)

  const tFoil     = foilBalloons.reduce((s, fb) => s + (fb.qty || 1) * (fb.timeMin || 2) * 60, 0)
  const tSign     = signs.reduce((s, sg) => s + (sg.timeMin || 0) * 60, 0)
  const tCustExtra= customRates.reduce((s, r) => s + (r.timeMin || 0) * 60, 0)
  const tAttach   = clusters * (attachSecPerCluster || 45)
  const tPrep     = (setupMinFixed || 15) * 60
  const tOnsite   = tAttach + tPrep + (adjustMinFixed || 10) * 60 + tSign + tCustExtra
  const tAssembly = tOnsite
  const tDismantle= tOnsite * ((dismantlePercent || 50) / 100)
  const tTotal    = tInflate + tFoil + tOnsite + tDismantle + (travelMin || 0) * 2 * 60

  const toHours = s => s / 3600
  const lInfl  = rates.inflation.enabled  ? toHours(tInflate + tFoil) * rates.inflation.value  : 0
  const lInst  = rates.install.enabled    ? toHours(tOnsite)           * rates.install.value    : 0
  const lDism  = rates.dismantle.enabled  ? toHours(tDismantle)        * rates.dismantle.value  : 0
  const lTrans = rates.transport.enabled  ? travelKm * 2 * rates.transport.value                : 0

  const km2      = travelKm * 2
  const fuelCost = km2 * (fuelPer100km / 100) * fuelPerLiter
  const amortCost= km2 * amortPerKm

  const matBalloons = colorCounts.reduce((s, c) => s + c.cost, 0)
  const matAccents  = accentCounts.reduce((s, a) => s + a.cost, 0)
  const matFoil     = foilBalloons.reduce((s, fb) => s + (fb.qty || 1) * (fb.price || 0), 0)
  const matSigns    = signs.reduce((s, sg) => s + (sg.qty || 1) * (sg.priceEach || 0), 0)
  const matCustom   = customRates.reduce((s, r) => s + (r.qty || 1) * (r.price || 0), 0)
  const matTotal    = matBalloons + matAccents + matFoil + matSigns + matCustom
  const matCost     = matTotal

  const laborTotal = lInfl + lInst + lDism + lTrans + fuelCost + amortCost
  const costTotal  = matTotal + laborTotal
  const totalCost  = costTotal
  const margin     = state.margin || 0
  const price      = margin > 0 ? costTotal / (1 - margin / 100) : costTotal
  const salePrice  = price

  // Timeline builder
  const buildTL = (startTime) => {
    if (!startTime) return []
    const rows = []
    let cur = startTime
    const add = (label, secs, note = '') => {
      rows.push({ time: cur, label, note })
      cur = addMinToTime(cur, secs / 60)
    }
    if (travelMin) add('🚗 Тръгване', travelMin * 60, `${travelKm} км`)
    add('📦 Разопаковане', tPrep)
    if (!state.inflateOnSite) add('🎈 Надуване', tInflate + tFoil)
    add('📍 Монтаж', tAttach, `${clusters} букета`)
    if (tSign > 0) add('✍️ Надписи', tSign)
    if (state.hasPhotoTime) add('📸 Снимки', (state.photoTime || 10) * 60)
    rows.push({ time: cur, label: '✅ Готово', note: '' })
    return rows
  }

  const setupTL = buildTL(state.eventStart)
  const dismTL  = buildTL(state.dismSameDay ? state.eventEnd : state.dismTime)

  return {
    clusters, clustersPerColor, colorCounts, accentCounts,
    tInflate, tFoil, tOnsite, tDismantle, tAttach,
    tSign, tCustExtra, tAssembly, tPrep, tTotal,
    lInfl, lInst, lDism, lTrans, fuelCost, amortCost,
    matBalloons, matAccents, matFoil, matSigns, matCustom,
    matTotal, matCost, laborTotal, costTotal, totalCost, price, salePrice,
    setupTL, dismTL,
  }
}

export default function BalloonPro() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState(INIT)
  const set = (k, v) => setState(prev => ({ ...prev, [k]: v }))
  const calc = buildCalc(state)

  const summaryData = {
    'Тип': state.decorType === 'organic' ? 'Органик' : 'Класик',
    'Дължина': `${state.garlandLen}м`,
    'Букети': calc.clusters,
    'Цветове': state.numColors,
  }

  const PAGES = [
    <BPHome     state={state} set={set} calc={calc} />,
    <BPBalloons state={state} set={set} calc={calc} summaryData={summaryData} />,
    <BPAccents  state={state} set={set} calc={calc} summaryData={summaryData} />,
    <BPServices state={state} set={set} calc={calc} summaryData={summaryData} />,
    <BPEvent    state={state} set={set} calc={calc} summaryData={summaryData} />,
    <BPRates    state={state} set={set} calc={calc} summaryData={summaryData} />,
    <BPResult   state={state} set={set} setSt={setState} calc={calc} summaryData={summaryData} />,
  ]

  const steps = ['1. Основа', '2. Цветове', '3. Акценти', '4. Услуги', '5. Локация', '6. Цени', '7. Финал']

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {steps.map((label, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: '8px 15px', borderRadius: '15px', border: 'none',
            background: step === i ? C.l600 : '#eee',
            color: step === i ? 'white' : '#888',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap'
          }}>
            {label}
          </button>
        ))}
      </div>
      <<div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eee' }}>
        {PAGES[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: step === 0 ? '#eee' : C.l200,
            color: step === 0 ? '#bbb' : C.l700,
            cursor: step === 0 ? 'default' : 'pointer',
            fontWeight: '700', fontSize: '13px'
          }}>
          ← Назад
        </button>

        <span style={{ fontSize: '12px', color: C.gray, alignSelf: 'center' }}>
          {step + 1} / {steps.length}
        </span>

        <button
          onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          style={{
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: step === steps.length - 1 ? '#eee' : C.l600,
            color: step === steps.length - 1 ? '#bbb' : '#fff',
            cursor: step === steps.length - 1 ? 'default' : 'pointer',
            fontWeight: '700', fontSize: '13px'
          }}>
          Напред →
        </button>
      </div>
        {PAGES[step]}
      </div>
    </div>
  )
}