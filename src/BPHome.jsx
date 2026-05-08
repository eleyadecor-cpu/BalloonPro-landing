import React, { useState, useEffect } from 'react'
import { C, inp, pill, pillLight, DENSITY, TEMPO_PRESETS, Lbl, CardTitle, Card, ScriptH } from './shared.jsx'
import { supabase } from './supabaseClient'

export default function BPHome({state, set, calc}) {
  const {decorType,garlandLen,density,numColors,colorEntries,tempo,customTempo} = state
  const {clusters} = calc
  const [limitReached, setLimitReached] = useState(false)

  // Проверка за лимит при зареждане на приложението
  useEffect(() => {
    const checkLimit = () => {
      const guestCalcs = parseInt(localStorage.getItem('bp_guest_calcs') || '0')
      if (guestCalcs >= 3) {
        setLimitReached(true)
      }
    }
    checkLimit()
  }, [])

  const setNumColors = (n) => {
    if (limitReached) return
    set('numColors',n)
    const DEF_COLOR = (i) => ({
      hex:['#9b7dd4','#d4a0be','#7fbedc','#d4b87d','#7dcea0'][i]||'#9b7dd4',
      name:'',manufacturer:'gemar',series:'pastello',price:0,
      sizeInch:10,sizeCm:26,customDiam:false,perCluster:4,
    })
    const next=[...colorEntries]
    while(next.length<n) next.push(DEF_COLOR(next.length))
    set('colorEntries',next.slice(0,n))
  }

  // Екран, който се показва, когато лимитът е достигнат
  if (limitReached) {
    return (
      <div style={{padding:'60px 20px', textAlign:'center', background:'#fff', border:`1px solid ${C.l100}`, borderRadius:8, marginTop:20}}>
        <div style={{fontSize:50, marginBottom:20}}>🌸</div>
        <h2 style={{color:C.l700, fontSize:24, fontWeight:700, marginBottom:15, fontFamily:"'DM Sans',sans-serif"}}>Лимитът е достигнат</h2>
        <p style={{color:C.gray, marginBottom:30, lineHeight:1.5}}>Използвахте вашите 3 безплатни изчисления.<br/>За да продължите да използвате <strong>Balloon Pro</strong>, моля абонирайте се.</p>
        <button 
          onClick={() => window.location.href = 'https://eleya-decor-app.pages.dev/'} 
          style={{padding:'14px 28px', background:C.l700, color:'#fff', border:'none', borderRadius:50, fontWeight:'bold', cursor:'pointer', fontSize:16, boxShadow:'0 4px 15px rgba(78,53,128,0.2)'}}
        >
          Виж абонаментните планове
        </button>
      </div>
    )
  }

  // ОРИГИНАЛНИЯТ ТИ ДИЗАЙН
  return (
    <div style={{paddingTop:2}}>
      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'20px 22px',marginBottom:2,textAlign:'center'}}>
        <div style={{fontSize:18,fontWeight:700,color:C.l700,fontFamily:"'DM Sans',sans-serif"}}>Добре дошли в Balloon Pro</div>
        <div style={{fontSize:12,color:C.gray,marginTop:4}}>Професионален калкулатор за декоратори</div>
      </div>

      <div style={{display:'flex',gap:2,marginBottom:2}}>
        <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'16px 14px',flex:1}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:10}}>тип декорация</div>
          <div style={{display:'flex',gap:4}}>
            {['organic','classic'].map(t=>(
              <button key={t} style={{...pill(decorType===t),flex:1,padding:'10px 0'}} onClick={()=>set('decorType',t)}>
                {t==='organic'?'Органик':'Класик'}
              </button>
            ))}
          </div>
        </div>

        <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'16px 14px',flex:1}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:10}}>брой цветове</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} style={{...pill(numColors===n),padding:'8px 4px',fontSize:11,textAlign:'center',...(n===5?{gridColumn:'1/-1'}:{})}} onClick={()=>setNumColors(n)}>
                {n}<br/><span style={{fontSize:9,opacity:.8}}>{n===1?'цвят':'цвята'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'16px 14px',marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:10}}>Дължина на гирлянда (метра)</div>
        <input 
          style={{...inp,fontSize:20,fontWeight:700,textAlign:'center',color:C.l700}} 
          type="number" step="0.5" min="0.5" 
          value={garlandLen} 
          onChange={(e)=>set('garlandLen',parseFloat(e.target.value)||0)}
        />
      </div>
    </div>
  )
}