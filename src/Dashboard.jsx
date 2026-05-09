import React, { useState, useEffect } from 'react';
import BalloonPro from './BalloonPro.jsx';
import InquiryForm from './InquiryForm.jsx';
import InquiryList from './InquiryList.jsx';

const DAYS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];
const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];

const Dashboard = () => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(() =>
    new URLSearchParams(window.location.search).get('calc') === '1'
  );
  const [leftTab, setLeftTab] = useState('calendar');
  const [weather, setWeather] = useState(null);
  const today = new Date();

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.62&longitude=25.4&current=temperature_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FSofia&forecast_days=7')
      .then(r => r.json())
      .then(d => setWeather(d))
      .catch(() => {});
  }, []);

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code <= 48) return '☁️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  };

  const weekDays = ['Пет','Съб','Нед','Пон','Вто','Сря','Чет'];
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const allActions = [
    { label: '+ Запитване', icon: '📝', bg: '#F3A2BE', text: '#fff', action: () => setIsInquiryOpen(true) },
    { label: 'Калкулатор',  icon: '🎈', bg: '#FFD3DD', text: '#3a2a35', action: () => setIsCalcOpen(true) },
    { label: 'Календар',    icon: '📅', bg: '#C6E6E3', text: '#2a5450' },
    { label: '+ Оферта',    icon: '📄', bg: '#F0F9F8', text: '#81BFB7', style: { border: '1px solid #C6E6E3' } },
    { label: 'Финанси',     icon: '💰', bg: '#F0F9F8', text: '#81BFB7', style: { border: '1px solid #C6E6E3' } },
    { label: 'Склад',       icon: '🎈', bg: '#C6E6E3', text: '#2a5450' },
  ];

  const cardStyle = {
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: '25px',
    borderRadius: '24px',
    border: '1px solid rgba(243,162,190,0.25)',
    backdropFilter: 'blur(4px)',
  };

  const popup = (content, maxW = '1000px') => (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:'20px' }}>
      <div style={{ backgroundColor:'#F0F9F8', borderRadius:'32px', width:'90%', maxWidth:maxW, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
        {content}
      </div>
    </div>
  );

  return (
    <div style={{ padding:'40px', background:'linear-gradient(135deg, #FFD3DD 0%, #F0F9F8 45%, #C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>

      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'30px' }}>
        <div>
          <h1 style={{ color:'#3a2a35', margin:0, fontSize:'32px', fontWeight:'900' }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color:'#81BFB7', margin:'8px 0 25px 0', fontSize:'16px' }}>Твоят команден център е готов.</p>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {allActions.map(b => (
              <button key={b.label} onClick={b.action} style={{ padding:'12px 18px', backgroundColor:b.bg, color:b.text, border:'none', borderRadius:'12px', fontWeight:'800', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)', ...(b.style||{}) }}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>
        </div>
        <button style={{ padding:'12px', borderRadius:'12px', border:'1px solid #FFD3DD', backgroundColor:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:'20px' }}>⚙️</button>
      </div>

      {/* MAIN GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr 320px', gap:'25px' }}>

        {/* ЛЯВА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => setLeftTab('calendar')} style={{ flex:1, padding:'8px', borderRadius:12, border:'none', background: leftTab==='calendar' ? '#F3A2BE' : 'rgba(255,255,255,0.6)', color: leftTab==='calendar' ? '#fff' : '#81BFB7', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              📅 Календар
            </button>
            <button onClick={() => setLeftTab('inquiries')} style={{ flex:1, padding:'8px', borderRadius:12, border:'none', background: leftTab==='inquiries' ? '#F3A2BE' : 'rgba(255,255,255,0.6)', color: leftTab==='inquiries' ? '#fff' : '#81BFB7', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              📝 Запитвания
            </button>
          </div>

          {leftTab === 'calendar' && (
            <div style={cardStyle}>
              <div style={{ fontWeight:'900', color:'#3a2a35', marginBottom:'16px', fontSize:'16px' }}>{MONTHS[month]} {year}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', textAlign:'center' }}>
                {DAYS.map(d => <div key={d} style={{ fontSize:'11px', color:'#C6E6E3', fontWeight:'700', padding:'4px 0' }}>{d}</div>)}
                {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === today.getDate();
                  return (
                    <div key={day} style={{ padding:'6px 4px', borderRadius:'8px', fontSize:'13px', fontWeight: isToday ? '900' : '400', background: isToday ? '#F3A2BE' : 'transparent', color: isToday ? 'white' : '#3a2a35', cursor:'pointer' }}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {leftTab === 'inquiries' && (
            <div style={{ maxHeight:'600px', overflowY:'auto' }}>
              <InquiryList onOpenCalc={() => setIsCalcOpen(true)} />
            </div>
          )}
        </div>

        {/* СРЕДНА КОЛОНА */}
        <div style={{ display:'flex', flexDirection:'column', gap:'25px' }}>
          <div style={{ ...cardStyle, flex:1 }}>
            <div style={{ fontSize:'12px', color:'#F3A2BE', fontWeight:'900', letterSpacing:'0.05em' }}>СЛЕДВАЩИ СЪБИТИЯ</div>
            <div style={{ fontSize:'64px', fontWeight:'900', color:'#3a2a35' }}>0</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px' }}>
            <div style={cardStyle}>
              <div style={{ fontSize:'12px', color:'#81BFB7', fontWeight:'900', letterSpacing:'0.05em' }}>ЗАДАЧИ ЗА ДНЕС</div>
              <div style={{ fontSize:'48px', fontWeight:'900', color:'#3a2a35' }}>0</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize:'12px', color:'#81BFB7', fontWeight:'900', letterSpacing:'0.05em' }}>ИНВЕНТАР</div>
              <div style={{ fontSize:'48px', fontWeight:'900', color:'#3a2a35' }}>0</div>
            </div>
          </div>
        </div>

        {/* ВРЕМЕТО */}
        <div style={{ display:'flex', flexDirection:'column', gap:'25px' }}>
          <div style={{ background:'#81BFB7', borderRadius:'24px', padding:'25px', color:'white' }}>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'12px' }}>
              {['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'][today.getDay()]}, {today.getDate()} {MONTHS[month]}
            </div>
            {weather ? (
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ fontSize:'48px' }}>{getWeatherEmoji(weather.current.weathercode)}</div>
                <div>
                  <div style={{ fontSize:'42px', fontWeight:'900' }}>{Math.round(weather.current.temperature_2m)}°C</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>💨 {Math.round(weather.current.windspeed_10m)} km/h (Казанлък)</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)' }}>Зарежда...</div>
            )}
          </div>

          {weather && (
            <div style={cardStyle}>
              <div style={{ fontSize:'12px', color:'#F3A2BE', fontWeight:'900', letterSpacing:'0.05em', marginBottom:'16px' }}>7-ДНЕВНА ПРОГНОЗА</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', textAlign:'center' }}>
                {weather.daily.time.map((_, i) => (
                  <div key={i} style={{ fontSize:'11px' }}>
                    <div style={{ color:'#81BFB7', marginBottom:'4px' }}>{weekDays[i]}</div>
                    <div style={{ fontSize:'18px' }}>{getWeatherEmoji(weather.daily.weathercode[i])}</div>
                    <div style={{ fontWeight:'700', color:'#3a2a35' }}>{Math.round(weather.daily.temperature_2m_max[i])}°</div>
                    <div style={{ color:'#F3A2BE', fontSize:'10px' }}>{Math.round(weather.daily.temperature_2m_min[i])}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* КАЛКУЛАТОР ПОП-АП */}
      {isCalcOpen && popup(
        <>
          <div style={{ padding:'20px 40px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'rgba(255,255,255,0.9)', borderTopLeftRadius:'32px', borderTopRightRadius:'32px' }}>
            <h2 style={{ color:'#3a2a35', fontWeight:'900', margin:0 }}>🎈 Професионален Калкулатор BalloonPro</h2>
            <button onClick={() => setIsCalcOpen(false)} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:'40px', height:'40px', cursor:'pointer', fontSize:'20px' }}>✕</button>
          </div>
          <div style={{ padding:'40px' }}><BalloonPro /></div>
        </>
      )}

      {/* ЗАПИТВАНЕ ПОП-АП */}
      {isInquiryOpen && popup(
        <>
          <div style={{ padding:'20px 40px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'rgba(255,255,255,0.9)', borderTopLeftRadius:'32px', borderTopRightRadius:'32px' }}>
            <h2 style={{ color:'#3a2a35', fontWeight:'900', margin:0 }}>📝 Ново Запитване</h2>
            <button onClick={() => setIsInquiryOpen(false)} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:'40px', height:'40px', cursor:'pointer', fontSize:'20px' }}>✕</button>
          </div>
          <div style={{ padding:'20px 40px 40px' }}>
            <InquiryForm onClose={() => setIsInquiryOpen(false)} />
          </div>
        </>, '800px'
      )}
    </div>
  );
};

export default Dashboard;