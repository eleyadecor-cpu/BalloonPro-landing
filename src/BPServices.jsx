import React from 'react'
import { C,inp,pill,pillLight,Lbl,Card,CardTitle } from './shared.jsx'

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

export default function BPServices({state,set,calc,summaryData}) {
  const {signs,customRates} = state
  const updSign = (i,p) => set('signs',signs.map((x,j)=>j===i?{...x,...p}:x))
  const updCR   = (i,p) => set('customRates',customRates.map((x,j)=>j===i?{...x,...p}:x))
  const tSignTotal = signs.reduce((s,sg)=>s+(sg.timeMin||0)*60,0)
  const signCost   = signs.reduce((s,sg)=>s+(sg.qty||1)*(sg.priceEach||0),0)

  return (
    <div style={{paddingTop:2}}>
      <SummaryBar data={summaryData} />

      {/* SIGNS */}
      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:4}}>✍️ Надписи / Цветя / Допълнения</div>
            <div style={{fontSize:10,color:C.gray}}>фолио букви, банери, цветя, всякакви допълнения</div>
          </div>
          <button style={pill(false)} onClick={()=>set('signs',[...signs,{desc:'',qty:1,priceEach:0,timeMin:15}])}>+ Добави</button>
        </div>
        {signs.length===0 && <div style={{fontSize:11,color:C.gray,padding:'10px',background:C.l50,textAlign:'center'}}>Няма добавени надписи или допълнения</div>}
        {signs.map((sg,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr auto',gap:8,alignItems:'flex-end',marginBottom:8,padding:'10px 12px',background:C.l50,border:`1px solid ${C.l100}`}}>
            <div><Lbl>Описание</Lbl><input style={inp} placeholder='напр. Фолио "HAPPY BIRTHDAY"' value={sg.desc} onChange={e=>updSign(i,{desc:e.target.value})} /></div>
            <div><Lbl>Бр.</Lbl><input style={inp} type="number" min={1} value={sg.qty} onChange={e=>updSign(i,{qty:+e.target.value})} /></div>
            <div><Lbl>Цена/бр (€)</Lbl><input style={inp} type="number" step="0.5" value={sg.priceEach} onChange={e=>updSign(i,{priceEach:+e.target.value})} /></div>
            <div><Lbl>Времетраене (мин)</Lbl><input style={inp} type="number" value={sg.timeMin} onChange={e=>updSign(i,{timeMin:+e.target.value})} /></div>
            <button onClick={()=>set('signs',signs.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:'#F3A2BE',cursor:'pointer',fontSize:18,paddingBottom:4}}>×</button>
          </div>
        ))}
        {signs.length>0 && (
          <div style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',background:C.l100,fontSize:11,fontWeight:600}}>
            <span>⏱ {signs.reduce((s,sg)=>s+(sg.timeMin||0),0)} мин монтаж</span>
            <span style={{color:C.l700}}>💰 €{signCost.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* CUSTOM RATES / EXTRA */}
      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:4}}>➕ Допълнителни услуги</div>
            <div style={{fontSize:10,color:C.gray}}>консултация, товарене, наем на оборудване — времето влиза в монтажа</div>
          </div>
          <button style={pill(false)} onClick={()=>set('customRates',[...customRates,{desc:'',qty:1,price:0,timeMin:0}])}>+ Добави</button>
        </div>
        {customRates.length===0 && <div style={{fontSize:11,color:C.gray,padding:'10px',background:C.l50,textAlign:'center'}}>Няма допълнителни услуги</div>}
        {customRates.map((r,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr auto',gap:8,alignItems:'flex-end',marginBottom:8,padding:'10px 12px',background:C.l50,border:`1px solid ${C.l100}`}}>
            <div><Lbl>Описание</Lbl><input style={inp} placeholder="напр. Консултация, Товарене..." value={r.desc} onChange={e=>updCR(i,{desc:e.target.value})} /></div>
            <div><Lbl>Бр.</Lbl><input style={inp} type="number" min={1} value={r.qty||1} onChange={e=>updCR(i,{qty:+e.target.value})} /></div>
            <div><Lbl>Цена/бр (€)</Lbl><input style={inp} type="number" step="0.5" value={r.price||0} onChange={e=>updCR(i,{price:+e.target.value})} /></div>
            <div><Lbl>Времетраене (мин)</Lbl><input style={inp} type="number" step="5" value={r.timeMin||0} onChange={e=>updCR(i,{timeMin:+e.target.value})} /></div>
            <button onClick={()=>set('customRates',customRates.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:'#F3A2BE',cursor:'pointer',fontSize:18,paddingBottom:4}}>×</button>
          </div>
        ))}
        {customRates.length>0 && (
          <div style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',background:C.l100,fontSize:11,fontWeight:600}}>
            <span>⏱ {customRates.reduce((s,r)=>s+(r.timeMin||0),0)} мин</span>
            <span style={{color:C.l700}}>💰 €{customRates.reduce((s,r)=>s+(r.qty||1)*(r.price||0),0).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
