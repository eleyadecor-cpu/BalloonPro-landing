import React, { useState, useEffect } from 'react'
import { C, calcClusters, fmt } from './shared.jsx'
import BPHome     from './BPHome.jsx'
import BPBalloons from './BPBalloons.jsx'
import BPAccents  from './BPAccents.jsx'
import BPServices from './BPServices.jsx'
import BPEvent    from './BPEvent.jsx'
import BPRates    from './BPRates.jsx'
import BPResult   from './BPResult.jsx'

const INIT = {
  decorType: 'organic',
  garlandLen: 3,
  density: 'medium',
  numColors: 2,
  colorEntries: [
    { hex: '#805C98', name: 'Jubilee', manufacturer: 'gemar', series: 'pastello', price: 0.15, sizeInch: 10, sizeCm: 26, perCluster: 4 },
    { hex: '#BD97C6', name: 'Crocus', manufacturer: 'gemar', series: 'pastello', price: 0.15, sizeInch: 10, sizeCm: 26, perCluster: 4 }
  ],
  location: '',
  travelKm: 0,
  amortPerKm: 0.35, // Твоята нова стойност за амортизация
  fuelPerLiter: 2.65,
  fuelPer100km: 8,
  margin: 30,
  // ... останалите начални стойности
}

export default function BalloonPro() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState(INIT)

  const set = (k, v) => setState(prev => ({ ...prev, [k]: v }))

  // ФУНКЦИЯ ЗА ГОРОВО И АМОРТИЗАЦИЯ
  const calcTravel = () => {
    const km = state.travelKm || 0
    const fuel = (km * (state.fuelPer100km / 100)) * state.fuelPerLiter
    const amort = km * 0.35 // Формулата: км по 0.35 лв
    return { fuel, amort }
  }

  const PAGES = [
    <BPHome state={state} set={set} />,
    <BPBalloons state={state} set={set} />,
    <BPAccents state={state} set={set} />,
    <BPServices state={state} set={set} />,
    <BPEvent state={state} set={set} />,
    <BPRates state={state} set={set} travelCosts={calcTravel()} />,
    <BPResult state={state} set={set} />
  ]

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
        {['Основа', 'Цветове', 'Акценти', 'Услуги', 'Локация', 'Цени', 'Финал'].map((label, i) => (
          <button 
            key={i} 
            onClick={() => setStep(i)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: step === i ? 'var(--jubilee)' : 'var(--border)',
              color: step === i ? 'white' : 'var(--gray)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: step === i ? 'bold' : 'normal'
            }}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '30px', border: '1px solid var(--border)' }}>
        {PAGES[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button className="nav-link" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Назад</button>
        <button className="nav-link" style={{ background: 'var(--jubilee)', color: 'white' }} onClick={() => setStep(s => Math.min(6, s + 1))}>
          {step === 6 ? 'Запази офертата' : 'Напред'}
        </button>
      </div>
    </div>
  )
}