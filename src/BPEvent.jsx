import React from 'react'
import { C, inp, pill, pillLight, Lbl, DateInput, TimeInput } from './shared.jsx'
import MapComponent from './MapComponent.jsx' // Импортираме новия компонент

function SummaryBar({data}) {
  return (
    <div style={{background:C.l700, color:'#fff', padding:'8px 16px', display:'flex', gap:16, fontSize:11, flexWrap:'wrap', marginBottom:2}}>
      <span style={{opacity:.6}}>избрано:</span>
      {Object.entries(data || {}).map(([k,v])=>(
        <span key={k}>{k}: <strong>{v}</strong></span>
      ))}
    </div>
  )
}

export default function BPEvent({state, set, calc, summaryData}) {
  const {
    inflateOnSite, travelKm, location, distError,
    eventDate, eventStart, eventEnd, 
    hasPhotoTime, photoTime, 
    dismSameDay, dismDate, dismTime
  } = state

  // Стил за картите
  const S = { background: '#fff', border: `1px solid ${C.l100}`, padding: '18px 20px', marginBottom: 2 }

  // Функцията, която се извиква, когато избереш адрес в Google Maps
  const handleLocationSelect = (address) => {
    set('location', address);
    // Тук Google ще попълни адреса. Ако имаш API Key за разстояние, ще сложи и км.
    set('distError', '✅ Адресът е потвърден');
  }

  return (
    <div style={{paddingTop: 2}}>
      <SummaryBar data={summaryData} />

      {/* 1. КЪДЕ СЕ РАБОТИ (С GOOGLE MAPS) */}
      <div style={S}>
        <MapComponent address={location} onDistanceCalc={handleLocationSelect} />
        
        <div style={{marginTop: '15px'}}>
          <Lbl>🚗 Ръчно въвеждане на километри (отиване и връщане)</Lbl>
          <input 
            type="number" 
            style={inp} 
            value={travelKm} 
            onChange={e => set('travelKm', +e.target.value)} 
            placeholder="Общо км..."
          />
          {distError && <div style={{fontSize:10, marginTop:5, color:C.l400}}>{distError}</div>}
        </div>
      </div>

      {/* 2. ТИП НАДУВАНЕ */}
      <div style={S}>
        <Lbl>Място на надуване</Lbl>
        <div style={{display:'flex', gap:8}}>
          <button style={pill(inflateOnSite)} onClick={()=>set('inflateOnSite', true)}>На място</button>
          <button style={pill(!inflateOnSite)} onClick={()=>set('inflateOnSite', false)}>В ателие (транспорт с бус)</button>
        </div>
      </div>

      {/* 3. ВРЕМЕВА РАМКА */}
      <div style={S}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
          <div><Lbl>Дата</Lbl><DateInput style={inp} value={eventDate} onChange={v=>set('eventDate',v)} /></div>
          <div><Lbl>Начало</Lbl><TimeInput style={inp} value={eventStart} onChange={v=>set('eventStart',v)} /></div>
          <div><Lbl>Край</Lbl><TimeInput style={inp} value={eventEnd} onChange={v=>set('eventEnd',v)} /></div>
        </div>
      </div>

      {/* 4. ДЕМОНТАЖ */}
      <div style={S}>
        <div style={{fontSize:11, fontWeight:700, color:C.l600, marginBottom:12}}>Демонтаж</div>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button style={pillLight(dismSameDay, C.l600)} onClick={() => set('dismSameDay', true)}>Веднага след събитието</button>
          <button style={pillLight(!dismSameDay, C.l600)} onClick={() => set('dismSameDay', false)}>Друг ден/час</button>
        </div>
        {!dismSameDay && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div><Lbl>Дата</Lbl><DateInput style={inp} value={dismDate} onChange={v=>set('dismDate',v)} /></div>
            <div><Lbl>Час</Lbl><TimeInput style={inp} value={dismTime} onChange={v=>set('dismTime',v)} /></div>
          </div>
        )}
      </div>
    </div>
  )
}