import React from 'react'
import { C,inp,pill,pillLight,Lbl,fmt } from './shared.jsx'

function SummaryBar({data}) {
  return (
    <div style={{background:C.l700,color:'#fff',padding:'8px 16px',display:'flex',gap:16,fontSize:11,flexWrap:'wrap',marginBottom:2}}>
      <span style={{opacity:.6}}>избрано:</span>
      {Object.entries(data).map(([k,v])=>(<span key={k}>{k}: <strong>{v}</strong></span>))}
    </div>
  )
}

function InfoBox({children,color=C.l600,bg=C.l50}) {
  return <div style={{fontSize:10,color,background:bg,padding:'7px 12px',marginBottom:8,lineHeight:1.5}}>{children}</div>
}

export default function BPRates({state,set,calc,summaryData}) {
  const {rates,travelKm,fuelPerLiter,fuelPer100km,amortPerKm,margin,
         setupMinFixed,adjustMinFixed,attachSecPerCluster,dismantlePercent} = state
  const {tInflate,tFoil,tOnsite,tDismantle,tAttach,lInfl,lInst,lDism,lTrans,fuelCost,amortCost} = calc
  const updRate = (k,p) => set('rates',{...rates,[k]:{...rates[k],...p}})
  const S = {background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}

  const totalLabor = lInfl+lInst+lDism+lTrans+fuelCost+amortCost

  return (
    <div style={{paddingTop:2}}>
      <SummaryBar data={summaryData} />

      <InfoBox color={C.l700} bg={C.l50}>
        💡 Включи само услугите за които искаш ставка. Всичко е незадължително.
      </InfoBox>

      {/* ── СТАВКИ ── */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:14}}>Ставки за труд</div>
        {[
          {
            key:'inflation',
            label:'🏠 Надуване',
            info:`~${fmt(tInflate+tFoil)} = ${((tInflate+tFoil)/3600).toFixed(1)} ч`,
            breakdown:`Латекс балони: ${fmt(tInflate)} · Фолио: ${fmt(tFoil)}`,
            cost:lInfl,
          },
          {
            key:'install',
            label:'📍 Монтаж',
            info:`~${fmt(tOnsite)} = ${(tOnsite/3600).toFixed(1)} ч`,
            breakdown:`Закачане (${fmt(tAttach)}) + Разопаковане (${setupMinFixed||15}мин) + Корекции (${adjustMinFixed||10}мин) + Надписи/услуги`,
            cost:lInst,
          },
          {
            key:'dismantle',
            label:'🔧 Демонтаж',
            info:`~${fmt(tDismantle)} = ${(tDismantle/3600).toFixed(1)} ч`,
            breakdown:`${dismantlePercent||50}% от цялото монтажно време (закачане + разопаковане + надписи = ${fmt(calc.tOnsite)})`,
            cost:lDism,
          },
        ].map(({key,label,info,breakdown,cost})=>(
          <div key={key} style={{marginBottom:8,padding:'12px 14px',background:rates[key].enabled?C.l50:'#fafafa',border:`1px solid ${C.l100}`}}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <input type="checkbox" checked={rates[key].enabled} onChange={e=>updRate(key,{enabled:e.target.checked})}
                style={{width:16,height:16,accentColor:C.l600,cursor:'pointer',flexShrink:0}} />
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{label} — {info}</div>
                <div style={{fontSize:9,color:C.gray,marginTop:2}}>{breakdown}</div>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <input style={{...inp,width:70}} type="number" step="0.5"
                  value={rates[key].value} disabled={!rates[key].enabled}
                  onChange={e=>updRate(key,{value:+e.target.value})} />
                <span style={{fontSize:11,color:C.gray}}>€/ч</span>
              </div>
              {rates[key].enabled && <div style={{fontSize:13,fontWeight:700,color:C.l700,minWidth:64,textAlign:'right'}}>€{cost.toFixed(2)}</div>}
            </div>
          </div>
        ))}

        {/* TRANSPORT */}
        <div style={{marginBottom:0,padding:'12px 14px',background:rates.transport.enabled?C.l50:'#fafafa',border:`1px solid ${C.l100}`}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <input type="checkbox" checked={rates.transport.enabled} onChange={e=>updRate('transport',{enabled:e.target.checked})}
              style={{width:16,height:16,accentColor:C.l600,cursor:'pointer',flexShrink:0}} />
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600}}>🚗 Транспорт (такса/км)</div>
              <div style={{fontSize:9,color:C.gray,marginTop:2}}>{travelKm} км × 2 = {travelKm*2} км обща дистанция</div>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <input style={{...inp,width:70}} type="number" step="0.05"
                value={rates.transport.value} disabled={!rates.transport.enabled}
                onChange={e=>updRate('transport',{value:+e.target.value})} />
              <span style={{fontSize:11,color:C.gray}}>€/км</span>
            </div>
            {rates.transport.enabled && <div style={{fontSize:13,fontWeight:700,color:C.l700,minWidth:64,textAlign:'right'}}>€{lTrans.toFixed(2)}</div>}
          </div>
        </div>
      </div>

      {/* ── ГОРИВО + АМОРТИЗАЦИЯ ── */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#81BFB7',marginBottom:6}}>⛽ Гориво + Амортизация</div>
        <InfoBox color='#81BFB7' bg='#F0F9F8'>
          Тези разходи се добавят автоматично към себестойността. Не е нужно да ги включваш в ставката за транспорт.
        </InfoBox>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
          <div>
            <Lbl>Цена гориво (€/л)</Lbl>
            <input style={inp} type="number" step="0.01" value={fuelPerLiter} onChange={e=>set('fuelPerLiter',+e.target.value)} />
          </div>
          <div>
            <Lbl>Разход (л/100км)</Lbl>
            <input style={inp} type="number" step="0.5" value={fuelPer100km} onChange={e=>set('fuelPer100km',+e.target.value)} />
          </div>
          <div>
            <Lbl>Амортизация (€/км)</Lbl>
            <input style={inp} type="number" step="0.01" value={amortPerKm} onChange={e=>set('amortPerKm',+e.target.value)} />
            <div style={{fontSize:9,color:C.gray,marginTop:2}}>~€0.05-0.15/км</div>
          </div>
        </div>
        {/* Visual breakdown */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0,border:`1px solid ${C.l100}`}}>
          {[
            ['⛽ Гориво', `€${fuelCost.toFixed(2)}`, `${travelKm*2}км × ${fuelPer100km}л/100 × €${fuelPerLiter}/л`],
            ['🔧 Амортизация', `€${amortCost.toFixed(2)}`, `${travelKm*2}км × €${amortPerKm}/км`],
            ['Общо разход за път', `€${(fuelCost+amortCost).toFixed(2)}`, 'добавя се към себестойността'],
          ].map(([l,v,s],i)=>(
            <div key={i} style={{textAlign:'center',padding:'12px 8px',background:i===2?'#81BFB720':C.l50,borderRight:i<2?`1px solid ${C.l100}`:'none'}}>
              <div style={{fontSize:9,textTransform:'uppercase',color:'#81BFB7',fontWeight:600,marginBottom:3}}>{l}</div>
              <div style={{fontSize:18,fontWeight:700,color:'#81BFB7'}}>{v}</div>
              <div style={{fontSize:9,color:C.gray,marginTop:2}}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── НАСТРОЙКИ ВРЕМЕНА ── */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:6}}>⚙️ Настройки на времената</div>
        <InfoBox>Нагласи според твоя реален работен процес.</InfoBox>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <Lbl>Разопаковане/подготовка (мин)</Lbl>
            <input style={inp} type="number" min={0} step="5"
              value={setupMinFixed||15} onChange={e=>set('setupMinFixed',+e.target.value)} />
            <div style={{fontSize:9,color:C.gray,marginTop:2}}>Пристигане, разопаковане, подготовка на пространството</div>
          </div>
          <div>
            <Lbl>Финални корекции (мин)</Lbl>
            <input style={inp} type="number" min={0} step="5"
              value={adjustMinFixed||10} onChange={e=>set('adjustMinFixed',+e.target.value)} />
            <div style={{fontSize:9,color:C.gray,marginTop:2}}>Последни touches, проверка на декора</div>
          </div>
          <div>
            <Lbl>Закачане на 1 букет (сек)</Lbl>
            <input style={inp} type="number" min={10} step="5"
              value={attachSecPerCluster||45} onChange={e=>set('attachSecPerCluster',+e.target.value)} />
            <div style={{fontSize:9,color:C.gray,marginTop:2}}>Средно ~30-60 сек/букет в зависимост от повърхността</div>
          </div>
          <div>
            <Lbl>Демонтаж = X% от монтажа</Lbl>
            <input style={inp} type="number" min={20} max={100} step="5"
              value={dismantlePercent||50} onChange={e=>set('dismantlePercent',+e.target.value)} />
            <div style={{fontSize:9,color:C.gray,marginTop:2}}>50% = включва разопаковане, надписи, опаковане</div>
          </div>
        </div>
        {/* Preview */}
        <div style={{background:C.l100,padding:'10px 14px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,textAlign:'center'}}>
          {[
            ['Надуване', fmt(calc.tInflate+calc.tFoil)],
            ['Монтаж', fmt(calc.tOnsite)],
            ['Демонтаж', fmt(calc.tDismantle)],
            ['Пътуване', `${(state.travelMin||30)*2} мин`],
          ].map(([l,v])=>(
            <div key={l}>
              <div style={{fontSize:9,textTransform:'uppercase',color:C.l600,fontWeight:600,marginBottom:3}}>{l}</div>
              <div style={{fontSize:14,fontWeight:700,color:C.l700}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── МАРЖ ── */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#81BFB7',marginBottom:12}}>💰 Марж</div>
        <Lbl>Марж върху общата себестойност (материали + труд + гориво)</Lbl>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
          {[0,20,30,40,50,60].map(m=>(
            <button key={m} style={pillLight(margin===m,'#81BFB7')} onClick={()=>set('margin',m)}>
              {m===0?'Без':m+'%'}
            </button>
          ))}
        </div>
        {margin>0 && (
          <InfoBox color='#81BFB7' bg='#C6E6E3'>
            При {margin}% марж: себестойност €X → цена за клиента €X ÷ {(1-margin/100).toFixed(2)} = €{(1/(1-margin/100)).toFixed(2)}× повече
          </InfoBox>
        )}
      </div>

      {/* TOTAL SUMMARY */}
      <div style={{background:C.l700,color:'#fff',padding:'16px 20px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0}}>
        {[
          ['Труд общо', `€${(lInfl+lInst+lDism+lTrans).toFixed(2)}`],
          ['Гориво + Амортизация', `€${(fuelCost+amortCost).toFixed(2)}`],
          ['Всичко труд + разходи', `€${totalLabor.toFixed(2)}`],
        ].map(([l,v],i)=>(
          <div key={i} style={{textAlign:'center',padding:'0 8px',borderRight:i<2?'1px solid rgba(255,255,255,.2)':'none'}}>
            <div style={{fontSize:9,opacity:.7,textTransform:'uppercase',letterSpacing:'.8px',marginBottom:4}}>{l}</div>
            <div style={{fontSize:18,fontWeight:700}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
