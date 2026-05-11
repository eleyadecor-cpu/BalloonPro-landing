import React from 'react'
import BalloonPro from './BalloonPro.jsx'

export default function CalculatorPage({ onBack, onCreateOffer }) {
  return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Табло</button>
        <h1 style={{ color:'#3a2a35', margin:0, fontSize:24, fontWeight:900 }}>🧮 Калкулатор</h1>
      </div>
      <BalloonPro onCreateOffer={onCreateOffer} />
    </div>
  )
}