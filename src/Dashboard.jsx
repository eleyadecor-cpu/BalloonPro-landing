import React, { useState } from 'react';

const Dashboard = () => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Стилизирани бутони по твоята палитра
  const Row1 = [
    { label: '+ Запитване', icon: '📝', bg: '#312A44', text: '#D7C5D2' },
    { label: 'Калкулатор', icon: '🧮', bg: '#88703E', text: '#DAD4DF', action: () => setIsCalcOpen(true) },
    { label: 'Календар', icon: '📅', bg: '#BAB0C8', text: '#312A44' },
  ];

  const Row2 = [
    { label: '+ Оферта', icon: '📄', bg: '#D7C5D2', text: '#312A44' },
    { label: 'Финанси', icon: '💰', bg: '#DAD4DF', text: '#88703E' },
    { label: 'Склад', icon: '🎈', bg: '#A989AB', text: '#312A44' },
  ];

  const weekForecast = [
    { day: 'Пет', date: '08.05', temp: '22°', wind: '12', icon: '☀️' },
    { day: 'Съб', date: '09.05', temp: '24°', wind: '25', icon: '💨' },
    { day: 'Нед', date: '10.05', temp: '21°', wind: '8', icon: '🌤️' },
    { day: 'Пон', date: '11.05', temp: '19°', wind: '15', icon: '🌦️' },
    { day: 'Вто', date: '12.05', temp: '23°', wind: '10', icon: '☀️' },
    { day: 'Сря', date: '13.05', temp: '25°', wind: '5', icon: '☀️' },
    { day: 'Чет', date: '14.05', temp: '20°', wind: '30', icon: '💨' },
  ];

  return (
    <div style={{ padding: '30px', backgroundColor: '#fcfaff', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#312A44', margin: 0, fontWeight: '800' }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color: '#888', marginTop: '5px' }}>Твоят команден център е готов.</p>
          
          {/* Ред 1: Оперативни */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {Row1.map(b => (
              <button key={b.label} onClick={b.action} style={{ padding: '10px 20px', backgroundColor: b.bg, color: b.text, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{b.icon}</span> {b.label}
              </button>
            ))}
          </div>

          {/* Ред 2: Инструменти */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {Row2.map(b => (
              <button key={b.label} style={{ padding: '10px 20px', backgroundColor: b.bg, color: b.text, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{b.icon}</span> {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Настройки (Червената стрелка) */}
        <button style={{ height: '40px', width: '40px', borderRadius: '10px', border: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer', alignSelf: 'flex-start' }}>⚙️</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        
        {/* ЛЯВА ЧАСТ: Календар и Статистики */}
        <div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            {/* Мини Календар */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', flex: '1', border: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: '800', color: '#312A44', marginBottom: '15px' }}>Май 2026</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontSize: '12px' }}>
                {[...Array(31)].map((_, i) => (
                  <div key={i} style={{ position: 'relative', padding: '5px' }}>
                    {i + 1}
                    {[8, 12, 15].includes(i + 1) && <div style={{ width: '4px', height: '4px', backgroundColor: '#BA80C8', borderRadius: '50%', margin: '2px auto' }}></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ flex: '1' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '11px', color: '#aaa', fontWeight: '800' }}>СЛЕДВАЩИ СЪБИТИЯ</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#312A44' }}>0</div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', flex: '1', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '11px', color: '#aaa', fontWeight: '800' }}>ЗАДАЧИ ЗА ДНЕС</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#312A44' }}>0</div>
             </div>
             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', flex: '1', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '11px', color: '#aaa', fontWeight: '800' }}>НАЛИЧЕН ИНВЕНТАР</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#312A44' }}>0</div>
             </div>
          </div>
        </div>

        {/* ДЯСНА ЧАСТ: Време и Прогноза */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ backgroundColor: '#312A44', padding: '20px', borderRadius: '20px', color: 'white' }}>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Петък, 08 Май</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
              <span style={{ fontSize: '40px' }}>☀️</span>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>22°C</div>
                <div style={{ fontSize: '12px' }}>💨 12 km/h</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '15px', textAlign: 'center' }}>7-ДНЕВНА ПРОГНОЗА</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {weekForecast.map(f => (
                <div key={f.day} style={{ textAlign: 'center', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', color: '#888' }}>{f.day}</div>
                  <div style={{ margin: '5px 0' }}>{f.icon}</div>
                  <div style={{ fontWeight: 'bold' }}>{f.temp}</div>
                  <div style={{ color: f.wind > 20 ? 'red' : '#312A44', fontSize: '9px', fontWeight: 'bold' }}>{f.wind}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* POP-UP CALCULATOR */}
      {isCalcOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>🧮 Калкулатор</h3>
              <button onClick={() => setIsCalcOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', textAlign: 'right', fontSize: '24px', borderRadius: '10px', marginBottom: '10px' }}>0</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[7, 8, 9, '/', 4, 5, 6, '*', 1, 2, 3, '-', 0, '.', '=', '+'].map(n => (
                <button key={n} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #eee', cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;