import React from 'react'
import { C,inp,pill,pillLight,Lbl,Card,CardTitle,DateInput,TimeInput } from './shared.jsx'

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

export default function BPEvent({state,set,calc,summaryData}) {
  const {inflateOnSite,bufferBefore,bufferFinish,photoTime,hasPhotoTime,eventDate,eventStart,eventEnd,dismSameDay,dismDate,dismTime,travelMin,travelKm,location,distError} = state

  const calcDistance = () => {
    if (!location.trim()){set('distError','Въведи локация!');return}
    set('distError','⏳ Изчислява...')
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`)
      .then(r=>r.json()).then(data=>{
        if(!data.length){set('distError','Локацията не е намерена');return}
        const {lat,lon}=data[0]
        navigator.geolocation.getCurrentPosition(pos=>{
          const {latitude,longitude}=pos.coords
          fetch(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${lon},${lat}?overview=false`)
            .then(r=>r.json()).then(rd=>{
              if(rd.routes?.[0]){
                const km=Math.round(rd.routes[0].distance/1000),mins=Math.round(rd.routes[0].duration/60)
                set('travelKm',km);set('travelMin',mins);set('distError',`✅ ${km} км · ${mins} мин`)
              } else set('distError','Не може да се изчисли')
            })
        },()=>set('distError','Не е разрешен достъп до местоположение'))
      }).catch(()=>set('distError','Грешка'))
  }

  const S = {background:'#fff',border:`1px solid ${C.l100}`,padding:'18px 20px',marginBottom:2}

  return (
    <div style={{paddingTop:2}}>
      <SummaryBar data={summaryData} />

      {/* WHERE */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:12}}>Къде се надуват балоните?</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          {[{v:false,ico:'🏠',l:'Предварително',s:'Надуваш у дома/студио'},{v:true,ico:'📍',l:'На локация',s:'Пристигаш и надуваш там'}].map(opt=>(
            <button key={String(opt.v)} style={{...pillLight(inflateOnSite===opt.v),padding:'14px 12px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:3,textAlign:'left'}}
              onClick={()=>set('inflateOnSite',opt.v)}>
              <span style={{fontWeight:700}}>{opt.ico} {opt.l}</span>
              <span style={{fontSize:10,opacity:.8}}>{opt.s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DATE/TIME + LOCATION */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:12}}>Дата, час и локация</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
          <div><Lbl>Дата</Lbl><DateInput style={inp} value={eventDate} onChange={v=>set('eventDate',v)} /></div>
          <div><Lbl>Начален час</Lbl><TimeInput style={inp} value={eventStart} onChange={v=>set('eventStart',v)} /></div>
          <div><Lbl>Краен час</Lbl><TimeInput style={inp} value={eventEnd} onChange={v=>set('eventEnd',v)} /></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div><Lbl>Пътуване (мин)</Lbl><input style={inp} type="number" min={0} value={travelMin} onChange={e=>set('travelMin',+e.target.value)} /></div>
          <div><Lbl>Км</Lbl><input style={inp} type="number" min={0} value={travelKm} onChange={e=>set('travelKm',+e.target.value)} /></div>
        </div>
        <Lbl>Локация</Lbl>
        <div style={{display:'flex',gap:8,marginBottom:4}}>
          <input style={{...inp,flex:1}} placeholder="Зала / Адрес / Град" value={location} onChange={e=>set('location',e.target.value)} />
          <button style={pill(false)} onClick={calcDistance}>📍 Изчисли км</button>
        </div>
        {distError && <div style={{fontSize:10,color:distError.startsWith('✅')?'#3d7a56':'#c0392b',fontWeight:600,marginBottom:8}}>{distError}</div>}
      </div>

      {/* GOOD PRACTICE */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:16}}>⏰ Добра времева практика</div>
        <div style={{marginBottom:14}}>
          <Lbl>Започни по-рано (резерв)</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[0,5,10,15,20,30].map(m=>(
              <button key={m} style={pillLight(bufferBefore===m)} onClick={()=>set('bufferBefore',m)}>{m===0?'Без':m+' мин'}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <Lbl>Завърши X мин преди събитието</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[0,5,10,15,20,30].map(m=>(
              <button key={m} style={pillLight(bufferFinish===m)} onClick={()=>set('bufferFinish',m)}>{m===0?'Без':m+' мин'}</button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>📸 Снимки на декора</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <button style={pillLight(!hasPhotoTime,'#3d7a56')} onClick={()=>set('hasPhotoTime',false)}>Без</button>
            {[5,10,15,20].map(m=>(
              <button key={m} style={pillLight(hasPhotoTime&&photoTime===m,'#3d7a56')} onClick={()=>{set('hasPhotoTime',true);set('photoTime',m)}}>{m} мин</button>
            ))}
          </div>
        </div>
      </div>

      {/* DISMANTLE */}
      <div style={S}>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:C.l600,marginBottom:12}}>Демонтаж</div>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
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
  )
}
