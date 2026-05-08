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
}

function buildCalc(state) {
  const {
    garlandLen, density, numColors, colorEntries,
    tempo, customTempo, foilBalloons, accents, signs, customRates,
    travelKm, travelMin, fuelPerLiter, fuelPer100km, amortPerKm,
    rates, setupMinFixed, adjustMinFixed, attachSecPerCluster, dismantlePercent,
  } = state

  const densityFactor = (DENSITY[density] || DENSITY.standard).factor
  const t = tempo === 'custom' ? customTempo : (TEMPO_PRESETS[tempo] || TEMPO_PRESETS.medium)
  const primaryColor = colorEntries[0] || { sizeCm: 26, perCluster: 4 }

  // Clusters
  const clusters = calcClusters(garlandLen * 100, primaryColor.sizeCm, primaryColor.perCluster, densityFactor)

  // Clusters per color (proportional)
  const totalWeight = colorEntries.slice(0, numColors).reduce((s, c) => s + (1 / c.perCluster), 0)
  const clustersPerColor = colorEntries.slice(0, numColors).map(c =>
    Math.round(clusters * (1 / c.perCluster) / totalWeight)
  )

  // Color counts
  const colorCounts = colorEntries.slice(0, numColors).map((ce, i) => {
    const cpc = clustersPerColor[i] || 0
    const nr = cpc * ce.perCluster
    const cost = nr * (ce.price || 0)
    return { cpc, nr, cost }
  })

  // Accent counts
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

  // Time calculations (seconds)
  const tInflate = colorEntries.slice(0, numColors).reduce((s, ce, i) => {
    const nr = colorCounts[i]?.nr || 0
    const sec = ce.sizeInch <= 6 ? t.pair5 : ce.sizeInch <= 12 ? t.pair10 : t.b18
    return s + nr * sec
  }, 0)

  const tFoil = foilBalloons.reduce((s, fb) => s + (fb.qty || 1) * (fb.timeMin || 2) * 60, 0)

  const tSignTotal = signs.reduce((s, sg) => s + (sg.timeMin || 0) * 60, 0)
  const tCustom = customRates.reduce((s, r) => s + (r.timeMin || 0) * 60, 0)
  const tAttach = clusters * (attachSecPerCluster || 45)
  const tOnsite = tAttach + (setupMinFixed || 15) * 60 + (adjustMinFixed || 10) * 60 + tSignTotal + tCustom
  const tDismantle = tOnsite * ((dismantlePercent || 50) / 100)

  // Labor costs
  const toHours = s => s / 3600
  const lInfl = rates.inflation.enabled ? toHours(tInflate + tFoil) * rates.inflation.value : 0
  const lInst = rates.install.enabled   ? toHours(tOnsite)          * rates.install.value   : 0
  const lDism = rates.dismantle.enabled ? toHours(tDismantle)        * rates.dismantle.value : 0
  const lTrans = rates.transport.enabled ? travelKm * 2 * rates.transport.value : 0

  // Transport costs
  const km2 = travelKm * 2
  const fuelCost = km2 * (fuelPer100km / 100) * fuelPerLiter
  const amortCost = km2 * amortPerKm

  // Material costs
  const matBalloons = colorCounts.reduce((s, c) => s + c.cost, 0)
  const matAccents  = accentCounts.reduce((s, a) => s + a.cost, 0)
  const matFoil     = foilBalloons.reduce((s, fb) => s + (fb.qty || 1) * (fb.price || 0), 0)
  const matSigns    = signs.reduce((s, sg) => s + (sg.qty || 1) * (sg.priceEach || 0), 0)
  const matCustom   = customRates.reduce((s, r) => s + (r.qty || 1) * (r.price || 0), 0)
  const matTotal    = matBalloons + matAccents + matFoil + matSigns + matCustom

  const laborTotal = lInfl + lInst + lDism + lTrans + fuelCost + amortCost
  const costTotal  = matTotal + laborTotal
  const margin     = state.margin || 0
  const price      = margin > 0 ? costTotal / (1 - margin / 100) : costTotal

  return {
    clusters, clustersPerColor, colorCounts, accentCounts,
    tInflate, tFoil, tOnsite, tDismantle, tAttach,
    lInfl, lInst, lDism, lTrans, fuelCost, amortCost,
    matBalloons, matAccents, matFoil, matSigns, matCustom, matTotal,
    laborTotal, costTotal, price,
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
    <BPResult   state={state} set={set} calc={calc} summaryData={summaryData} />,
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
      <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eee' }}>
        {PAGES[step]}
      </div>
    </div>
  )
}