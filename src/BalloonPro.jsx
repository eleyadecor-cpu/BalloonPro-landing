import React, { useState } from 'react'

// --- ВГРАДЕНИ ПОМОЩНИ ФУНКЦИИ (shared) ---
const fmt = (val) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(val || 0);
const C = { jubilee: '#735377', crocus: '#a989ab', border: '#eee', gray: '#888', l100: '#f0f0f0', l600: '#666' };

const INIT = {
  decorType: 'organic', garlandLen: 3, density: 'medium', travelKm: 0,
  fuelPerLiter: 2.65, fuelPer100km: 8, amortPerKm: 0.35, margin: 30,
  location: '', eventDate: '', eventStart: '', eventEnd: ''
}

export default function BalloonPro() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState(INIT)
  const set = (k, v) => setState(prev => ({ ...prev, [k]: v }))

  // Изчисление на транспорт (базирано на твоя код)
  const calcTravel = () => {
    const km = state.travelKm || 0
    const fuel = (km * (state.fuelPer100km / 100)) * state.fuelPerLiter
    const amort = km * state.amortPerKm // 0.35 лв/км
    return { fuel, amort, total: fuel + amort }
  }

  // --- ВГРАДЕНИ СТРАНИЦИ ---
  const StepHome = () => (
    <div>
      <h3 style={{color: '#312A44', marginBottom: '20px'}}>1. Тип на декорацията</h3>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
        {['organic', 'classic'].map(t => (
          <button key={t} onClick={() => set('decorType', t)} style={{
            padding: '20px', borderRadius: '15px', border: state.decorType === t ? `2px solid ${C.jubilee}` : '1px solid #ddd',
            background: state.decorType === t ? '#f8ecff' : 'white', cursor: 'pointer', fontWeight: 'bold'
          }}>
            {t === 'organic' ? '🎈 Органичен гирлянд' : '🏛️ Класическа арка'}
          </button>
        ))}
      </div>
      <div style={{marginTop: '30px'}}>
        <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Дължина: {state.garlandLen} метра</label>
        <input type="range" min="1" max="20" value={state.garlandLen} onChange={e => set('garlandLen', +e.target.value)} style={{width: '100%', accentColor: C.jubilee}} />
      </div>
    </div>
  )

  const StepEvent = () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      <h3 style={{color: '#312A44'}}>2. Локация и Транспорт</h3>
      <div>
        <label style={{fontSize: '12px', fontWeight: 'bold', color: C.l600}}>🚗 Общо километри (отиване и връщане)</label>
        <input type="number" value={state.travelKm} onChange={e => set('travelKm', +e.target.value)} 
               style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginTop: '5px'}} />
        <div style={{fontSize: '11px', marginTop: '8px', color: '#735377', background: '#f8ecff', padding: '8px', borderRadius: '5px'}}>
          Амортизация ({state.amortPerKm}лв/км): <strong>{fmt(state.travelKm * state.amortPerKm)}</strong>
        </div>
      </div>
    </div>
  )

  const StepFinal = () => {
    const travel = calcTravel()
    const materials = state.garlandLen * 25 // Примерна базова цена
    const total = materials + travel.total
    return (
      <div style={{textAlign: 'center'}}>
        <div style={{fontSize: '14px', color: C.gray, marginBottom: '10px'}}>ПРОГНОЗНА СТОЙНОСТ</div>
        <div style={{fontSize: '48px', fontWeight: '900', color: '#312A44'}}>{fmt(total)}</div>
        <div style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'left'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span>Материали и труд:</span> <strong>{fmt(materials)}</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', color: '#735377'}}>
            <span>Транспортни разходи:</span> <strong>{fmt(travel.total)}</strong>
          </div>
        </div>
      </div>
    )
  }

  const PAGES = [<StepHome />, <div>Цветове (Очаквайте)</div>, <StepEvent />, <StepFinal />]
  const labels = ['Основа', 'Цветове', 'Локация', 'Финал']

  return (
    <div style={{ minHeight: '400px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', overflowX: 'auto' }}>
        {labels.map((l, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none',
            background: step === i ? C.jubilee : '#eee', color: step === i ? 'white' : C.gray,
            cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>{i + 1}. {l}</button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '30px', border: '1px solid #eee' }}>
        {PAGES[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{border: 'none', background: 'none', cursor: 'pointer', color: C.gray, fontWeight: 'bold'}}>← Назад</button>
        <button onClick={() => setStep(s => Math.min(labels.length - 1, s + 1))} style={{
          background: C.jubilee, color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'
        }}>{step === labels.length - 1 ? 'Запази офертата' : 'Напред →'}</button>
      </div>
    </div>
  )
}