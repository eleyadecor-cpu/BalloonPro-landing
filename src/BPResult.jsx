import React, { useEffect } from 'react'
import { C, fmt } from './shared.jsx'

export default function BPResult({state, calc}) {
  const { margin, salePrice, totalCost } = calc
  const [copied, setCopied] = React.useState(false)

  const doCopy = () => {
    const text = `Оферта: ${salePrice.toFixed(2)} €`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{padding: '20px'}}>
      <div style={{background: '#fff', border: `1px solid ${C.l100}`, padding: '20px', textAlign: 'center'}}>
        <div style={{fontSize: 12, color: C.gray, textTransform: 'uppercase'}}>Крайна цена</div>
        <div style={{fontSize: 32, fontWeight: 800, color: C.l700}}>€{salePrice?.toFixed(2) || '0.00'}</div>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20}}>
          <div style={{background: C.l50, padding: '10px'}}>
            <div style={{fontSize: 10, color: '#c0392b'}}>Себестойност</div>
            <div style={{fontWeight: 700}}>€{totalCost?.toFixed(2) || '0.00'}</div>
          </div>
          <div style={{background: C.l50, padding: '10px'}}>
            <div style={{fontSize: 10, color: C.l400}}>Печалба</div>
            <div style={{fontWeight: 700}}>€{(salePrice - totalCost).toFixed(2)}</div>
          </div>
        </div>

        <button 
          onClick={doCopy}
          style={{marginTop: 20, width: '100%', padding: '12px', background: C.l700, color: '#fff', border: 'none', cursor: 'pointer'}}
        >
          {copied ? '✅ КОПИРАНО' : '📋 КОПИРАЙ ОФЕРТАТА'}
        </button>
      </div>
    </div>
  )
}