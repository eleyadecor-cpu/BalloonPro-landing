import React from 'react'
import { C, inp, pill, pillLight, Lbl, DateInput, TimeInput } from './shared.jsx'
import MapComponent from './MapComponent.jsx'

function SummaryBar({data}) {
  if (!data) return null;
  return (
    <div style={{background:C.l700, color:'#fff', padding:'8px 16px', display:'flex', gap:16, fontSize:11, flexWrap:'wrap', marginBottom:2}}>
      <span style={{opacity:.6}}>избрано:</span>
      {Object.entries(data).map(([k,v])=>(
        <span key={k}>{k}: <strong>{v}</strong></span>
      ))}
    </div>
  )
}

export default function BPEvent({state, set, calc, summaryData}) {
  const {
    inflateOnSite, travelKm, location, distError,
    eventDate, eventStart, eventEnd, 
    dismSameDay, dismDate, dismTime
  } = state

  const S = { background: '#fff', border: `1px solid ${C.l100}`, padding: '18px 20px', marginBottom: 2 }

  return (
    <div style={{paddingTop: 2}}>
      <SummaryBar data={summaryData} />

      {/* 1. ЛОКАЦИЯ С GOOGLE MAPS */}
      <div style={S}>
        <MapComponent 
          address={location} 
          onDistanceCalc={(addr) => {
            set('location', addr);
            set('distError', '✅ Адресът е потвърден');
          }} 
        />
        <div style={{marginTop: '15px'}}>
          <Lbl>🚗 Километри (отиване и връщане)</Lbl>
          <input 
            type="number" 
            style={inp} 
            value={travelKm} 
            onChange={e => set('travelKm', +e.target.value)} 
          />
        </div>
      </div>

      {/* 2. ВРЕМЕВА РАМКА */}
      <div style={S}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
          <div><Lbl>Дата</Lbl><DateInput style={inp} value={eventDate} onChange={v=>set('eventDate',v)} /></div>
          <div><Lbl>Начало</Lbl><TimeInput style={inp} value={eventStart} onChange={v=>set('eventStart',v)} /></div>
          <div><Lbl>Край</Lbl><TimeInput style={inp} value={eventEnd} onChange={v=>set('eventEnd',v)} /></div>
        </div>
      </div>

      {/* 3. ДЕМОНТАЖ */}
      <div style={S}>
        <div style={{fontSize:11, fontWeight:700, color:C.l400, marginBottom:12, textTransform:'uppercase'}}>Демонтаж</div>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button style={pillLight(dismSameDay, C.l400)} onClick={() => set('dismSameDay', true)}>Веднага след края</button>
          <button style={pillLight(!dismSameDay, C.l400)} onClick={() => set('dismSameDay', false)}>Друг ден/час</button>
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