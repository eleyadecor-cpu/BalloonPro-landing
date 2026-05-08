import React from 'react'
import { C, inp, pill, pillLight, Lbl, DateInput, TimeInput } from './shared.jsx'
import MapComponent from './MapComponent'

// Малка лента за преглед на избраното до момента
function SummaryBar({data}) {
  return (
    <div style={{background:C.l700, color:'#fff', padding:'8px 16px', display:'flex', gap:16, fontSize:11, flexWrap:'wrap', marginBottom:2}}>
      <span style={{opacity:.6}}>избрано до тук:</span>
      {Object.entries(data).map(([k,v])=>(
        <span key={k}>{k}: <strong>{v}</strong></span>
      ))}
    </div>
  )
}

export default function BPEvent({state, set, calc, summaryData}) {
  const {
    inflateOnSite, travelMin, travelKm, location, distError,
    eventDate, eventStart, eventEnd, 
    hasPhotoTime, photoTime, 
    dismSameDay, dismDate, dismTime
  } = state

  // Стил за белите контейнери (карти)
  const S = {
    background: '#fff',
    border: `1px solid ${C.l100}`,
    padding: '18px 20px',
    marginBottom: 2
  }

  return (
    <div style={{paddingTop: 2}}>
      <SummaryBar data={summaryData} />

      {/* 1. КЪДЕ СЕ РАБОТИ */}
      <div style={S}>
        <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:C.l600, marginBottom:12}}>
          Подготовка на декорацията
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
          {[
            {v: false, ico: '🏠', l: 'Предварително', s: 'В студио / вкъщи'},
            {v: true, ico: '📍', l: 'На локация', s: 'Надуване на място'}
          ].map(opt => (
            <button 
              key={String(opt.v)} 
              style={{
                ...pillLight(inflateOnSite === opt.v), 
                padding: '14px 12px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                gap: 3, 
                textAlign: 'left'
              }}
              onClick={() => set('inflateOnSite', opt.v)}
            >
              <span style={{fontWeight: 700}}>{opt.ico} {opt.l}</span>
              <span style={{fontSize: 10, opacity: .8}}>{opt.s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. ЛОКАЦИЯ (GOOGLE MAPS) */}
      <div style={S}>
        <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:C.l600, marginBottom:12}}>
          Локация и Транспорт
        </div>
        
        {/* Интегрираният Google Maps компонент */}
        <MapComponent 
          address={location} 
          onDistanceCalc={(fullAddress) => {
            set('location', fullAddress);
            set('distError', '✅ Адресът е потвърден');
          }} 
        />

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginTop:15}}>
          <div>
            <Lbl>🚗 Километри (общо отиване и връщане)</Lbl>
            <input 
              type="number" 
              style={inp} 
              value={travelKm} 
              onChange={e => set('travelKm', +e.target.value)} 
              placeholder="0" 
            />
            <div style={{fontSize:10, color:C.l600, marginTop:6, background:C.l50, padding:'4px 8px', borderRadius:4}}>
               Амортизация (0.35лв/км): <strong>{(travelKm * 0.35).toFixed(2)} лв.</strong>
            </div>
          </div>
          <div>
            <Lbl>⏱️ Път в минути (общо)</Lbl>
            <input 
              type="number" 
              style={inp} 
              value={travelMin} 
              onChange={e => set('travelMin', +e.target.value)} 
              placeholder="0" 
            />
          </div>
        </div>
        {distError && <div style={{fontSize:10, color: distError.includes('✅') ? 'green' : 'red', marginTop:5}}>{distError}</div>}
      </div>

      {/* 3. ВРЕМЕВА ЛИНИЯ */}
      <div style={S}>
        <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:C.l600, marginBottom:12}}>
          Време на събитието
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom: 15}}>
          <div><Lbl>Дата</Lbl><DateInput style={inp} value={eventDate} onChange={v => set('eventDate', v)} /></div>
          <div><Lbl>Начало</Lbl><TimeInput style={inp} value={eventStart} onChange={v => set('eventStart', v)} /></div>
          <div><Lbl>Край</Lbl><TimeInput style={inp} value={eventEnd} onChange={v => set('eventEnd', v)} /></div>
        </div>

        <div style={{borderTop: `1px solid ${C.l50}`, paddingTop: 15, marginBottom: 15}}>
          <div style={{fontSize:11, fontWeight:700, color:C.l600, marginBottom:12}}>⏱ Добра времева практика</div>
          <Lbl>Започни по-рано с (резерв преди старт)</Lbl>
          <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:4}}>
            {[0,5,10,15,20,30].map(m=>(
              <button key={m} style={pillLight(state.bufferBefore===m, C.l600)} onClick={()=>set('bufferBefore',m)}>
                {m===0?'Без':m+' мин'}
              </button>
            ))}
          </div>
          <div style={{fontSize:9, color:C.gray, marginBottom:12}}>Буфер за непредвидени ситуации</div>

          <Lbl>Завърши декора X мин преди събитието</Lbl>
          <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:4}}>
            {[0,5,10,15,20,30].map(m=>(
              <button key={m} style={pillLight(state.bufferFinish===m, C.l600)} onClick={()=>set('bufferFinish',m)}>
                {m===0?'Без':m+' мин'}
              </button>
            ))}
          </div>
          <div style={{fontSize:9, color:C.gray, marginBottom:12}}>Декорът е готов преди гостите да пристигнат</div>
        </div>

        <div style={{borderTop: `1px solid ${C.l50}`, paddingTop: 15}}>
          <Lbl>📸 Снимки на готовия декор</Lbl>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            <button style={pillLight(!hasPhotoTime, C.l600)} onClick={() => set('hasPhotoTime', false)}>Без време за снимки</button>
            {[5, 10, 15, 20, 30].map(m => (
              <button 
                key={m} 
                style={pillLight(hasPhotoTime && photoTime === m, C.l600)} 
                onClick={() => { set('hasPhotoTime', true); set('photoTime', m) }}
              >
                {m} мин.
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ДЕМОНТАЖ */}
      <div style={S}>
        <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:C.l600, marginBottom:12}}>
          Демонтаж
        </div>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button style={pillLight(dismSameDay, C.l600)} onClick={() => set('dismSameDay', true)}>Веднага след края</button>
          <button style={pillLight(!dismSameDay, C.l600)} onClick={() => set('dismSameDay', false)}>Друг ден/час</button>
        </div>
        {!dismSameDay && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div><Lbl>Дата на демонтаж</Lbl><DateInput style={inp} value={dismDate} onChange={v => set('dismDate', v)} /></div>
            <div><Lbl>Час на демонтаж</Lbl><TimeInput style={inp} value={dismTime} onChange={v => set('dismTime', v)} /></div>
          </div>
        )}
      </div>
    </div>
  )
}