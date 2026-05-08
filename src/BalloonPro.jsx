import React, { useState } from 'react'
import { C } from './shared.jsx'
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

  // Тези данни се подават към всяка стъпка
  const calc = { clusters: Math.ceil(state.garlandLen * 12) }

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
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {steps.map((label, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: '8px 15px', borderRadius: '15px', border: 'none',
            background: step === i ? '#735377' : '#eee', color: step === i ? 'white' : '#888',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
          }}>
            {i + 1}. {label}
          </button>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eee' }}>
        {PAGES[step]}
      </div>
    </div>
  )
}