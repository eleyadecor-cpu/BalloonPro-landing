import React from 'react'
import { C,inp,pill,pillLight,BALLOON_SIZES,MANUFACTURERS,Lbl,CardTitle,Card } from './shared.jsx'

const DEF_COLOR = (i) => ({
  hex:['#9b7dd4','#d4a0be','#7fbedc','#d4b87d','#7dcea0'][i]||'#9b7dd4',
  name:'',manufacturer:'gemar',series:'pastello',price:0,
  sizeInch:10,sizeCm:26,customDiam:false,perCluster:4,
})

function SummaryBar({data}) {
  return (
    <div style={{background:C.l700,color:'#fff',padding:'8px 16px',display:'flex',gap:16,fontSize:11,flexWrap:'wrap',marginBottom:2}}>
      <span style={{opacity:.6}}>избрано:</span>
      {Object.entries(data).map(([k,v])=>(
        <span key={k}>{k}: <strong>{v}</strong></span>
      ))}
    </div>
  )
}

export default function BPBalloons({state, set, calc, summaryData}) {
  const {numColors,colorEntries} = state
  const {clusters,clustersPerColor,colorCounts} = calc

  const updColor = (i,p) => set('colorEntries',colorEntries.map((x,j)=>j===i?{...x,...p}:x))

  return (
    <div style={{paddingTop:2}}>
      <SummaryBar data={summaryData} />

      {colorEntries.slice(0,numColors).map((ce,i)=>{
        const cc=colorCounts[i]||{}
        const rawColor = ce.hex||C.l600
        const r2=parseInt(rawColor.slice(1,3),16), g2=parseInt(rawColor.slice(3,5),16), b2=parseInt(rawColor.slice(5,7),16)
        const accent = ((0.299*r2+0.587*g2+0.114*b2)/255) > 0.85 ? '#5a5a5a' : rawColor

        return (
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1.4fr 1.2fr',gap:2,marginBottom:2}}>

            {/* COL 1: ЦВЯТ */}
            <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'14px',borderTop:`3px solid ${accent}`}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:accent,marginBottom:10}}>цвят ({i+1})</div>
              <div style={{fontSize:10,color:C.gray,marginBottom:10}}>въведи името на {i===0?'първия':'следващия'} цвят балон</div>

              {/* Color picker + name */}
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
                <input type="color" value={ce.hex} onChange={e=>updColor(i,{hex:e.target.value})}
                  style={{width:30,height:30,border:'none',cursor:'pointer',padding:2,flexShrink:0}} />
                <input style={{...inp,flex:1,background:C.l50,fontSize:12}} placeholder="напр. Лавандула"
                  value={ce.name} onChange={e=>updColor(i,{name:e.target.value})} />
              </div>

              <div style={{fontSize:10,color:C.gray,marginBottom:4}}>въведи производител</div>
              <select style={{...inp,marginBottom:8,background:C.l50,fontSize:12}}
                value={ce.manufacturer}
                onChange={e=>updColor(i,{manufacturer:e.target.value,series:Object.keys(MANUFACTURERS[e.target.value]?.series||{})[0]||''})}>
                {Object.entries(MANUFACTURERS).map(([k,v])=><option key={k} value={k}>{v.flag} {v.name}</option>)}
              </select>

              <div style={{fontSize:10,color:C.gray,marginBottom:4}}>въведи себестойност за ({i+1}) бр</div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <input style={{...inp,flex:1,background:C.l50,fontSize:13,fontWeight:600}} type="number" step="0.001" min="0"
                  value={ce.price} onChange={e=>updColor(i,{price:+e.target.value})} />
                <span style={{fontSize:11,color:C.gray,whiteSpace:'nowrap'}}>€/бр</span>
              </div>
              <div style={{fontSize:9,color:'#81BFB7',marginTop:3}}>⚠️ Въвеждай себестойност (цена на покупка), не продажна цена!</div>

              {/* Result */}
              {clusters>0 && (
                <div style={{marginTop:12,background:C.l50,padding:'10px',borderTop:`1px solid ${C.l100}`}}>
                  <div style={{fontSize:9,color:C.gray,textTransform:'uppercase',letterSpacing:'.8px',marginBottom:4}}>резултат</div>
                  <div style={{fontSize:11,color:accent,fontWeight:600}}>{cc.cpc} букета × {ce.perCluster} бр = {cc.nr} балона</div>
                  <div style={{fontSize:11,color:'#81BFB7',fontWeight:600}}>€{(cc.cost||0).toFixed(2)}</div>
                </div>
              )}
            </div>

            {/* COL 2: РАЗМЕР */}
            <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'14px',borderTop:`3px solid ${C.l400}`}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l500,marginBottom:6}}>размер балон:(см/инч)</div>
              <div style={{fontSize:10,color:C.gray,marginBottom:10}}>избери желания размер на балон от цвят ({i+1})</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
                {BALLOON_SIZES.map(sz=>(
                  <button key={sz.inch} style={{
                    ...pillLight(ce.sizeInch===sz.inch&&!ce.customDiam,C.l600),
                    padding:'8px 4px',fontSize:10,textAlign:'center',lineHeight:1.3,
                  }} onClick={()=>updColor(i,{sizeInch:sz.inch,sizeCm:sz.cm,customDiam:false})}>
                    {sz.inch}"<br/><span style={{fontSize:9,opacity:.8}}>({sz.cm}см)</span>
                  </button>
                ))}
                <button style={{...pillLight(ce.customDiam,C.l600),padding:'8px 4px',fontSize:10}}
                  onClick={()=>updColor(i,{customDiam:true})}>друго</button>
              </div>
              {ce.customDiam && (
                <div style={{marginTop:8,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <div><Lbl>Инч</Lbl><input style={inp} type="number" step="0.5" value={ce.sizeInch} onChange={e=>updColor(i,{sizeInch:+e.target.value})} /></div>
                  <div><Lbl>Диам. (см)</Lbl><input style={inp} type="number" value={ce.sizeCm} onChange={e=>updColor(i,{sizeCm:+e.target.value})} /></div>
                </div>
              )}
              {!ce.customDiam && (
                <div style={{marginTop:8,fontSize:10,color:C.l600,background:C.l50,padding:'5px 8px'}}>
                  📏 надут: ~{BALLOON_SIZES.find(s=>s.inch===ce.sizeInch)?.cm||ce.sizeCm}см
                  {i===0 && <span style={{color:'#81BFB7',marginLeft:6}}>← за изчисление</span>}
                </div>
              )}
            </div>

            {/* COL 3: БР В БУКЕТ */}
            <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'14px',borderTop:`3px solid ${C.l300}`}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l400,marginBottom:6}}>брой балони в букет</div>
              <div style={{fontSize:10,color:C.gray,marginBottom:10}}>избери броя балони за букет/клъстър от цвят ({i+1})</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
                {[2,3,4,5,6,8,10].map(n=>(
                  <button key={n} style={{
                    ...pillLight(ce.perCluster===n,C.l600),
                    padding:'10px 4px',fontSize:12,fontWeight:600,textAlign:'center',
                  }} onClick={()=>updColor(i,{perCluster:n})}>{n} бр.</button>
                ))}
                <button style={{...pillLight(false,C.l600),padding:'10px 4px',fontSize:11}}
                  onClick={()=>{}}>друго</button>
              </div>
              <div style={{marginTop:8,fontSize:10,color:C.gray,background:C.l50,padding:'5px 8px'}}>
                {ce.perCluster} балона × {cc.cpc||0} букета = {(ce.perCluster*(cc.cpc||0))} бр
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
