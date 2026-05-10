import React, { useState, useEffect } from 'react';
import BalloonPro from './BalloonPro.jsx';
import InquiryForm from './InquiryForm.jsx';
import InquiryList from './InquiryList.jsx';
import TaskForm from './TaskForm.jsx';
import ClientsPage from './ClientsPage.jsx';
import { supabase } from './supabaseClient';

const DAYS = ['П','В','С','Ч','П','С','Н'];
const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];
const WEEK = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];

const Dashboard = () => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [leftTab, setLeftTab] = useState('calendar');
  const [weather, setWeather] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekDays = ['Пет','Съб','Нед','Пон','Вто','Сря','Чет'];

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.62&longitude=25.4&current=temperature_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FSofia&forecast_days=7')
      .then(r => r.json()).then(d => setWeather(d)).catch(() => {});
    loadInquiries();
    loadTasks();
  }, []);

  const loadInquiries = async () => {
    const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(3);
    setInquiries(data || []);
  };

  const loadTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('status', 'pending').order('due_date', { ascending: true }).limit(5);
    setTasks(data || []);
  };

  const toggleTask = async (id, status) => {
    const newStatus = status === 'done' ? 'pending' : 'done';
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    loadTasks();
  };

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code <= 48) return '☁️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const p = iso.split('-');
    return `${p[2]}.${p[1]}.${p[0]}`;
  };

  const STATUS = {
    new:       { label: 'Ново',       bg: '#FFD3DD', color: '#5a2d3a' },
    reviewed:  { label: 'Прегледано', bg: '#C6E6E3', color: '#2a5450' },
    quoted:    { label: 'Оферирано',  bg: '#F3A2BE', color: '#fff' },
    confirmed: { label: 'Потвърдено', bg: '#81BFB7', color: '#fff' },
    cancelled: { label: 'Отказано',   bg: '#eee',    color: '#888' },
  };

  const PRIORITY_COLOR = { low: '#81BFB7', normal: '#F3A2BE', high: '#c0892b', urgent: '#c0392b' };

  const card = { background: 'rgba(255,255,255,0.8)', borderRadius: 20, border: '1px solid rgba(243,162,190,0.2)', padding: 16 };

  const allActions = [
    { label: '+ Запитване', icon: '📝', g: ['#FFD3DD','#F3A2BE'], action: () => setIsInquiryOpen(true) },
    { label: '+ Задача',    icon: '✅', g: ['#C6E6E3','#81BFB7'], action: () => setIsTaskOpen(true) },
    { label: '+ Оферта',   icon: '📄', g: ['#FFD3DD','#F3A2BE'] },
    { label: 'Клиенти', icon: '👥', g: ['#C6E6E3','#81BFB7'], action: () => setShowClients(true) },
    { label: 'Финанси',    icon: '💰', g: ['#FFD3DD','#F3A2BE'] },
    { label: 'Склад',      icon: '🎈', g: ['#C6E6E3','#81BFB7'] },
    { label: 'Теми',       icon: '🎨', g: ['#FFD3DD','#F3A2BE'] },
    { label: 'Калкулатор', icon: null, g: null, action: () => setIsCalcOpen(true), light: true },
  ];

  const Popup = ({ children, onClose, maxW = '1000px' }) => (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:maxW, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
        {children}
      </div>
    </div>
  );

  const PopupHeader = ({ title, onClose }) => (
    <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
      <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0, fontSize:18 }}>{title}</h2>
      <button onClick={onClose} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
    </div>
  );
  if (showClients) return <ClientsPage onBack={() => setShowClients(false)} />
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
          <button style={{ width:36, height:36, background:'rgba(255,255,255,0.8)', border:'1px solid #FFD3DD', borderRadius:'50%', cursor:'pointer', fontSize:16 }}>⚙️</button>
        </div>
      </div>

      {/* БУТОНИ */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {allActions.map((b, i) => (
          <button key={i} onClick={b.action} style={{
            padding:'10px 16px', borderRadius:12, border: b.light ? '1px solid #C6E6E3' : 'none',
            background: b.light ? 'rgba(255,255,255,0.7)' : `linear-gradient(135deg,${b.g[0]},${b.g[1]})`,
            color: b.light ? '#81BFB7' : '#fff',
            fontWeight:800, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6
          }}>
            {b.icon && <span>{b.icon}</span>}
            {!b.icon && <svg width="16" height="16" viewBox="0 0 36 36"><rect width="36" height="36" rx="10" fill="#F3A2BE" opacity="0.4"/><rect x="6" y="6" width="24" height="24" rx="6" fill="white" opacity="0.9"/><rect x="9" y="9" width="18" height="5" rx="2" fill="#F3A2BE"/><rect x="9" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/><rect x="15.5" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/><rect x="22" y="17" width="5" height="5" rx="1.5" fill="#F3A2BE"/></svg>}
            {b.label}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr 240px', gap:16, alignItems:'start' }}>

        {/* ЛЯВА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', gap:4 }}>
            {[['calendar','📅 Календар'],['inquiries','📝 Запитвания'],['tasks','✅ Задачи']].map(([k,l]) => (
              <button key={k} onClick={() => setLeftTab(k)} style={{ flex:1, padding:'6px 2px', borderRadius:8, border:'none', background: leftTab===k ? '#F3A2BE' : 'rgba(255,255,255,0.6)', color: leftTab===k ? '#fff' : '#81BFB7', fontWeight:700, fontSize:9, cursor:'pointer' }}>{l}</button>
            ))}
          </div>

          {leftTab === 'calendar' && (
            <div style={card}>
              <div style={{ fontWeight:900, color:'#3a2a35', marginBottom:12, fontSize:14 }}>{MONTHS[month]} {year}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, textAlign:'center', fontSize:11 }}>
                {DAYS.map(d => <div key={d} style={{ color:'#C6E6E3', fontWeight:700, padding:'2px 0' }}>{d}</div>)}
                {Array(offset).fill(null).map((_,i) => <div key={`e${i}`}/>)}
                {Array(daysInMonth).fill(null).map((_,i) => {
                  const day = i+1;
                  const isToday = day === today.getDate();
                  return <div key={day} style={{ padding:'5px 2px', borderRadius:6, fontWeight: isToday?900:400, background: isToday?'#F3A2BE':'transparent', color: isToday?'#fff':'#3a2a35', cursor:'pointer' }}>{day}</div>;
                })}
              </div>
            </div>
          )}

          {leftTab === 'inquiries' && (
            <div style={{ maxHeight:500, overflowY:'auto' }}>
              <InquiryList onOpenCalc={() => setIsCalcOpen(true)} />
            </div>
          )}

          {leftTab === 'tasks' && (
            <div style={card}>
              <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Задачи</div>
              {tasks.length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:20 }}>Няма задачи</div>}
              {tasks.map(t => (
                <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(198,230,227,0.3)' }}>
                  <div onClick={() => toggleTask(t.id, t.status)} style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${PRIORITY_COLOR[t.priority]}`, flexShrink:0, marginTop:2, cursor:'pointer', background: t.status==='done' ? PRIORITY_COLOR[t.priority] : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff' }}>
                    {t.status==='done'?'✓':''}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color: t.status==='done'?'#81BFB7':'#3a2a35', textDecoration: t.status==='done'?'line-through':'none' }}>{t.title}</div>
                    {t.due_date && <div style={{ fontSize:10, color:'#81BFB7' }}>📅 {formatDate(t.due_date)}{t.due_time ? ` · ${t.due_time}`:''}</div>}
                  </div>
                </div>
              ))}
              <button onClick={() => setIsTaskOpen(true)} style={{ width:'100%', marginTop:12, padding:'8px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>+ Нова задача</button>
            </div>
          )}

          {/* ПОСЛЕДНИ ЗАПИТВАНИЯ */}
          <div style={card}>
            <div style={{ fontSize:10, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Последни запитвания</div>
            {inquiries.length === 0 && <div style={{ fontSize:11, color:'#81BFB7', textAlign:'center' }}>Няма запитвания</div>}
            {inquiries.map(inq => (
              <div key={inq.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, paddingBottom:8, borderBottom:'1px solid rgba(198,230,227,0.3)' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#3a2a35' }}>{inq.client_name}</div>
                  <div style={{ fontSize:10, color:'#81BFB7' }}>{formatDate(inq.event_date)} · {inq.event_type||'—'}</div>
                </div>
                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:20, background: STATUS[inq.status]?.bg, color: STATUS[inq.status]?.color, fontWeight:700 }}>
                  {STATUS[inq.status]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* СРЕДНА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* 4 КАРТИ */}
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

          {/* ПРЕДСТОЯЩИ СЪБИТИЯ */}
          <div style={card}>
            <div style={{ fontSize:10, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📅 Предстоящи събития</div>
            {inquiries.filter(i => i.event_date).length === 0 && (
              <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:20 }}>Няма предстоящи събития</div>
            )}
            {inquiries.filter(i => i.event_date).map(inq => {
              const parts = inq.event_date?.split('-') || [];
              return (
                <div key={inq.id} style={{ display:'flex', gap:12, alignItems:'center', padding:10, background:'rgba(255,255,255,0.5)', borderRadius:12, marginBottom:8 }}>
                  <div style={{ textAlign:'center', minWidth:40 }}>
                    <div style={{ fontSize:18, fontWeight:900, color:'#F3A2BE' }}>{parts[2]||'—'}</div>
                    <div style={{ fontSize:9, color:'#81BFB7' }}>{MONTHS[parseInt(parts[1])-1]?.slice(0,3)||''}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#3a2a35' }}>{inq.event_type||'Събитие'} — {inq.client_name}</div>
                    <div style={{ fontSize:10, color:'#81BFB7' }}>{inq.location ? `📍 ${inq.location}` : ''}{inq.event_start ? ` · ${inq.event_start}` : ''}</div>
                  </div>
                  <span style={{ fontSize:9, padding:'3px 10px', borderRadius:20, background: STATUS[inq.status]?.bg, color: STATUS[inq.status]?.color, fontWeight:700 }}>
                    {STATUS[inq.status]?.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ЗАДАЧИ ЗА ДНЕС */}
          <div style={card}>
            <div style={{ fontSize:10, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>✅ Задачи за днес</div>
            {tasks.length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16 }}>Няма задачи — добре си! 🎉</div>}
            {tasks.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(255,255,255,0.5)', borderRadius:10, marginBottom:6 }}>
                <div onClick={() => toggleTask(t.id, t.status)} style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${PRIORITY_COLOR[t.priority]}`, flexShrink:0, cursor:'pointer', background: t.status==='done'?PRIORITY_COLOR[t.priority]:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>
                  {t.status==='done'?'✓':''}
                </div>
                <div style={{ flex:1, fontSize:12, color: t.status==='done'?'#81BFB7':'#3a2a35', textDecoration: t.status==='done'?'line-through':'none', fontWeight:600 }}>{t.title}</div>
                {t.due_time && <div style={{ fontSize:10, color:'#81BFB7' }}>{t.due_time}</div>}
                {t.priority==='urgent' && t.status!=='done' && <div style={{ fontSize:9, color:'#c0392b', fontWeight:700 }}>Спешно</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ДЯСНА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

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
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2, textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:10 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i}>
                      <div style={{ fontSize:8, color:'rgba(255,255,255,0.7)' }}>{weekDays[i+1]}</div>
                      <div style={{ fontSize:14 }}>{getWeatherEmoji(weather.daily.weathercode[i+1])}</div>
                      <div style={{ fontSize:10, fontWeight:700 }}>{Math.round(weather.daily.temperature_2m_max[i+1])}°</div>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>Зарежда...</div>}
          </div>

          {/* БЪРЗ ДОСТЪП */}
          <div style={card}>
            <div style={{ fontSize:10, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>⚡ Бърз достъп</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <button onClick={() => setIsCalcOpen(true)} style={{ padding:'10px 12px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', textAlign:'left' }}>🧮 Отвори Калкулатора</button>
              <button style={{ padding:'10px 12px', background:'rgba(255,255,255,0.7)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, fontSize:12, cursor:'pointer', textAlign:'left' }}>📊 Месечен отчет</button>
              <button style={{ padding:'10px 12px', background:'rgba(255,255,255,0.7)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, fontSize:12, cursor:'pointer', textAlign:'left' }}>📦 Провери склада</button>
            </div>
          </div>

          {/* ФИНАНСИ */}
          <div style={card}>
            <div style={{ fontSize:10, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>💰 Финанси — {MONTHS[month]}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'#81BFB7' }}>Приходи</span><span style={{ fontWeight:700, color:'#3a2a35' }}>€0</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'#81BFB7' }}>Разходи</span><span style={{ fontWeight:700, color:'#F3A2BE' }}>€0</span></div>
              <div style={{ height:1, background:'#FFD3DD', margin:'4px 0' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'#81BFB7', fontWeight:700 }}>Печалба</span><span style={{ fontWeight:900, color:'#81BFB7' }}>€0</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* КАЛКУЛАТОР */}
      {isCalcOpen && (
        <Popup onClose={() => setIsCalcOpen(false)}>
          <PopupHeader title="Професионален Калкулатор BalloonPro" onClose={() => setIsCalcOpen(false)} />
          <div style={{ padding:32 }}><BalloonPro /></div>
        </Popup>
      )}

      {/* ЗАПИТВАНЕ */}
      {isInquiryOpen && (
        <Popup onClose={() => setIsInquiryOpen(false)} maxW="800px">
          <PopupHeader title="📝 Ново Запитване" onClose={() => setIsInquiryOpen(false)} />
          <div style={{ padding:'20px 32px 32px' }}>
            <InquiryForm onClose={() => { setIsInquiryOpen(false); loadInquiries(); }} />
          </div>
        </Popup>
      )}

      {/* ЗАДАЧА */}
      {isTaskOpen && (
        <Popup onClose={() => setIsTaskOpen(false)} maxW="600px">
          <PopupHeader title="✅ Нова Задача" onClose={() => setIsTaskOpen(false)} />
          <div style={{ padding:'20px 32px 32px' }}>
            <TaskForm onClose={() => setIsTaskOpen(false)} onSaved={loadTasks} />
          </div>
        </Popup>
      )}
    </div>
  );
};

export default Dashboard;