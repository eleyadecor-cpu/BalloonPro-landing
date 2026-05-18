import React, { useState, useEffect } from 'react';
import BalloonPro from './BalloonPro.jsx';
import InquiryForm from './InquiryForm.jsx';
import InquiryList from './InquiryList.jsx';
import TaskForm from './TaskForm.jsx';
import ClientsPage from './ClientsPage.jsx';
import InventoryPage from './InventoryPage.jsx';
import ThemesPage from './ThemesPage.jsx';
import OfferPage from './OfferPage.jsx';
import CalculatorPage from './CalculatorPage.jsx';
import { supabase } from './supabaseClient';
import SettingsPage from './SettingsPage.jsx'
import NewCalculator from './NewCalculator.jsx'
import CalendarPage from './CalendarPage.jsx'

const DAYS = ['П','В','С','Ч','П','С','Н'];
const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];
const WEEK = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];

const STATUS_LABELS = {
  new:       { label: 'Ново',       bg: '#FFD3DD', color: '#5a2d3a' },
  reviewed:  { label: 'Прегледано', bg: '#C6E6E3', color: '#2a5450' },
  quoted:    { label: 'Оферирано',  bg: '#F3A2BE', color: '#fff' },
  confirmed: { label: 'Потвърдено', bg: '#81BFB7', color: '#fff' },
  cancelled: { label: 'Отказано',   bg: '#eee',    color: '#888' },
}

const OFFER_STATUS = {
  draft:    { label: 'Чернова',   bg: '#F0F9F8', color: '#81BFB7' },
  sent:     { label: 'Изпратена', bg: '#FFD3DD', color: '#F3A2BE' },
  accepted: { label: 'Приета',    bg: '#C6E6E3', color: '#2a5450' },
  rejected: { label: 'Отказана',  bg: '#FFD3DD', color: '#c0392b' },
  expired:  { label: 'Изтекла',   bg: '#f0f0f0', color: '#888' },
}

const Dashboard = () => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [showClients, setShowClients] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [showOffers, setShowOffers] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showInquiries, setShowInquiries] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [calcOfferData, setCalcOfferData] = useState(null)
  const [openNewOffer, setOpenNewOffer] = useState(false)
  const [weather, setWeather] = useState(null)
  const [inquiries, setInquiries] = useState([])
  const [tasks, setTasks] = useState([])
  const [offers, setOffers] = useState([])
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarDate, setCalendarDate] = useState(null)
  const [calendarMyDay, setCalendarMyDay] = useState(false)
  const [showNewCalc, setShowNewCalc] = useState(false)

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.62&longitude=25.4&current=temperature_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FSofia&forecast_days=7')
      .then(r => r.json()).then(d => setWeather(d)).catch(() => {})
    loadData()
  }, [])

  const loadData = async () => {
    const [inq, tsk, off] = await Promise.all([
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('tasks').select('*').eq('status', 'pending').order('due_date', { ascending: true }).limit(5),
      supabase.from('offers').select('*, clients(name)').order('created_at', { ascending: false }).limit(3),
    ])
    setInquiries(inq.data || [])
    setTasks(tsk.data || [])
    setOffers(off.data || [])
  }

  const toggleTask = async (id, status) => {
    const newStatus = status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    loadData()
  }

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️'
    if (code <= 2) return '⛅'
    if (code <= 48) return '☁️'
    if (code <= 67) return '🌧️'
    if (code <= 77) return '❄️'
    if (code <= 82) return '🌦️'
    return '⛈️'
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    const p = iso.split('-')
    return `${p[2]}.${p[1]}.${p[0]}`
  }

  const PRIORITY_COLOR = { low:'#81BFB7', normal:'#F3A2BE', high:'#c0892b', urgent:'#c0392b' }
  const card = { background:'rgba(255,255,255,0.8)', borderRadius:20, border:'1px solid rgba(243,162,190,0.2)', padding:16 }

  // Навигация
  if (showClients) return <ClientsPage onBack={() => setShowClients(false)} />
  if (showSettings) return <SettingsPage onBack={() => setShowSettings(false)} />
  if (showInventory) return <InventoryPage onBack={() => setShowInventory(false)} />
  if (showThemes) return <ThemesPage onBack={() => setShowThemes(false)} />
  if (showNewCalc) return <NewCalculator onBack={() => setShowNewCalc(false)} />
  if (showCalendar) return <CalendarPage
  onBack={() => { setShowCalendar(false); setCalendarDate(null); setCalendarMyDay(false) }}
  initialDate={calendarDate}
  myDay={calendarMyDay}
