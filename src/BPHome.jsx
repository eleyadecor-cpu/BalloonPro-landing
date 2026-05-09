import React from 'react'
import { C, inp, pill, pillLight, DENSITY, TEMPO_PRESETS, Lbl } from './shared.jsx'

export default function BPHome({state, set, calc}) {
  const {decorType, garlandLen, density, numColors, colorEntries, tempo, customTempo} = state
  const {clusters} = calc

  const setNumColors = (n) => {
    set('numColors', n)
    const DEF_COLOR = (i) => ({
      hex: ['#9b7dd4','#d4a0be','#7fbedc','#d4b87d','#7dcea0'][i] || '#9b7dd4',
      name: '', manufacturer: 'gemar', series: 'pastello', price: 0,
      sizeInch: 10, sizeCm: 26, customDiam: false, perCluster: 4,
    })
    const next = [...colorEntries]
    while (next.length < n) next.push(DEF_COLOR(next.length))
    set('colorEntries', next.slice(0, n))
  }

  const S = {background:'#fff', border:`1px solid ${C.l100}`, padding:'16px 14px', flex:1}

  return (
    <div style={{paddingTop:2}}>

      {/* РЕД 1: ТИП + ДЪЛЖИНА */}
      <div style={{display:'flex', gap:2, marginBottom:2}}>
        <div style={{...S}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:10}}>Тип декорация</div>
          <div style={{display:'flex', gap:4}}>
            {['organic','classic'].map(t=>(
              <button key={t} style={{...pill(decorType===t), flex:1, padding:'10px 0'}} onClick={()=>set('decorType',t)}>
                {t==='organic' ? 'Органик' : 'Класик'}
              </button>
            ))}
          </div>
        </div>

        <div style={{...S}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:10}}>Дължина (см)</div>
          <div style={{fontSize:11,color:C.gray,marginBottom:8}}>попълни желана дължина за покритие от гирлянд</div>
          <input
            style={{...inp, fontSize:20, fontWeight:700, textAlign:'center', color:C.l700}}
            type="number" step="10" min="10"
            value={garlandLen * 100}
            onChange={(e) => set('garlandLen', (parseFloat(e.target.value) || 0) / 100)}
          />
          <div style={{fontSize:12,color:C.l600,fontWeight:700,marginTop:6}}>{garlandLen*100} см = {garlandLen} метра</div>
        </div>
      </div>

      {/* РЕД 2: ПЛЪТНОСТ + ТЕМПО + БРОЙ ЦВЕТОВЕ */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:2, marginBottom:2}}>

        <div style={{...S}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:6}}>Плътност</div>
          <div style={{fontSize:11,color:C.gray,marginBottom:8}}>избери желаната гъстота на балоните</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:4}}>
            {Object.entries(DENSITY).map(([k,v])=>(
              <button key={k} style={{...pill(density===k), padding:'8px 4px', fontSize:11}} onClick={()=>set('density',k)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{...S}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:6}}>Темпо</div>
          <div style={{fontSize:11,color:C.gray,marginBottom:8}}>избери темпо или въведи своето</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:4}}>
            {Object.entries(TEMPO_PRESETS).map(([k,v])=>(
              <button key={k} style={{...pill(tempo===k), padding:'8px 4px', fontSize:11}} onClick={()=>set('tempo',k)}>
                {v.label}
              </button>
            ))}
            <button style={{...pill(tempo==='custom'), padding:'8px 4px', fontSize:11, gridColumn:'1/-1'}} onClick={()=>set('tempo','custom')}>
              моето ⚙️
            </button>
          </div>
        </div>

        <div style={{...S}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:6}}>Брой цветове</div>
          <div style={{fontSize:11,color:C.gray,marginBottom:8}}>избери колко цвята ще има в гирлянда</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:4}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} style={{...pill(numColors===n), padding:'8px 4px', fontSize:11, textAlign:'center', ...(n===5?{gridColumn:'1/-1'}:{})}} onClick={()=>setNumColors(n)}>
                {n}<br/><span style={{fontSize:9,opacity:.8}}>{n===1?'цвят':'цвята'}</span>
              </button>
            ))}
          </div>
          {clusters>0 && <div style={{fontSize:11,color:C.l600,marginTop:8,background:C.l50,padding:'4px 8px'}}>{clusters} ÷ {numColors} = ~{Math.round(clusters/numColors)} на цвят</div>}
        </div>
      </div>

    </div>
  )
}
