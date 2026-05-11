import React, { useEffect } from 'react'
import { C, BALLOON_SIZES, DENSITY, fmt, addMins } from './shared.jsx'
import { supabase } from './supabaseClient'
function TL({row, last}) {
  return (
    <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:last?0:8}}>
      <div style={{minWidth:54,padding:'5px 8px',background:last?C.l700:'#fff',border:`1px solid ${C.l100}`,textAlign:'center',fontSize:12,fontWeight:700,color:last?'#fff':C.l700,flexShrink:0}}>
        {row.time}
      </div>
      <div style={{flex:1,paddingTop:4}}>
        <div style={{fontSize:12,fontWeight:600}}>{row.label}</div>
        {row.note && <div style={{fontSize:10,color:C.gray,marginTop:2}}>{row.note}</div>}
      </div>
    </div>
  )
}

export default function BPResult({state, set, setSt, calc, summaryData, onCreateOffer, inquiry}) {
  const {colorEntries, numColors, accents, foilBalloons, signs, customRates, rates, margin, inflateOnSite, location, hasPhotoTime, photoTime, bufferFinish, bufferBefore, travelMin, travelKm, fuelPerLiter, fuelPer100km, amortPerKm, eventDate, eventStart, eventEnd, dismSameDay, dismDate, dismTime} = state
  const {clusters, clustersPerColor, colorCounts, accentCounts, tInflate, tFoil, tAssembly, tAttach, tSign, tCustExtra, tOnsite, tPrep, tDismantle, tTotal, matCost, laborTotal, totalCost, salePrice, setupTL, dismTL, lInfl, lInst, lDism, lTrans, fuelCost, amortCost} = calc
  
  const [copied, setCopied] = React.useState(false)
  const [calcNum] = React.useState(() => Math.floor(Math.random() * 9000) + 1000)

  // --- НОВИЯТ КОД ЗА БРОЕНЕ ---
  useEffect(() => {
    const countCalculation = () => {
      const current = parseInt(localStorage.getItem('bp_guest_calcs') || '0')
      if (current < 3) {
        localStorage.setItem('bp_guest_calcs', (current + 1).toString())
        console.log("Калкулация записана локално!");
      }
    }
    countCalculation()
  }, [])

  const formatDate = (iso) => {
    if (!iso) return '—'
    const p = iso.split('-')
    return `${p[2]}.${p[1]}.${p[0]}`
  }

  const generatePDF = () => {
    const {colorEntries,numColors,rates,margin,inflateOnSite,location,travelMin,travelKm,eventDate,eventStart} = state
    const formatDateStr = iso => iso?iso.split('-').reverse().join('.'):'—'
    const typeLabel = state.decorType==='garland'?'Гирлянд':'Арка'
    const densLabel = DENSITY[state.density]?.label||state.density

    const tlRows = calc.setupTL?.map(r=>`<tr><td><strong>${r.time}</strong></td><td>${r.label}</td><td style="color:#81BFB7;font-size:11px">${r.note||''}</td></tr>`).join('')||''
    const dismTlRows = calc.dismTL?.map(r=>`<tr><td><strong>${r.time}</strong></td><td>${r.label}</td><td style="color:#81BFB7;font-size:11px">${r.note||''}</td></tr>`).join('')||''

    const colorRows = colorEntries.slice(0,numColors).map((ce,i)=>{
      const cc=calc.colorCounts[i]||{}
      return `<tr><td>Цвят ${i+1}: <strong>${ce.name||'—'}</strong></td><td>${calc.clustersPerColor[i]||0} букета × ${ce.perCluster} бр</td><td>${cc.nr||0} балона (+10%)</td><td>€${(cc.cost||0).toFixed(2)}</td></tr>`
    }).join('')

    const accentRows = (state.accents||[]).map((ac,i)=>{
      const cnt=calc.accentCounts[i]||{}
      return `<tr style="background:#f9f5ff"><td>🎈 Акцент: <strong>${ac.name||ac.sizeInch+'"'}</strong> (${ac.sizeInch}" / ${ac.sizeCm}см)</td><td>${cnt.acClusters} букета × ${ac.perAccent} бр</td><td>${cnt.nr||0} балона (+10%)</td><td>€${(cnt.cost||0).toFixed(2)}</td></tr>`
    }).join('')

    const foilRows = (state.foilBalloons||[]).map(fb=>{
      return `<tr style="background:#fffbf0"><td>✨ Фолио: <strong>${fb.name||fb.label||fb.inch+'"'}</strong> (${fb.inch}" / ${fb.cm}см)</td><td>${fb.qty} бр · ${(fb.qty*(fb.timeMin||2)).toFixed(0)} мин надуване</td><td>—</td><td>€${(fb.qty*(fb.price||0)).toFixed(2)}</td></tr>`
    }).join('')

    const signsRows = (state.signs||[]).filter(s=>s.desc||s.priceEach>0).map(s=>{
      return `<tr><td>✍️ ${s.desc||'Надпис/Допълнение'}</td><td>${s.qty||1} бр · ${s.timeMin||0} мин</td><td>—</td><td>€${((s.qty||1)*(s.priceEach||0)).toFixed(2)}</td></tr>`
    }).join('')

    const costRows = [
      [`Материали (+10%)`, calc.matCost],
      rates.inflation.enabled && [`Надуване (${((calc.tInflate+calc.tFoil)/3600).toFixed(1)} ч × €${rates.inflation.value}/ч)`, calc.lInfl],
      rates.install.enabled   && [`Монтаж (${(calc.tOnsite/3600).toFixed(1)} ч × €${rates.install.value}/ч)`, calc.lInst],
      rates.dismantle.enabled && [`Демонтаж (${(calc.tDismantle/3600).toFixed(1)} ч × €${rates.dismantle.value}/ч)`, calc.lDism],
      rates.transport.enabled && [`Транспорт (${travelKm*2} км × €${rates.transport.value}/км)`, calc.lTrans],
      (calc.fuelCost+calc.amortCost)>0 && [`Гориво + Амортизация`, calc.fuelCost+calc.amortCost],
      ...(state.customRates||[]).filter(r=>r.price>0).map(r=>[r.desc||'Услуга', r.qty*r.price]),
      ...(state.signs||[]).filter(s=>s.priceEach>0).map(s=>[`✍️ ${s.desc||'Надпис'}`, (s.qty||1)*s.priceEach]),
    ].filter(Boolean).map(([l,v])=>`<tr><td>${l}</td><td style="text-align:right">€${Number(v).toFixed(2)}</td></tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>BalloonPro — Калкулация</title>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;color:#3a2a35;margin:0;padding:0;font-size:12px;}
      .header{background:#81BFB7;color:#fff;padding:18px 24px;display:flex;justify-content:space-between;align-items:flex-start;}
      .header h1{margin:0;font-size:22px;font-weight:700;}
      .header h1 span{font-style:italic;font-weight:400;color:#C6E6E3;}
      .header-right{text-align:right;font-size:11px;color:#C6E6E3;}
      .header-right strong{display:block;font-size:14px;color:#fff;}
      .sub{background:#FFD3DD;padding:8px 24px;font-size:10px;color:#81BFB7;}
      .body{padding:20px 24px;}
      .section-title{background:#FFD3DD;padding:5px 8px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#81BFB7;margin:14px 0 6px;}
      table{width:100%;border-collapse:collapse;font-size:11px;}
      td{padding:4px 6px;border-bottom:1px solid #f0edf8;}
      .total-row{background:#F0F9F8;font-weight:700;color:#81BFB7;}
      .price-row{background:#81BFB7;color:#fff;font-size:14px;font-weight:700;}
      .price-row td{padding:8px 6px;}
      .tl-time{font-weight:700;color:#81BFB7;min-width:55px;}
      .footer{margin-top:20px;border-top:1px solid #FFD3DD;padding-top:8px;font-size:9px;color:#F3A2BE;display:flex;justify-content:space-between;}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
    </style></head><body>
    <div class="header">
      <div><h1>Balloon<span>Pro</span></h1><div style="font-size:11px;color:#C6E6E3;margin-top:4px">Калкулация № ${calcNum}</div></div>
      <div class="header-right">${location?`<strong>${location}</strong>`:''}${eventDate?`<div>${formatDateStr(eventDate)}${eventStart?' · '+eventStart:''}</div>`:''}</div>
    </div>
    <div class="sub">Изчисление — ${new Date().toLocaleDateString('bg-BG')} · ${typeLabel} · ${calc.clusters} букета · ${densLabel} · ${state.garlandLen}см</div>
    <div class="body">
      <div class="section-title">Балони по цвят</div>
      <table><thead><tr style="font-size:9px;color:#81BFB7"><td>Артикул</td><td>Количество</td><td>Балони</td><td>Себестойност</td></tr></thead>
      <tbody>
        ${colorRows}
        ${accentRows}
        ${foilRows}
      </tbody></table>
      ${signsRows?`<div class="section-title">Надписи / Цветя / Допълнения</div><table><thead><tr style="font-size:9px;color:#81BFB7"><td>Описание</td><td>Количество / Времетраене</td><td></td><td>Себестойност</td></tr></thead><tbody>${signsRows}</tbody></table>`:''}
      <div class="section-title">Ценова калкулация</div>
      <table><tbody>${costRows}
        <tr class="total-row"><td>Себестойност (общо)</td><td style="text-align:right">€${calc.totalCost.toFixed(2)}</td></tr>
        ${margin>0?`<tr><td style="color:#81BFB7">Марж (${margin}%)</td><td style="text-align:right;color:#81BFB7">€${(calc.salePrice-calc.totalCost).toFixed(2)}</td></tr>`:''}
        ${calc.discountAmount>0?`<tr><td style="color:#F3A2BE">Отстъпка (${state.discountType==='percent'?state.discountValue+'%':'€'+state.discountValue})</td><td style="text-align:right;color:#F3A2BE">-€${calc.discountAmount.toFixed(2)}</td></tr>`:''}
        <tr class="price-row"><td>ЦЕНА ЗА КЛИЕНТА</td><td style="text-align:right">€${(calc.finalPrice||calc.salePrice).toFixed(2)}</td></tr>
      </tbody></table>
      <div class="section-title">Времева оценка</div>
      <table><tbody>
        <tr><td>${inflateOnSite?'📍 Надуване (на локация)':'🏠 Надуване (предварително)'}</td><td style="text-align:right">${fmt(calc.tInflate+calc.tFoil)}</td></tr>
        <tr><td>📍 Монтаж</td><td style="text-align:right">${fmt(calc.tOnsite)}</td></tr>
        ${rates.dismantle.enabled?`<tr><td>🔧 Демонтаж</td><td style="text-align:right">${fmt(calc.tDismantle)}</td></tr>`:''}
        <tr><td>🚗 Пътуване</td><td style="text-align:right">${travelMin*2} мин</td></tr>
        <tr class="total-row"><td>Общо (без демонтаж)</td><td style="text-align:right">${fmt(calc.tTotal)}</td></tr>
      </tbody></table>
      ${calc.setupTL?.length>0&&eventStart?`<div class="section-title">Timeline — Монтаж${location?' · '+location:''}</div><table><tbody>${tlRows}</tbody></table>`:''}
      ${rates.dismantle.enabled&&calc.dismTL?.length>0?`<div class="section-title" style="background:#d4edd8;color:#2d6a4f">Timeline — Демонтаж</div><table><tbody>${dismTlRows}</tbody></table>`:''}      <div class="footer"><span>Генерирано с BalloonPro</span><span>${new Date().toLocaleDateString('bg-BG')}</span></div>
    </div></body></html>`

    const w = window.open('','_blank','width=800,height=900')
    w.document.write(html)
    w.document.close()
    w.onload = () => { w.print() }
  }

  const totalCovPx = colorCounts.reduce((s,cc,i)=>{
    const ce=colorEntries[i];if(!ce)return s
    const d=ce.customDiam?ce.sizeCm:(BALLOON_SIZES.find(b=>b.inch===ce.sizeInch)?.cm||26)
    return s+(clustersPerColor[i]||0)*(ce.perCluster/4.8)*d
  },0)
  const garlandLen = state.garlandLen
  const covOk = Math.abs(totalCovPx-garlandLen)<garlandLen*0.05
  const covColor = covOk?'#81BFB7':Math.abs(totalCovPx-garlandLen)<garlandLen*0.15?'#c0892b':'#F3A2BE'

  const safeColor = (hex) => {
    if (!hex) return C.l600
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255
    return luminance > 0.85 ? '#5a5a5a' : hex
  }

  const doCopy = () => {
    const lines=['🎈 BalloonPro — Калкулация',
      `${state.decorType==='garland'?'Гирлянд':'Арка'} · ${clusters} букета · ${DENSITY[state.density]?.label}`,
      ...colorEntries.slice(0,numColors).map((ce,i)=>`${ce.name||'Цвят '+(i+1)}: ${clustersPerColor[i]} × ${ce.perCluster}бр = ${colorCounts[i]?.nr||0} балона`),
      '',`Материали: €${matCost.toFixed(2)}`,
      laborTotal>0?`Труд: €${laborTotal.toFixed(2)}`:'',
      `Общо: €${totalCost.toFixed(2)}`,
      margin>0?`Цена клиент (${margin}%): €${salePrice.toFixed(2)}`:'',
      '',`⏱ Общо: ${fmt(tTotal)}`,
      location?`📍 ${location}`:'',
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(lines)
    setCopied(true);setTimeout(()=>setCopied(false),2500)
  }

  const TL = ({row,last}) => (
    <div style={{display:'flex',gap:12,alignItems:'flex-start',paddingBottom:last?0:10,marginBottom:last?0:10,borderBottom:last?'none':`1px solid ${C.l100}`}}>
      <div style={{minWidth:58,padding:'5px 8px',background:last?C.l900:'#fff',color:last?'#fff':C.l700,border:`1.5px solid ${C.l700}`,fontSize:13,fontWeight:700,textAlign:'center',flexShrink:0}}>{row.time}</div>
      <div style={{paddingTop:2}}>
        <div style={{fontSize:12,fontWeight:last?700:500,color:last?C.l900:C.ink}}>{row.label}</div>
        {row.note&&<div style={{fontSize:10,color:C.gray,marginTop:2}}>{row.note}</div>}
      </div>
    </div>
  )

  return (
    <div style={{paddingTop:4}}>
      <div style={{background:C.l700,color:'#fff',display:'grid',gridTemplateColumns:'repeat(5,1fr)',marginBottom:2}}>
        {[
          ['Букети',clusters],
          ['Балони',colorCounts.reduce((s,b)=>s+(b.nr||0),0)+accentCounts.reduce((s,a)=>s+(a.nr||0),0)],
          ['Материали','€'+matCost.toFixed(2)],
          ['Себестойност','€'+totalCost.toFixed(2)],
          ['Цена клиент','€'+salePrice.toFixed(2)],
        ].map(([l,v],i)=>(
          <div key={i} style={{textAlign:'center',padding:'14px 8px',borderRight:i<4?'1px solid rgba(255,255,255,.15)':'none'}}>
            <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'1px',opacity:.65,marginBottom:5}}>{l}</div>
            <div style={{fontSize:18,fontWeight:700}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',color:C.l500,letterSpacing:'1px',marginBottom:12}}>Балони по цвят</div>
        {state.decorType==='garland' && totalCovPx>0 && (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,background:covOk?'#C6E6E3':`${covColor}12`,color:covColor,padding:'8px 12px',marginBottom:covOk?0:6}}>
              📏 Зададена: {garlandLen}см · Покрита: ~{totalCovPx.toFixed(0)}см
              {covOk?' ✅':(totalCovPx>garlandLen?` (+${(totalCovPx-garlandLen).toFixed(0)}см)`:`(${(totalCovPx-garlandLen).toFixed(0)}см)`)}
            </div>
            {!covOk && !state.covDismissed && (
              <div style={{background:'#fdf8ff',border:`1px solid ${covColor}30`,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:covColor,marginBottom:8,fontWeight:600}}>
                  {totalCovPx>garlandLen
                    ?`Гирляндата ще е ~${(totalCovPx-garlandLen).toFixed(0)}см по-дълга от зададените ${garlandLen}см.`
                    :`Гирляндата ще е ~${(garlandLen-totalCovPx).toFixed(0)}см по-къса от зададените ${garlandLen}см.`}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button style={{padding:'7px 14px',background:covColor,color:'#fff',border:'none',fontSize:11,fontWeight:700,cursor:'pointer'}}
                    onClick={()=>{
                      const avgCov = state.colorEntries.slice(0,state.numColors).reduce((s,ce)=>{
                        const d=ce.customDiam?ce.sizeCm:(BALLOON_SIZES.find(b=>b.inch===ce.sizeInch)?.cm||26)
                        return s+(ce.perCluster/4.8)*d*(1/state.numColors)
                      },0)
                      if(avgCov>0){
                        const targetClusters = Math.round(garlandLen/avgCov)
                        const formulaClusters = calc.clusters - (state.garlandExtra||0)
                        const newExtra = targetClusters - formulaClusters
                        setSt(p=>({...p, garlandExtra:newExtra, covDismissed:true}))
                      }
                    }}>🔄 Коригирай за ~{garlandLen}см</button>
                  <button style={{padding:'7px 14px',background:'#fff',color:'#81BFB7',border:'1px solid #81BFB7',fontSize:11,fontWeight:600,cursor:'pointer'}}
                    onClick={()=>set('covDismissed',true)}>✅ Запази така</button>
                </div>
              </div>
            )}
          </div>
        )}
        {colorEntries.slice(0,numColors).map((ce,i)=>{
          const cc=colorCounts[i]||{}
          const rawColor=ce.hex||C.l400
          const color=safeColor(rawColor)
          const isLight = rawColor!==color
          return (
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0,marginBottom:10,border:`1px solid ${C.l100}`}}>
              <div style={{padding:'10px 12px',background:C.l50,borderRight:`1px solid ${C.l100}`,borderLeft:`4px solid ${rawColor}`,outline:isLight?`1px solid #ddd`:undefined}}>
                <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
                  <div style={{width:14,height:14,background:rawColor,flexShrink:0,border:'1px solid #ddd'}} />
                  <span style={{fontSize:12,fontWeight:600}}>{ce.name||`Цвят ${i+1}`}</span>
                </div>
                <div style={{fontSize:10,color:C.gray}}>{ce.sizeInch}" ({BALLOON_SIZES.find(s=>s.inch===ce.sizeInch)?.cm||ce.sizeCm}см)</div>
                <div style={{fontSize:11,fontWeight:700,color,marginTop:4}}>€{(cc.cost||0).toFixed(2)}</div>
              </div>
              <div style={{padding:'10px 12px',background:'#fff',borderRight:`1px solid ${C.l100}`,textAlign:'center'}}>
                <div style={{fontSize:9,textTransform:'uppercase',color:C.gray,marginBottom:4}}>Букети</div>
                <div style={{fontSize:20,fontWeight:700,color}}>{cc.cpc}</div>
                <div style={{fontSize:9,color:C.gray}}>× {ce.perCluster} бр</div>
              </div>
              <div style={{padding:'10px 12px',background:'#fff',textAlign:'center'}}>
                <div style={{fontSize:9,textTransform:'uppercase',color:C.gray,marginBottom:4}}>Балони</div>
                <div style={{fontSize:20,fontWeight:700,color}}>{cc.nr}</div>
                <div style={{fontSize:9,color:C.gray}}>бр. +10%</div>
              </div>
            </div>
          )
        })}
        {accentCounts.map((cnt,ai)=>{
          const ac=accents[ai];if(!ac)return null
          return (
            <div key={`ac${ai}`} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'8px 12px',background:C.l50,border:`1px solid ${C.l100}`,marginBottom:6}}>
              <span style={{fontWeight:600}}>🎈 {ac.name||ac.sizeInch+'"'}</span>
              <span>{cnt.acClusters} × {ac.perAccent} = {cnt.nr} бр · <strong>€{(cnt.cost||0).toFixed(2)}</strong></span>
            </div>
          )
        })}

        {foilBalloons.length > 0 && (
          <div style={{marginTop:8}}>
            {foilBalloons.map((fb,fi)=>(
              <div key={fi} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'8px 12px',background:'#fffbf0',border:'1px solid #f0e8c0',marginBottom:6}}>
                <span style={{fontWeight:600}}>✨ {fb.name||fb.label||fb.inch+'"'}</span>
                <span>{fb.qty} бр · {(fb.qty*(fb.timeMin||2)).toFixed(0)} мин · <strong>€{(fb.qty*(fb.price||0)).toFixed(2)}</strong></span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',color:C.l500,letterSpacing:'1px',marginBottom:14}}>Timeline — монтаж</div>
        {setupTL.length > 0 ? setupTL.map((row,i)=><TL key={i} row={row} last={i===setupTL.length-1} />) : <div style={{fontSize:11,color:C.gray}}>Въведи начален час в таб Локация</div>}
      </div>

      {dismTL.length > 0 && (
        <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}}>
          <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',color:C.l500,letterSpacing:'1px',marginBottom:14}}>Timeline — демонтаж</div>
          {dismTL.map((row,i)=><TL key={i} row={row} last={i===dismTL.length-1} />)}
        </div>
      )}

      <div style={{background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}}>
        <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',color:C.l500,letterSpacing:'1px',marginBottom:12}}>Ценова калкулация</div>
        {[
          [true,'Материали (+10%)',matCost],
          [rates.inflation.enabled,`Надуване (${((tInflate+tFoil)/3600).toFixed(1)}ч)`,lInfl],
          [rates.install.enabled,`Монтаж (${(tOnsite/3600).toFixed(1)}ч)`,lInst],
          [rates.dismantle.enabled,`Демонтаж (${(tDismantle/3600).toFixed(1)}ч)`,lDism],
          [rates.transport.enabled,`Транспорт (${travelKm*2}км)`,lTrans],
          [(fuelCost+amortCost)>0,'Гориво + Амортизация',fuelCost+amortCost],
        ].filter(r=>r[0]&&r[2]>0).map(([,l,v],i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'5px 0',borderBottom:`1px solid ${C.l50}`}}><span>{l}</span><strong>€{Number(v).toFixed(2)}</strong></div>
        ))}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0,marginTop:12}}>
          <div style={{background:'#FFD3DD',padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:9,color:'#F3A2BE',textTransform:'uppercase',fontWeight:600,marginBottom:3}}>Себестойност</div>
            <div style={{fontSize:20,fontWeight:700,color:'#F3A2BE'}}>€{totalCost.toFixed(2)}</div>
          </div>
          <div style={{background:C.l50,padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:9,color:C.l600,textTransform:'uppercase',fontWeight:600,marginBottom:3}}>Печалба ({margin}%)</div>
            <div style={{fontSize:20,fontWeight:700,color:C.l600}}>€{(salePrice-totalCost).toFixed(2)}</div>
          </div>
          <div style={{background:C.l700,padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.7)',textTransform:'uppercase',fontWeight:600,marginBottom:3}}>Цена клиент</div>
            <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>€{salePrice.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:10,marginTop:4}}>
        <button style={{flex:1,padding:13,background:C.l700,color:'#fff',border:'none',fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={doCopy}>
          {copied?'✅ Копирано!':'📋 Копирай резултата'}
        </button>
        <button style={{padding:'13px 22px',background:'#fff',color:C.l600,border:`1px solid ${C.l300}`,fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={generatePDF}>
  📄 Свали PDF
        </button>
        <button onClick={()=>{
          const offerData = {
            fromCalc: true,
            inquiry_id: inquiry?.id || null,
            client_name: inquiry?.client_name || '',
            client_phone: inquiry?.client_phone || '',
            client_email: inquiry?.client_email || '',
            event_date: state.eventDate || inquiry?.event_date || '',
            event_time: state.eventStart || inquiry?.event_start?.slice(0,5) || '',
            event_type: inquiry?.event_type || '',
            location: state.location || inquiry?.location || '',
            guest_count: inquiry?.guest_count || '',
            notes: inquiry?.notes || '',
            items: [
              ...colorEntries.slice(0,numColors).map((ce,i)=>({
                description: `Балони ${ce.name||'Цвят '+(i+1)} ${ce.sizeInch}"`,
                category: 'Балони',
                quantity: calc.colorCounts[i]?.nr || 0,
                unit_price: 0,
                total: 0,
              })),
              ...(state.accents||[]).map(ac=>({
                description: `Акценти ${ac.name||ac.sizeInch+'"'}`,
                category: 'Балони',
                quantity: 0,
                unit_price: 0,
                total: 0,
              })),
              ...(state.foilBalloons||[]).map(f=>({
                description: f.name||'Фолио балон',
                category: 'Балони',
                quantity: f.qty||1,
                unit_price: 0,
                total: 0,
              })),
              ...(state.signs||[]).map(s=>({
                description: s.desc||'Надпис',
                category: 'Услуга',
                quantity: s.qty||1,
                unit_price: 0,
                total: 0,
              })),
              ...(state.customRates||[]).filter(r=>r.desc).map(r=>({
                description: r.desc,
                category: 'Услуга',
                quantity: r.qty||1,
                unit_price: 0,
                total: 0,
              })),
              ...(state.rates?.inflation?.enabled || state.rates?.install?.enabled ? [{
                description: 'Монтаж и демонтаж',
                category: 'Услуга',
                quantity: 1,
                unit_price: 0,
                total: 0,
              }] : []),
            ].filter(i => i.description),
            subtotal: +(calc.finalPrice||calc.salePrice).toFixed(2),
            total: +(calc.finalPrice||calc.salePrice).toFixed(2),
            discount: +(calc.discountAmount||0).toFixed(2),
            show_prices: false,
          }
          if (onCreateOffer) {
            onCreateOffer(offerData)
          }
        }} style={{padding:'12px 20px',background:'linear-gradient(135deg,#C6E6E3,#81BFB7)',border:'none',borderRadius:12,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13}}>
          📄 Създай оферта
        </button>
      </div>
    </div>
  )
}
