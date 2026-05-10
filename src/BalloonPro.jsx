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
  discountType: '', discountValue: 0,
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
  const discountAmount = state.discountType === 'percent'
    ? price * ((state.discountValue || 0) / 100)
    : (state.discountValue || 0)
  const finalPrice = Math.max(0, price - discountAmount)

  // Timeline builder
  const subMins = (time, m) => {
    if (!time) return ''
    const [h, min] = time.split(':').map(Number)
    let total = h * 60 + min - m
    total = ((total % 1440) + 1440) % 1440
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
  }
  const buildTL = (eventTime, isDismantling = false) => {
    if (!eventTime) return []

    // Събираме всички стъпки с времетраене
    const steps = []
    if (!isDismantling) {
      if (state.hasPhotoTime) steps.unshift({ label: '📸 Снимки', mins: state.photoTime || 10, note: `${state.photoTime || 10} мин` })
      if (tSign > 0) steps.unshift({ label: '✍️ Надписи', mins: Math.ceil(tSign/60), note: `${Math.ceil(tSign/60)} мин` })
      steps.unshift({ label: '📍 Пристигане — монтаж', mins: Math.ceil(tAttach/60), note: `${clusters} букета · ${Math.ceil(tAttach/60)} мин` })
      if (!state.inflateOnSite) steps.unshift({ label: '🏠 Започни подготовка', mins: Math.ceil((tInflate+tFoil)/60) + Math.ceil(tPrep/60), note: `надуване ${Math.ceil((tInflate+tFoil)/60)} мин + подготовка ${Math.ceil(tPrep/60)} мин` })
      if (travelMin) steps.unshift({ label: '🚗 Тръгни', mins: travelMin, note: `${travelKm} км · ${travelMin} мин` })
      if (state.inflateOnSite) steps.unshift({ label: '📍 Пристигане — надуване + монтаж', mins: Math.ceil((tInflate+tFoil+tAttach)/60) + Math.ceil(tPrep/60), note: `${Math.ceil((tInflate+tFoil+tAttach)/60) + Math.ceil(tPrep/60)} мин` })
    } else {
      if (tSign > 0) steps.unshift({ label: '✍️ Надписи', mins: Math.ceil(tSign/60), note: `${Math.ceil(tSign/60)} мин` })
      steps.unshift({ label: '📍 Демонтаж', mins: Math.ceil(tDismantle/60), note: `${Math.ceil(tDismantle/60)} мин` })
      if (travelMin) steps.unshift({ label: '🚗 Тръгни', mins: travelMin, note: `${travelKm} км · ${travelMin} мин` })
    }

    // Смятаме назад от събитието
    const subMins = (time, m) => {
    if (!time) return ''
    const [h, min] = time.split(':').map(Number)
    let total = h * 60 + min - m
    total = ((total % 1440) + 1440) % 1440
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
  }

  const subMins = (time, m) => {
    if (!time) return ''
    const [h, min] = time.split(':').map(Number)
    let total = h * 60 + min - m
    total = ((total % 1440) + 1440) % 1440
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
  }

  const buildTL = (eventTime, isDismantling = false) => {
    if (!eventTime) return []
    const bufferFinish = state.bufferFinish || 0
    const bufferBefore = state.bufferBefore || 0
    const setupMin = state.setupMinFixed || 15
    const adjustMin = state.adjustMinFixed || 10
    const attachMin = Math.ceil(tAttach / 60)
    const inflateMin = Math.ceil((tInflate + tFoil) / 60)
    const travelMins = state.travelMin || 0
    const readyTime = subMins(eventTime, bufferFinish)

    const steps = []

    if (!isDismantling) {
      // Снимки
      if (state.hasPhotoTime) {
        steps.push({ label: '📸 Снимки', mins: state.photoTime || 10, note: `${state.photoTime || 10} мин` })
      }

      // Услуги от таб 4 (надписи + допълнителни)
      const signItems = (state.signs || []).filter(s => s.timeMin > 0)
      const customItems = (state.customRates || []).filter(r => r.timeMin > 0)
      const allServices = [...signItems.map(s => ({ desc: s.desc || 'Надпис', mins: s.timeMin })), ...customItems.map(r => ({ desc: r.desc || 'Услуга', mins: r.timeMin }))]
      if (allServices.length > 0) {
        const totalServiceMins = allServices.reduce((s, i) => s + i.mins, 0)
        const desc = allServices.map(s => s.desc).join(' + ')
        steps.push({ label: '✍️ Услуги', mins: totalServiceMins, note: `${desc} · ${totalServiceMins} мин` })
      }

      // Финални корекции
      steps.push({ label: '🔧 Финални корекции', mins: adjustMin, note: `${adjustMin} мин` })

      // Закачане на букети
      steps.push({ label: '📍 Закачане на букети', mins: attachMin, note: `${clusters} букета · ${attachMin} мин` })

      // Разопаковане
      steps.push({ label: '📦 Разопаковане', mins: setupMin, note: `${setupMin} мин` })

      // Пристигане (пътуване)
      if (travelMins > 0) {
        steps.push({ label: '🚗 Пристигане', mins: travelMins, note: `${state.travelKm || 0} км · ${travelMins} мин` })
      }

      // Надуване (ако предварително)
      if (!state.inflateOnSite && inflateMin > 0) {
        steps.push({ label: '🏠 Надуване (предварително)', mins: inflateMin, note: `${inflateMin} мин` })
      }

      // Тръгване + буфер
      if (travelMins > 0 || bufferBefore > 0) {
        steps.push({ label: '🚗 Тръгни', mins: bufferBefore, note: bufferBefore > 0 ? `+ ${bufferBefore} мин резерв` : '' })
      }

    } else {
      // ДЕМОНТАЖ — процент от монтажа
      const dismantlePercent = state.dismantlePercent || 50
      const mountTotal = setupMin + attachMin + adjustMin + (state.signs||[]).reduce((s,sg)=>s+(sg.timeMin||0),0) + (state.customRates||[]).reduce((s,r)=>s+(r.timeMin||0),0)
      const dismMin = Math.ceil(mountTotal * dismantlePercent / 100)

      if (travelMins > 0) {
        steps.push({ label: '🚗 Пристигане', mins: travelMins, note: `${state.travelKm || 0} км · ${travelMins} мин` })
      }
      steps.push({ label: '📍 Демонтаж', mins: dismMin, note: `${dismantlePercent}% от монтажа · ${dismMin} мин` })
      if (travelMins > 0 || bufferBefore > 0) {
        steps.push({ label: '🚗 Тръгни', mins: bufferBefore, note: bufferBefore > 0 ? `+ ${bufferBefore} мин резерв` : '' })
      }
    }

    // Смятаме назад от readyTime
    const rows = []
    let cur = readyTime
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].mins > 0) {
        cur = subMins(cur, steps[i].mins)
      }
      rows.unshift({ time: cur, label: steps[i].label, note: steps[i].note, mins: steps[i].mins })
    }

    // Финални редове
    if (!isDismantling) {
      if (bufferFinish > 0) {
        rows.push({ time: readyTime, label: `✅ Готово (${bufferFinish} мин резерв)`, note: '', mins: 0 })
      } else {
        rows.push({ time: readyTime, label: '✅ Готово', note: '', mins: 0 })
      }
      rows.push({ time: eventTime, label: '🎉 Събитието започва', note: '', mins: 0, isEvent: true })
    } else {
      rows.push({ time: eventTime, label: '✅ Демонтаж завършен', note: '', mins: 0, isEvent: true })
    }

    return rows
  }

  const setupTL = buildTL(state.eventStart, false)
  const dismTL  = buildTL(state.dismSameDay ? state.eventEnd : state.dismTime, true)


  return {
    clusters, clustersPerColor, colorCounts, accentCounts,
    tInflate, tFoil, tOnsite, tDismantle, tAttach,
    tSign, tCustExtra, tAssembly, tPrep, tTotal,
    lInfl, lInst, lDism, lTrans, fuelCost, amortCost,
    matBalloons, matAccents, matFoil, matSigns, matCustom,
    matTotal, matCost, laborTotal, costTotal, totalCost, price, salePrice,
    discountAmount, finalPrice,
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
    <div style={{ padding: '10px', background: 'linear-gradient(135deg, #FFD3DD 0%, #F0F9F8 45%, #C6E6E3 100%)', minHeight: '100vh', borderRadius: '20px' }}>
      
      {/* ИКОНА + ТАБОВЕ */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', alignItems: 'center' }}>
        
        {/* SVG КАЛКУЛАТОР ИКОНА */}
        <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
          <rect width="36" height="36" rx="10" fill="#F3A2BE" opacity="0.3"/>
          <rect x="3" y="3" width="30" height="30" rx="8" fill="#F3A2BE" opacity="0.5"/>
          <rect x="6" y="6" width="24" height="24" rx="6" fill="white" opacity="0.9"/>
          <rect x="9" y="9" width="18" height="5" rx="2" fill="#F3A2BE"/>
          <rect x="9" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/>
          <rect x="15.5" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/>
          <rect x="22" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/>
          <rect x="9" y="24" width="5" height="3" rx="1.5" fill="#F3A2BE"/>
          <rect x="15.5" y="24" width="5" height="3" rx="1.5" fill="#F3A2BE"/>
          <rect x="22" y="24" width="5" height="3" rx="1.5" fill="#81BFB7"/>
        </svg>

        {steps.map((label, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: '8px 15px', borderRadius: '15px', border: 'none',
            background: step === i ? '#F3A2BE' : 'rgba(255,255,255,0.6)',
            color: step === i ? '#fff' : '#81BFB7',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap'
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(243,162,190,0.3)', backdropFilter: 'blur(4px)' }}>
        {PAGES[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: step === 0 ? 'rgba(255,255,255,0.4)' : '#FFD3DD',
            color: step === 0 ? '#bbb' : '#3a2a35',
            cursor: step === 0 ? 'default' : 'pointer',
            fontWeight: '700', fontSize: '13px'
          }}>
          ← Назад
        </button>
        <span style={{ fontSize: '12px', color: '#81BFB7', alignSelf: 'center' }}>
          {step + 1} / {steps.length}
        </span>
        <button
          onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          style={{
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: step === steps.length - 1 ? 'rgba(255,255,255,0.4)' : '#F3A2BE',
            color: step === steps.length - 1 ? '#bbb' : '#fff',
            cursor: step === steps.length - 1 ? 'default' : 'pointer',
            fontWeight: '700', fontSize: '13px'
          }}>
          Напред →
        </button>
      </div>
    </div>
  )
}