import React, { useState, useEffect } from 'react';
import BalloonPro from './BalloonPro.jsx';

const DAYS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];
const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'];

const Dashboard = () => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
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

  // Calendar
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const allActions = [
    { label: '+ Запитване', icon: '📝', bg: '#735377', text: '#f8ecff' },
    { label: 'Калкулатор', icon: '🎈', bg: '#a989ab', text: '#312A44', action: () => setIsCalcOpen(true) },
    { label: 'Календар', icon: '📅', bg: '#cebedc', text: '#312A44' },
    { label: '+ Оферта', icon: '📄', bg: '#d9cde4', text: '#735377' },
    { label: 'Финанси', icon: '💰', bg: '#f8ecff', text: '#735377' },
    { label: 'Склад', icon: '🎈', bg: '#a989ab', text: '#312A44' },
  ];

  const cardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };

  return (
    <div style={{ padding: '40px', backgroundColor: '#fcfaff', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#312A44', margin: 0, fontSize: '32px', fontWeight: '900' }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color: '#888', margin: '8px 0 25px 0', fontSize: '16px' }}>Твоят команден център е готов.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {allActions.map(b => (
              <button key={b.label} onClick={b.action} style={{ padding: '12px 18px', backgroundColor: b.bg, color: b.text, border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>
        </div>
        <button style={{ padding: '12px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer', fontSize: '20px' }}>⚙️</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '25px' }}>

        {/* КАЛЕНДАР */}
        <div style={cardStyle}>
          <div style={{ fontWeight: '900', color: '#312A44', marginBottom: '16px', fontSize: '16px' }}>{MONTHS[month]} {year}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {DAYS.map(d => <div key={d} style={{ fontSize: '11px', color: '#aaa', fontWeight: '700', padding: '4px 0' }}>{d}</div>)}
            {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate();
              return (
                <div key={day} style={{ padding: '6px 4px', borderRadius: '8px', fontSize: '13px', fontWeight: isToday ? '900' : '400', background: isToday ? '#735377' : 'transparent', color: isToday ? 'white' : '#312A44', cursor: 'pointer' }}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* СРЕДНА КОЛОНА */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900', letterSpacing: '0.05em' }}>СЛЕДВАЩИ СЪБИТИЯ</div>
            <div style={{ fontSize: '64px', fontWeight: '900', color: '#312A44' }}>0</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900', letterSpacing: '0.05em' }}>ЗАДАЧИ ЗА ДНЕС</div>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#312A44' }}>0</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900', letterSpacing: '0.05em' }}>ИНВЕНТАР</div>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#312A44' }}>0</div>
            </div>
          </div>
        </div>

        {/* ВРЕМЕТО */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ background: '#312A44', borderRadius: '24px', padding: '25px', color: 'white' }}>
            <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '12px' }}>
              {['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'][today.getDay()]}, {today.getDate()} {MONTHS[month]}
            </div>
            {weather ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>{getWeatherEmoji(weather.current.weathercode)}</div>
                <div>
                  <div style={{ fontSize: '42px', fontWeight: '900' }}>{Math.round(weather.current.temperature_2m)}°C</div>
                  <div style={{ fontSize: '13px', color: '#aaa' }}>💨 {Math.round(weather.current.windspeed_10m)} km/h (Казанлък)</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#aaa' }}>Зарежда...</div>
            )}
          </div>

          {weather && (
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900', letterSpacing: '0.05em', marginBottom: '16px' }}>7-ДНЕВНА ПРОГНОЗА</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {weather.daily.time.map((_, i) => (
                  <div key={i} style={{ fontSize: '11px' }}>
                    <div style={{ color: '#aaa', marginBottom: '4px' }}>{weekDays[i]}</div>
                    <div style={{ fontSize: '18px' }}>{getWeatherEmoji(weather.daily.weathercode[i])}</div>
                    <div style={{ fontWeight: '700', color: '#312A44' }}>{Math.round(weather.daily.temperature_2m_max[i])}°</div>
                    <div style={{ color: '#e74c3c', fontSize: '10px' }}>{Math.round(weather.daily.temperature_2m_min[i])}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isCalcOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(49,42,68,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fcfaff', borderRadius: '32px', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '20px 40px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderTopLeftRadius: '32px', borderTopRightRadius: '32px' }}>
              <h2 style={{ color: '#312A44', fontWeight: '900', margin: 0 }}>🎈 Професионален Калкулатор BalloonPro</h2>
              <button onClick={() => setIsCalcOpen(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '40px' }}>
              <BalloonPro />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;