import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const DAYS = ['П','В','С','Ч','П','С','Н']
const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']
const WEEK_FULL = ['Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота','Неделя']

const COLORS = {
  montage:   { bg: '#F3A2BE', color: '#fff',     label: '🎈 Монтаж'   },
  dismantle: { bg: '#81BFB7', color: '#fff',     label: '🔧 Демонтаж' },
  task:      { bg: '#FFD3DD', color: '#c0392b',  label: '✅ Задача'   },
}

const PRIORITY_COLOR = { low:'#81BFB7', normal:'#F3A2BE', high:'#c0892b', urgent:'#c0392b' }

const toISO = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
const todayISO = new Date().toISOString().slice(0,10)

const card = {
  background: 'rgba(255,255,255,0.85)',
  borderRadius: 20,
  border: '1px solid rgba(243,162,190,0.2)',
  padding: 16,
}

export default function CalendarPage({ onBack, initialDate, myDay }) {
  const [view, setView] = useState(myDay ? 'day' : 'month')
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [offers, setOffers] = useState([])
  const [tasks, setTasks] = useState([])
  const [popup, setPopup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const [off, tsk] = await Promise.all([
      supabase.from('offers').select('*, clients(name, phone)').eq('status','accepted'),
      supabase.from('tasks').select('*').order('due_date'),
    ])
    setOffers(off.data || [])
    setTasks(tsk.data || [])
    setLoading(false)
  }

  const toggleTask = async (id, status) => {
    const newStatus = status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    loadData()
  }

  // Build events
  const buildEvents = () => {
    const events = []
    offers.forEach(offer => {
      if (!offer.event_date) return
      events.push({
        id: `montage-${offer.id}`,
        type: 'montage',
        date: offer.event_date,
        time: offer.event_time || '',
        title: offer.clients?.name || '—',
        subtitle: offer.event_type || '',
        offer,
      })
      if (offer.dismantling) {
        events.push({
          id: `dismantle-${offer.id}`,
          type: 'dismantle',
          date: offer.event_date,
          time: offer.event_end || '',
          title: `Демонтаж — ${offer.clients?.name || '—'}`,
          subtitle: offer.event_type || '',
          offer,
        })
      }
    })
    tasks.forEach(task => {
      if (!task.due_date) return
      events.push({
        id: `task-${task.id}`,
        type: 'task',
        date: task.due_date,
        time: task.due_time || '',
        title: task.title,
        subtitle: task.related_client || '',
        task,
        done: task.status === 'done',
        priority: task.priority,
      })
    })
    return events
  }

  const events = buildEvents()
  const getEventsForDate = (iso) => events.filter(e => e.date === iso)

  // ── Month helpers ──
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // ── Week helpers ──
  const getWeekStart = (d) => {
    const dt = new Date(d)
    const day = dt.getDay()
    dt.setDate(dt.getDate() - (day === 0 ? 6 : day - 1))
    return dt
  }
  const HOURS = Array.from({length:18}, (_,i) => i + 6) // 06:00–23:00

  // ── Navigation ──
  const prev = () => {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() - 1)
    else if (view === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    setCurrentDate(d)
  }
  const next = () => {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() + 1)
    else if (view === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    setCurrentDate(d)
  }

  const navLabel = () => {
    if (view === 'month') return `${MONTHS[month]} ${year}`
    if (view === 'week') {
      const ws = getWeekStart(currentDate)
      const we = new Date(ws); we.setDate(we.getDate() + 6)
      return `${ws.getDate()} — ${we.getDate()} ${MONTHS[we.getMonth()]} ${we.getFullYear()}`
    }
    const p = currentDate.toISOString().slice(0,10).split('-')
    return `${p[2]}.${p[1]}.${p[0]}`
  }

  // ── EventChip ──
  const EventChip = ({ event, small }) => {
    const col = COLORS[event.type]
    return (
      <div
        onClick={e => { e.stopPropagation(); setPopup(event) }}
        style={{
          background: col.bg,
          color: col.color,
          fontSize: small ? 9 : 11,
          padding: small ? '2px 5px' : '4px 8px',
          borderRadius: 6,
          marginBottom: 2,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textDecoration: event.done ? 'line-through' : 'none',
          opacity: event.done ? 0.55 : 1,
          fontWeight: 600,
          border: event.priority === 'urgent' ? '1.5px solid #c0392b' : 'none',
        }}
      >
        {event.time && <span style={{opacity:0.75}}>{event.time.slice(0,5)} </span>}
        {event.title}
      </div>
    )
  }

  // ── MONTH VIEW ──
  const MonthView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 1,
      background: '#C6E6E3',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid #C6E6E3',
    }}>
      {DAYS.map(d => (
        <div key={d} style={{ background:'#F0F9F8', padding:'10px 6px', textAlign:'center', fontSize:11, fontWeight:700, color:'#81BFB7' }}>{d}</div>
      ))}
      {Array(offset).fill(null).map((_,i) => <div key={`e${i}`} style={{ background:'#fafafa', minHeight:110 }} />)}
      {Array(daysInMonth).fill(null).map((_,i) => {
        const day = i + 1
        const iso = toISO(year, month, day)
        const dayEvents = getEventsForDate(iso)
        const isToday = iso === todayISO
        return (
          <div
            key={day}
            onClick={() => { setCurrentDate(new Date(iso)); setView('day') }}
            style={{
              background: '#fff',
              minHeight: 110,
              padding: '6px 4px',
              cursor: 'pointer',
              borderTop: isToday ? '3px solid #F3A2BE' : '1px solid transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFF8FA'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <div style={{
              fontSize: 12, fontWeight: isToday ? 900 : 400,
              color: isToday ? '#fff' : '#3a2a35',
              background: isToday ? '#F3A2BE' : 'transparent',
              borderRadius: '50%', width: 24, height: 24,
              lineHeight: '24px', textAlign: 'center',
              margin: '0 auto 4px',
            }}>{day}</div>
            {dayEvents.slice(0,3).map(ev => <EventChip key={ev.id} event={ev} small />)}
            {dayEvents.length > 3 && (
              <div style={{ fontSize:9, color:'#81BFB7', fontWeight:700, paddingLeft:4 }}>+{dayEvents.length-3} още</div>
            )}
          </div>
        )
      })}
    </div>
  )

  // ── WEEK VIEW ──
  const WeekView = () => {
    const weekStart = getWeekStart(currentDate)
    const weekDays = Array.from({length:7}, (_,i) => {
      const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
    })
    return (
      <div style={{ overflowX:'auto' }}>
        <div style={{ minWidth: 700 }}>
          {/* Header row */}
          <div style={{ display:'grid', gridTemplateColumns:'56px repeat(7,1fr)', gap:1, marginBottom:1 }}>
            <div />
            {weekDays.map((d,i) => {
              const iso = d.toISOString().slice(0,10)
              const isToday = iso === todayISO
              const dayEv = getEventsForDate(iso)
              return (
                <div
                  key={i}
                  onClick={() => { setCurrentDate(d); setView('day') }}
                  style={{
                    textAlign:'center', padding:'8px 4px',
                    background: isToday ? '#FFD3DD' : '#F0F9F8',
                    borderRadius:10, cursor:'pointer',
                  }}
                >
                  <div style={{ fontSize:9, color:'#81BFB7', fontWeight:700 }}>{WEEK_FULL[i].slice(0,3).toUpperCase()}</div>
                  <div style={{ fontSize:18, fontWeight:900, color: isToday ? '#F3A2BE' : '#3a2a35' }}>{d.getDate()}</div>
                  {dayEv.length > 0 && <div style={{ fontSize:9, color:'#F3A2BE', fontWeight:700 }}>{dayEv.length} събитие{dayEv.length>1?'я':''}</div>}
                </div>
              )
            })}
          </div>
          {/* Time grid */}
          {HOURS.map(hour => (
            <div key={hour} style={{ display:'grid', gridTemplateColumns:'56px repeat(7,1fr)', gap:1, minHeight:48 }}>
              <div style={{ fontSize:10, color:'#C6E6E3', textAlign:'right', paddingRight:8, paddingTop:4, fontWeight:700 }}>
                {String(hour).padStart(2,'0')}:00
              </div>
              {weekDays.map((d,i) => {
                const iso = d.toISOString().slice(0,10)
                const isToday = iso === todayISO
                const hourEvents = getEventsForDate(iso).filter(ev => {
                  if (!ev.time) return hour === 9
                  return parseInt(ev.time.slice(0,2)) === hour
                })
                return (
                  <div key={i} style={{
                    background: isToday ? 'rgba(255,211,221,0.1)' : '#fff',
                    borderTop: '1px solid #F0F9F8',
                    padding: '2px 3px',
                  }}>
                    {hourEvents.map(ev => <EventChip key={ev.id} event={ev} />)}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── DAY VIEW ("Моя Ден") ──
  const DayView = () => {
    const iso = currentDate.toISOString().slice(0,10)
    const dayEvents = getEventsForDate(iso).sort((a,b) => (a.time||'').localeCompare(b.time||''))
    const montageEv = dayEvents.filter(e => e.type === 'montage')
    const dismantleEv = dayEvents.filter(e => e.type === 'dismantle')
    const taskEv = dayEvents.filter(e => e.type === 'task')

    const Section = ({ title, items, emptyMsg }) => (
      <div style={{ ...card, marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>{title}</div>
        {items.length === 0
          ? <div style={{ fontSize:12, color:'#C6E6E3', textAlign:'center', padding:16 }}>{emptyMsg}</div>
          : items.map(ev => (
            <div
              key={ev.id}
              onClick={() => setPopup(ev)}
              style={{
                display:'flex', gap:12, alignItems:'center',
                padding:'10px 12px', marginBottom:8,
                background: COLORS[ev.type].bg + '22',
                borderLeft: `4px solid ${COLORS[ev.type].bg}`,
                borderRadius:10, cursor:'pointer',
              }}
            >
              <div style={{ minWidth:40, fontSize:12, fontWeight:700, color: COLORS[ev.type].bg }}>
                {ev.time ? ev.time.slice(0,5) : '—'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#3a2a35', textDecoration: ev.done?'line-through':'none' }}>{ev.title}</div>
                {ev.subtitle && <div style={{ fontSize:11, color:'#81BFB7' }}>{ev.subtitle}</div>}
                {ev.offer?.location && <div style={{ fontSize:11, color:'#81BFB7' }}>📍 {ev.offer.location}</div>}
              </div>
              {ev.type === 'task' && (
                <div
                  onClick={e => { e.stopPropagation(); toggleTask(ev.task.id, ev.task.status) }}
                  style={{
                    width:20, height:20, borderRadius:'50%',
                    border:`2px solid ${PRIORITY_COLOR[ev.priority]||'#F3A2BE'}`,
                    background: ev.done ? (PRIORITY_COLOR[ev.priority]||'#F3A2BE') : 'transparent',
                    cursor:'pointer', flexShrink:0,
                  }}
                />
              )}
            </div>
          ))
        }
      </div>
    )

    return (
      <div>
        {montageEv.length > 0 && <Section title="🎈 Монтажи за деня" items={montageEv} emptyMsg="Няма монтажи" />}
        {dismantleEv.length > 0 && <Section title="🔧 Демонтажи за деня" items={dismantleEv} emptyMsg="Няма демонтажи" />}
        <Section title="✅ Задачи за деня" items={taskEv} emptyMsg="Няма задачи за деня 🎉" />
        {dayEvents.length === 0 && montageEv.length === 0 && dismantleEv.length === 0 && (
          <div style={{ textAlign:'center', padding:60, color:'#C6E6E3', fontSize:14 }}>
            🌸 Свободен ден!
          </div>
        )}
      </div>
    )
  }

  // ── POPUP ──
  const EventPopup = ({ event, onClose }) => {
    if (!event) return null
    const col = COLORS[event.type]
    const isOffer = event.type === 'montage' || event.type === 'dismantle'
    const isTask = event.type === 'task'

    return (
      <div
        style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:3000, padding:20 }}
        onClick={onClose}
      >
        <div
          style={{ background:'#F0F9F8', borderRadius:24, padding:24, maxWidth:380, width:'90%', boxShadow:'0 20px 50px rgba(0,0,0,0.25)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ background:col.bg, color:col.color, padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:700 }}>
              {col.label}
            </div>
            <button onClick={onClose} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:32, height:32, cursor:'pointer', fontSize:16 }}>✕</button>
          </div>

          {isOffer && event.offer && (
            <>
              <div style={{ fontSize:20, fontWeight:900, color:'#3a2a35', marginBottom:10 }}>{event.offer.clients?.name || '—'}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                {[
                  ['📅', `${event.date}${event.time ? ' · ' + event.time.slice(0,5) : ''}`],
                  ['🎉', event.offer.event_type],
                  ['📍', event.offer.location],
                  ['📞', event.offer.clients?.phone],
                  ['👥', event.offer.guest_count ? `${event.offer.guest_count} гости` : null],
                ].filter(([,v]) => v).map(([icon, val]) => (
                  <div key={icon} style={{ fontSize:12, color:'#81BFB7' }}>{icon} {val}</div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'#fff', borderRadius:12, marginBottom:12 }}>
                <span style={{ fontSize:12, color:'#81BFB7' }}>Обща сума</span>
                <span style={{ fontSize:16, fontWeight:900, color:'#F3A2BE' }}>€{(event.offer.total||0).toFixed(2)}</span>
              </div>
              <div style={{ fontSize:10, color:'#C6E6E3', textAlign:'center' }}>#{event.offer.offer_number}</div>
            </>
          )}

          {isTask && event.task && (
            <>
              <div style={{ fontSize:18, fontWeight:900, color:'#3a2a35', marginBottom:10 }}>{event.task.title}</div>
              {event.task.description && (
                <div style={{ fontSize:12, color:'#81BFB7', marginBottom:10, lineHeight:1.5 }}>{event.task.description}</div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                {event.date && <div style={{ fontSize:12, color:'#81BFB7' }}>📅 {event.date}{event.time ? ' · ' + event.time : ''}</div>}
                {event.task.related_client && <div style={{ fontSize:12, color:'#81BFB7' }}>👤 {event.task.related_client}</div>}
              </div>
              <button
                onClick={() => { toggleTask(event.task.id, event.task.status); onClose() }}
                style={{
                  width:'100%', padding:12, border:'none', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:13,
                  background: event.done ? '#F0F9F8' : 'linear-gradient(135deg,#C6E6E3,#81BFB7)',
                  color: event.done ? '#81BFB7' : '#fff',
                }}
              >
                {event.done ? '↩ Върни като незавършена' : '✅ Маркирай като завършена'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>

      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        <button onClick={onBack} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Табло</button>
        <h1 style={{ color:'#3a2a35', margin:0, fontSize:22, fontWeight:900 }}>
          {view === 'day' && currentDate.toISOString().slice(0,10) === todayISO ? '🌅 Моя Ден' : '📅 Календар'}
        </h1>

        {/* View toggle */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.8)', borderRadius:12, padding:4, gap:4, marginLeft:'auto' }}>
          {[['month','Месец'],['week','Седмица'],['day','Ден']].map(([v,l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding:'7px 14px', borderRadius:10, border:'none', cursor:'pointer',
              fontWeight:700, fontSize:12,
              background: view === v ? '#F3A2BE' : 'transparent',
              color: view === v ? '#fff' : '#81BFB7',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* NAVIGATION */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <button onClick={prev} style={{ padding:'8px 14px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>◀</button>
        <div style={{ flex:1, textAlign:'center', fontWeight:900, color:'#3a2a35', fontSize:16 }}>{navLabel()}</div>
        <button onClick={() => { setCurrentDate(new Date()); setView('day') }} style={{ padding:'8px 14px', background:'#FFD3DD', border:'none', borderRadius:12, color:'#3a2a35', fontWeight:700, cursor:'pointer', fontSize:12 }}>Днес</button>
        <button onClick={next} style={{ padding:'8px 14px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>▶</button>
      </div>

      {/* LEGEND */}
      {view !== 'day' && (
        <div style={{ display:'flex', gap:16, marginBottom:14, flexWrap:'wrap' }}>
          {Object.entries(COLORS).map(([k,v]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:v.bg }} />
              <span style={{ color:'#81BFB7', fontWeight:700 }}>{v.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT */}
      {loading
        ? <div style={{ textAlign:'center', padding:60, color:'#81BFB7' }}>Зарежда...</div>
        : view === 'month' ? <MonthView />
        : view === 'week'  ? <WeekView />
        : <DayView />
      }

      {popup && <EventPopup event={popup} onClose={() => setPopup(null)} />}
    </div>
  )
}
