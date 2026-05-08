import React, { useState } from 'react'
import { C, fmt } from './shared.jsx'
import BPHome     from './BPHome.jsx'
import BPBalloons from './BPBalloons.jsx'
import BPAccents  from './BPAccents.jsx'
import BPServices from './BPServices.jsx'
import BPEvent    from './BPEvent.jsx'
import BPRates    from './BPRates.jsx'
import BPResult   from './BPResult.jsx'

const INIT = {
  decorType: 'organic', garlandLen: 3, density: 'medium', numColors: 2,
  colorEntries: [
    { hex: '#805C98', name: 'Jubilee', price: 0.15, sizeInch: 10, sizeCm: 26, perCluster: 4 },
    { hex: '#BD97C6', name: 'Crocus', price: 0.15, sizeInch: 10, sizeCm: 26, perCluster: 4 }
  ],
  travelKm: 0, amortPerKm: 0.35, fuelPerLiter: 2.65, fuelPer100km: 8, margin: 30,
  accents: [], foilBalloons: [], signs: [], customRates: []
}

export default function BalloonPro() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState(INIT)
  const set = (k, v) => setState(prev => ({ ...prev, [k]: v }))

  // Тук е логиката за изчисленията, която твоите под-компоненти изискват
  const calc = {
    clusters: Math.ceil(state.garlandLen * 12),
    totalCost: 0, // Тези ще се смятат вътре в BPResult
    salePrice: 0
  }

  const PAGES = [
    <BPHome state={state} set={set} calc={calc} />,
    <BPBalloons state={state} set={set} calc={calc} />,
    <BPAccents state={state} set={set} calc={calc} />,
    <BPServices state={state} set={set} calc={calc} />,
    <BPEvent state={state} set={set} calc={calc} />,
    <BPRates state={state} set={set} calc={calc} />,
    <BPResult state={state} set={set} calc={calc} />
  ]

  const steps = ['Основа', 'Цветове', 'Акценти', 'Услуги', 'Локация', 'Цени', 'Финал']

  return (
    <div style={{ background: '#fdf9fd', minHeight: '100%' }}>
      {/* Модерна навигация със стъпки */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', overflowX: 'auto', padding: '5px' }}>
        {steps.map((label, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: '10px 18px', borderRadius: '15px', border: 'none',
            background: step === i ? C.l400 : '#fff', color: step === i ? '#fff' : C.l400,
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', whiteSpace: 'nowrap'
          }}>
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', padding: '30px', border: `1px solid ${C.l100}`, boxShadow: '0 10px 30px rgba(115,83,119,0.05)' }}>
        {PAGES[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{ background: 'none', border: 'none', color: C.gray, cursor: 'pointer', fontWeight: 'bold' }}>← Назад</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} style={{ background: C.l400, color: '#fff', border: 'none', padding: '12px 35px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' }}>
          {step === steps.length - 1 ? 'Запази' : 'Напред →'}
        </button>
      </div>
    </div>
  )
}