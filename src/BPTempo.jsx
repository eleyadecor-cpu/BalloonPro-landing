import React from 'react'
import {
  C,inp,pill,pillLight,TEMPO_PRESETS,
  Lbl,CardTitle,Card,ScriptH,InfoBand,DateInput,TimeInput,
  fmt,
} from './shared.jsx'

export default function BPTempo({state, set, viewEvent, tInflate, tFoil, tSign, tOnsite}) {
  const {
    tempo,customTempo,inflateOnSite,
    bufferBefore,bufferFinish,photoTime,hasPhotoTime,
    eventDate,eventStart,eventEnd,
    dismSameDay,dismDate,dismTime,
    travelMin,travelKm,location,
    calcingDist,distError,
  } = state

  const t = tempo==='custom' ? customTempo : (TEMPO_PRESETS[tempo]||TEMPO_PRESETS.medium)

  const calcDistance = () => {
    if (!location.trim()) { set('distError','Въведи локация първо!'); return }
    set('calcingDist',true); set('distError','')
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`)
      .then(r=>r.json())
      .then(data=>{
        if (!data.length) { set('distError','Локацията не е намерена'); set('calcingDist',false); return }
        const {lat,lon}=data[0]
        navigator.geolocation.getCurrentPosition(pos=>{
          const {latitude,longitude}=pos.coords
          fetch(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${lon},${lat}?overview=false`)
            .then(r=>r.json())
            .then(rd=>{
              if (rd.routes?.[0]) {
                const km=Math.round(rd.routes[0].distance/1000)
                const mins=Math.round(rd.routes[0].duration/60)
                set('travelKm',km); set('travelMin',mins)
                set('distError',`✅ ${km} км · ${mins} мин`)
              } else set('distError','Не може да се изчисли маршрут')
              set('calcingDist',false)
            })
        },()=>{set('distError','Не е разрешен достъп до местоположение');set('calcingDist',false)})
      })
      .catch(()=>{set('distError','Грешка при изчисляване');set('calcingDist',false)})
  }

  return (
    <div>
      {!viewEvent && (
        <div>
          <ScriptH text="Темпо" sub="стъпка 3 — работно темпо" />
          <Card>
            <CardTitle>Работно темпо</CardTitle>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
          {Object.entries(TEMPO_PRESETS).map(([k,v])=>(
            <button key={k} style={pillLight(tempo===k,'#c0892b')} onClick={()=>set('tempo',k)}>{v.label}</button>
          ))}
          <button style={pillLight(tempo==='custom','#c0892b')} onClick={()=>set('tempo','custom')}>Моето ⚙️</button>
        </div>
        {tempo!=='custom' && (
          <div style={{background:'#f5f0fb',padding:'12px 16px',fontSize:11}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,color:'#4e3580',marginBottom:8}}>
              <span>5" (13см) двойка:</span><strong>{t.pair5} сек</strong>
              <span>10" (26см) двойка:</span><strong>{t.pair10} сек</strong>
              <span>16" (41см) балон:</span><strong>{Math.round(t.b18*0.85)} сек</strong>
              <span>18" (46см) балон:</span><strong>{t.b18} сек</strong>
              <span>24" (61см) балон:</span><strong>{Math.round(t.b18*1.3)} сек</strong>
              <span>36" (91см) балон:</span><strong>{Math.round(t.b18*1.8)} сек</strong>
              <span>Сглобяване/букет:</span><strong>{t.asm} сек</strong>
            </div>
            <div style={{fontSize:9,color:'#6547a0'}}>
              Базирано на: 100 балона 11" = 20мин (напреднал) / 30мин (средно) / 45мин (начинаещ).<br/>
              ⚠️ Стойностите включват: надуване + завързване + сглобяване в двойки. Само надуването с ел. помпа е ~2-4 сек/балон.
            </div>
          </div>
        )}
        {tempo==='custom' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[['pair5','5" (13см) двойка (сек)'],['pair10','10" (26см) двойка (сек)'],['b18','18" (46см) балон (сек)'],['asm','Сглобяване/букет (сек)']].map(([k,l])=>(
              <div key={k}><Lbl>{l}</Lbl><input style={inp} type="number" value={customTempo[k]} onChange={e=>set('customTempo',{...customTempo,[k]:+e.target.value})} /></div>
            ))}
          </div>
        )}
      </Card>
        </div>
      )}

      {/* WHERE INFLATE — only shown in event view */}
      {viewEvent && (
        <div>
          <ScriptH text="Събитие" sub="детайли на събитието и добра практика" />
          <Card>
            <CardTitle>Детайли на събитието</CardTitle>
        <Lbl>Къде се надуват и сглобяват балоните?</Lbl>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {[{v:false,ico:'🏠',l:'Предварително',s:'Надуваш у дома/студио, после пътуваш'},{v:true,ico:'📍',l:'На локация',s:'Пристигаш, надуваш и монтираш всичко там'}].map(opt=>(
            <button key={String(opt.v)} style={{...pillLight(inflateOnSite===opt.v),padding:'12px 14px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:3}} onClick={()=>set('inflateOnSite',opt.v)}>
              <span style={{fontWeight:700}}>{opt.ico} {opt.l}</span>
              <span style={{fontSize:10,opacity:.8}}>{opt.s}</span>
            </button>
          ))}
        </div>

        {/* GOOD PRACTICE */}
        <div style={{borderTop:'1px solid #e8ddf5',paddingTop:16,marginBottom:16}}>
          <div style={{fontFamily:"'TT Lovelies Script','Monotype Corsiva',cursive",fontSize:22,color:C.l600,marginBottom:12}}>Добра времева практика</div>
          <Lbl>Започни по-рано с (резерв преди старт)</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
            {[0,5,10,15,20,30].map(m=>(
              <button key={m} style={pillLight(bufferBefore===m,C.l700)} onClick={()=>set('bufferBefore',m)}>{m===0?'Без':m+' мин'}</button>
            ))}
            <input type="number" min={0} placeholder="мин" style={{...inp,width:60,padding:'7px 8px'}} onChange={e=>e.target.value&&set('bufferBefore',+e.target.value)} />
          </div>
          <div style={{fontSize:9,color:C.gray,marginBottom:12}}>Буфер за непредвидени ситуации</div>

          <Lbl>Завърши декора X мин преди събитието</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
            {[0,5,10,15,20,30].map(m=>(
              <button key={m} style={pillLight(bufferFinish===m,C.l700)} onClick={()=>set('bufferFinish',m)}>{m===0?'Без':m+' мин'}</button>
            ))}
            <input type="number" min={0} placeholder="мин" style={{...inp,width:60,padding:'7px 8px'}} onChange={e=>e.target.value&&set('bufferFinish',+e.target.value)} />
          </div>
          <div style={{fontSize:9,color:C.gray,marginBottom:12}}>Декорът е готов преди гостите да пристигнат</div>

          <Lbl>📸 Снимки на завършения декор</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
            <button style={pillLight(!hasPhotoTime,'#3d7a56')} onClick={()=>set('hasPhotoTime',false)}>Без снимки</button>
            {[5,10,15,20].map(m=>(
              <button key={m} style={pillLight(hasPhotoTime&&photoTime===m,'#3d7a56')} onClick={()=>{set('hasPhotoTime',true);set('photoTime',m)}}>{m} мин</button>
            ))}
            <input type="number" min={1} placeholder="мин" style={{...inp,width:60,padding:'7px 8px'}} onChange={e=>{if(e.target.value){set('hasPhotoTime',true);set('photoTime',+e.target.value)}}} />
          </div>
          <div style={{fontSize:9,color:C.gray}}>Появява се преди края в timeline</div>
        </div>

        {/* DATE/TIME */}
        <div style={{borderTop:'1px solid #e8ddf5',paddingTop:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
            <div><Lbl>Дата</Lbl><DateInput style={inp} value={eventDate} onChange={v=>set('eventDate',v)} /></div>
            <div><Lbl>Начален час</Lbl><TimeInput style={inp} value={eventStart} onChange={v=>set('eventStart',v)} /></div>
            <div><Lbl>Краен час</Lbl><TimeInput style={inp} value={eventEnd} onChange={v=>set('eventEnd',v)} /></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div><Lbl>Пътуване (мин)</Lbl><input style={inp} type="number" min={0} value={travelMin} onChange={e=>set('travelMin',+e.target.value)} /></div>
            <div><Lbl>Км (за транспорт)</Lbl><input style={inp} type="number" min={0} value={travelKm} onChange={e=>set('travelKm',+e.target.value)} /></div>
          </div>
          <Lbl>Локация</Lbl>
          <div style={{display:'flex',gap:8,marginBottom:4}}>
            <input style={{...inp,flex:1}} placeholder="Зала / Адрес / Град" value={location} onChange={e=>set('location',e.target.value)} />
            <button style={pill(false)} onClick={calcDistance} disabled={calcingDist}>{calcingDist?'⏳...':'📍 Изчисли км'}</button>
          </div>
          {distError && <div style={{fontSize:10,marginBottom:8,color:distError.startsWith('✅')?'#3d7a56':'#c0392b',fontWeight:600}}>{distError}</div>}

          <div style={{borderTop:'1px solid #e8ddf5',paddingTop:14,marginTop:8}}>
            <Lbl>Демонтаж</Lbl>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <button style={pillLight(dismSameDay,'#3d7a56')} onClick={()=>set('dismSameDay',true)}>Същата като края</button>
              <button style={pillLight(!dismSameDay,'#3d7a56')} onClick={()=>set('dismSameDay',false)}>Различна дата/час</button>
            </div>
            {!dismSameDay && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><Lbl>Дата на демонтаж</Lbl><DateInput style={inp} value={dismDate} onChange={v=>set('dismDate',v)} /></div>
                <div><Lbl>Час на демонтаж</Lbl><TimeInput style={inp} value={dismTime} onChange={v=>set('dismTime',v)} /></div>
              </div>
            )}
          </div>
        </div>
      </Card>
        </div>
      )}
    </div>
  )
}