/>
  if (showOffers) return <OfferPage onBack={() => { setShowOffers(false); setOpenNewOffer(false); setCalcOfferData(null) }} prefillInquiry={calcOfferData} openNew={openNewOffer || !!calcOfferData} />
  if (showCalculator) return <CalculatorPage inquiry={calcOfferData} onBack={() => { setShowCalculator(false); setCalcOfferData(null) }} onCreateOffer={(data) => { setCalcOfferData(data); setShowCalculator(false); setShowOffers(true) }} />
  if (showInquiries) return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => setShowInquiries(false)} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Табло</button>
        <h1 style={{ color:'#3a2a35', margin:0, fontSize:24, fontWeight:900 }}>📝 Запитвания</h1>
      </div>
      <InquiryList onOpenCalc={(inq) => { setCalcOfferData(inq); setShowCalculator(true); setShowInquiries(false) }} />
    </div>
  )
  if (showTasks) return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => setShowTasks(false)} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Табло</button>
        <h1 style={{ color:'#3a2a35', margin:0, fontSize:24, fontWeight:900 }}>✅ Задачи</h1>
      </div>
      <div style={{ maxWidth:700 }}>
        {tasks.length === 0 && <div style={{ textAlign:'center', padding:40, color:'#81BFB7', background:'rgba(255,255,255,0.7)', borderRadius:20 }}>Няма задачи 🎉</div>}
        {tasks.map(t => (
          <div key={t.id} style={{ ...card, display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
            <div onClick={() => toggleTask(t.id, t.status)} style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${PRIORITY_COLOR[t.priority]}`, cursor:'pointer', background: t.status==='done'?PRIORITY_COLOR[t.priority]:'transparent', flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:'#3a2a35', textDecoration: t.status==='done'?'line-through':'none' }}>{t.title}</div>
              {t.due_date && <div style={{ fontSize:11, color:'#81BFB7' }}>📅 {formatDate(t.due_date)}</div>}
            </div>
          </div>
        ))}
        <button onClick={() => setIsTaskOpen(true)} style={{ width:'100%', padding:12, background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', marginTop:12 }}>+ Нова задача</button>
      </div>
      {isTaskOpen && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:20 }}>
          <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:600, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
              <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0 }}>✅ Нова Задача</h2>
              <button onClick={() => setIsTaskOpen(false)} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:'20px 32px 32px' }}>
              <TaskForm onClose={() => setIsTaskOpen(false)} onSaved={loadData} />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const Popup = ({ title, children, maxW='800px' }) => (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:maxW, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
          <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0, fontSize:18 }}>{title}</h2>
          <button onClick={() => { setIsInquiryOpen(false); setIsTaskOpen(false) }} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        <div style={{ padding:'20px 32px 32px' }}>{children}</div>
      </div>
    </div>
  )

  const navBtn = (label, icon, action, gradient) => (
    <button onClick={action} style={{ padding:'10px 16px', borderRadius:12, border:'none', background:gradient, color:'#fff', fontWeight:800, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
      {icon} {label}
    </button>
  )

  // Дни на седмицата за прогнозата — от утре
  const todayDow = today.getDay()
  const dowNames = ['Нед','Пон','Вто','Сря','Чет','Пет','Съб']
  const forecastDays = Array.from({length:7}, (_,i) => dowNames[(todayDow+1+i)%7])

  return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>

      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h1 style={{ color:'#3a2a35', margin:0, fontSize:26, fontWeight:900 }}>Balloon Pro ✨</h1>
          <div style={{ color:'#81BFB7', fontSize:13 }}>{WEEK[today.getDay()]}, {today.getDate()} {MONTHS[month]} {year}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ width:36, height:36, background:'rgba(255,255,255,0.8)', border:'1px solid #FFD3DD', borderRadius:'50%', cursor:'pointer', fontSize:16 }}>🔔</button>
          <button onClick={() => setShowSettings(true)} style={{ width:36, height:36, background:'rgba(255,255,255,0.8)', border:'1px solid #FFD3DD', borderRadius:'50%', cursor:'pointer', fontSize:16 }}>⚙️</button>
        </div>
      </div>

      {/* ГОРНО МЕНЮ */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {navBtn('Запитвания','📝',()=>setShowInquiries(true),'linear-gradient(135deg,#FFD3DD,#F3A2BE)')}
        {navBtn('Задачи','✅',()=>setShowTasks(true),'linear-gradient(135deg,#C6E6E3,#81BFB7)')}
        {navBtn('Оферти','📄',()=>setShowOffers(true),'linear-gradient(135deg,#FFD3DD,#F3A2BE)')}
        {navBtn('Календар','📅',()=>setShowCalendar(true),'linear-gradient(135deg,#C6E6E3,#81BFB7)')}
        {navBtn('Клиенти','👥',()=>setShowClients(true),'linear-gradient(135deg,#C6E6E3,#81BFB7)')}
        {navBtn('Финанси','💰',()=>{},'linear-gradient(135deg,#FFD3DD,#F3A2BE)')}
        {navBtn('Склад','📦',()=>setShowInventory(true),'linear-gradient(135deg,#C6E6E3,#81BFB7)')}
        {navBtn('Теми','🎨',()=>setShowThemes(true),'linear-gradient(135deg,#FFD3DD,#F3A2BE)')}
        <button onClick={() => setShowCalculator(true)} style={{ padding:'10px 16px', borderRadius:12, border:'1px solid #C6E6E3', background:'rgba(255,255,255,0.7)', color:'#81BFB7', fontWeight:800, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          <svg width="16" height="16" viewBox="0 0 36 36"><rect width="36" height="36" rx="10" fill="#F3A2BE" opacity="0.4"/><rect x="6" y="6" width="24" height="24" rx="6" fill="white" opacity="0.9"/><rect x="9" y="9" width="18" height="5" rx="2" fill="#F3A2BE"/><rect x="9" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/><rect x="15.5" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/><rect x="22" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/></svg>
          Калкулатор
        {navBtn('Нов Калк.','🆕',()=>setShowNewCalc(true),'linear-gradient(135deg,#81BFB7,#C6E6E3)')}
        </button>
      </div>

      {/* MAIN GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr 260px', gap:16, alignItems:'start' }}>

        {/* ЛЯВА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>➕ Добави ново</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={() => setIsInquiryOpen(true)} style={{ padding:'12px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:13, textAlign:'left' }}>📝 + Запитване</button>
              <button onClick={() => setIsTaskOpen(true)} style={{ padding:'12px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:12, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:13, textAlign:'left' }}>✅ + Задача</button>
              <button onClick={() => { setOpenNewOffer(true); setShowOffers(true) }} style={{ padding:'12px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:13, textAlign:'left' }}>📄 + Оферта</button>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>⚡ Бърз достъп</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <button onClick={() => { setCalendarDate(new Date()); setCalendarMyDay(true); setShowCalendar(true) }} style={{ padding:'10px 12px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', textAlign:'left' }}>🌅 Моя Ден</button>
              <button style={{ padding:'10px 12px', background:'rgba(255,255,255,0.7)', border:'1px solid #C6E6E3', borderRadius:10, color:'#81BFB7', fontWeight:700, fontSize:12, cursor:'pointer', textAlign:'left' }}>📊 Месечен отчет</button>
              <button onClick={() => setShowInventory(true)} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.7)', border:'1px solid #C6E6E3', borderRadius:10, color:'#81BFB7', fontWeight:700, fontSize:12, cursor:'pointer', textAlign:'left' }}>📦 Провери склада</button>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>💰 Финанси — {MONTHS[month]}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'#81BFB7' }}>Приходи</span><span style={{ fontWeight:700, color:'#3a2a35' }}>€0</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'#81BFB7' }}>Разходи</span><span style={{ fontWeight:700, color:'#F3A2BE' }}>€0</span></div>
              <div style={{ height:1, background:'#FFD3DD', margin:'4px 0' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'#81BFB7', fontWeight:700 }}>Печалба</span><span style={{ fontWeight:900, color:'#81BFB7' }}>€0</span></div>
            </div>
          </div>
        </div>

        {/* СРЕДНА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* 4 СТАТИСТИКИ */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'Събития', value: inquiries.filter(i=>i.status==='confirmed').length, sub:'потвърдени', c:'#F3A2BE' },
              { label:'Задачи', value: tasks.length, sub:'за днес', c:'#81BFB7' },
              { label:'Приходи', value:'€0', sub:'този месец', c:'#F3A2BE' },
              { label:'Инвентар', value:'0', sub:'артикула', c:'#81BFB7' },
            ].map((s,i) => (
              <div key={i} style={{ ...card, textAlign:'center', padding:14 }}>
                <div style={{ fontSize:9, fontWeight:700, color:s.c, textTransform:'uppercase', letterSpacing:.8, marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:900, color:'#3a2a35' }}>{s.value}</div>
                <div style={{ fontSize:9, color:'#81BFB7' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* РЕД 2: Задачи за днес + Предстоящи събития */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={card}>
              <div style={{ fontSize:10, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>✅ Задачи за днес</div>
              {tasks.length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16 }}>Няма задачи 🎉</div>}
              {tasks.slice(0,4).map(t => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid rgba(198,230,227,0.3)' }}>
                  <div onClick={() => toggleTask(t.id, t.status)} style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${PRIORITY_COLOR[t.priority]}`, cursor:'pointer', background: t.status==='done'?PRIORITY_COLOR[t.priority]:'transparent', flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:12, color: t.status==='done'?'#81BFB7':'#3a2a35', textDecoration: t.status==='done'?'line-through':'none', fontWeight:600 }}>{t.title}</div>
                  {t.priority==='urgent' && <div style={{ fontSize:9, color:'#c0392b', fontWeight:700 }}>Спешно</div>}
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={{ fontSize:10, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📅 Предстоящи събития</div>
              {inquiries.filter(i=>i.event_date).length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16 }}>Няма предстоящи събития</div>}
              {inquiries.filter(i=>i.event_date).slice(0,3).map(inq => {
                const parts = inq.event_date?.split('-') || []
                return (
                  <div key={inq.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(243,162,190,0.2)' }}>
                    <div style={{ textAlign:'center', minWidth:32 }}>
                      <div style={{ fontSize:16, fontWeight:900, color:'#F3A2BE' }}>{parts[2]||'—'}</div>
                      <div style={{ fontSize:9, color:'#81BFB7' }}>{MONTHS[parseInt(parts[1])-1]?.slice(0,3)||''}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#3a2a35' }}>{inq.event_type||'Събитие'} — {inq.client_name}</div>
                      {inq.event_start && <div style={{ fontSize:10, color:'#81BFB7' }}>⏰ {inq.event_start}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* РЕД 3: Последни запитвания + Последни оферти */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={card}>
              <div style={{ fontSize:10, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📝 Последни запитвания</div>
              {inquiries.length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16 }}>Няма запитвания</div>}
              {inquiries.map(inq => (
                <div key={inq.id} onClick={() => setShowInquiries(true)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(198,230,227,0.3)', cursor:'pointer' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#3a2a35' }}>{inq.client_name}</div>
                    <div style={{ fontSize:10, color:'#81BFB7' }}>{formatDate(inq.event_date)} · {inq.event_type||'—'}</div>
                  </div>
                  <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, background:STATUS_LABELS[inq.status]?.bg, color:STATUS_LABELS[inq.status]?.color, fontWeight:700 }}>
                    {STATUS_LABELS[inq.status]?.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={{ fontSize:10, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📄 Последни оферти</div>
              {offers.length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16 }}>Няма оферти</div>}
              {offers.map(off => (
                <div key={off.id} onClick={() => setShowOffers(true)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(198,230,227,0.3)', cursor:'pointer' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#3a2a35' }}>{off.offer_number}</div>
                    <div style={{ fontSize:10, color:'#81BFB7' }}>{off.clients?.name||'—'} · €{off.total?.toFixed(2)}</div>
                  </div>
                  <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, background:OFFER_STATUS[off.status]?.bg, color:OFFER_STATUS[off.status]?.color, fontWeight:700 }}>
                    {OFFER_STATUS[off.status]?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ДЯСНА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* КАЛЕНДАР */}
          <div style={card}>
            <div style={{ fontWeight:900, color:'#3a2a35', marginBottom:12, fontSize:14 }}>{MONTHS[month]} {year}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, textAlign:'center', fontSize:11 }}>
              {DAYS.map(d => <div key={d} style={{ color:'#C6E6E3', fontWeight:700, padding:'2px 0' }}>{d}</div>)}
              {Array(offset).fill(null).map((_,i) => <div key={`e${i}`}/>)}
              {Array(daysInMonth).fill(null).map((_,i) => {
                const day = i+1
                const isToday = day === today.getDate()
                return <div key={day} onClick={() => { setCalendarDate(new Date(year, month, day)); setShowCalendar(true) }} style={{ padding:'5px 2px', borderRadius:6, fontWeight:isToday?900:400, background:isToday?'#F3A2BE':'transparent', color:isToday?'#fff':'#3a2a35', cursor:'pointer' }}>{day}</div>
              })}
            </div>
          </div>

          {/* ВРЕМЕТО */}
          <div style={{ background:'#81BFB7', borderRadius:20, padding:20, color:'white' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginBottom:10 }}>{WEEK[today.getDay()]}, {today.getDate()} {MONTHS[month]}</div>
            {weather ? (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ fontSize:32 }}>{getWeatherEmoji(weather.current.weathercode)}</div>
                  <div>
                    <div style={{ fontSize:28, fontWeight:900 }}>{Math.round(weather.current.temperature_2m)}°C</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)' }}>💨 {Math.round(weather.current.windspeed_10m)} km/h · Казанлък</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:10 }}>
                  {weather.daily.time.slice(1).map((_, i) => (
                    <div key={i}>
                      <div style={{ fontSize:8, color:'rgba(255,255,255,0.7)' }}>{forecastDays[i]}</div>
                      <div style={{ fontSize:14 }}>{getWeatherEmoji(weather.daily.weathercode[i+1])}</div>
                      <div style={{ fontSize:10, fontWeight:700 }}>{Math.round(weather.daily.temperature_2m_max[i+1])}°</div>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.6)' }}>{Math.round(weather.daily.temperature_2m_min[i+1])}°</div>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>Зарежда...</div>}
          </div>
        </div>
      </div>

      {/* ПОПЪПИ */}
      {isInquiryOpen && (
        <Popup title="📝 Ново Запитване">
          <InquiryForm onClose={() => setIsInquiryOpen(false)} onSaved={loadData} />
        </Popup>
      )}
      {isTaskOpen && (
        <Popup title="✅ Нова Задача">
          <TaskForm onClose={() => setIsTaskOpen(false)} onSaved={loadData} />
        </Popup>
      )}
    </div>
  )
}

export default Dashboard;