import React, { useState } from 'react';

const Dashboard = () => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  
  // Данни за специализирания калкулатор
  const [calcData, setCalcData] = useState({ count: 0, size: 30, helium: 0 });

  // Всички 6 бутона в един ред с твоите цветове
  const allActions = [
    { label: '+ Запитване', icon: '📝', bg: '#735377', text: '#f8ecff' },
    { label: 'Калкулатор', icon: '🎈', bg: '#a989ab', text: '#312A44', action: () => setIsCalcOpen(true) },
    { label: 'Календар', icon: '📅', bg: '#cebedc', text: '#312A44' },
    { label: '+ Оферта', icon: '📄', bg: '#d9cde4', text: '#735377' },
    { label: 'Финанси', icon: '💰', bg: '#f8ecff', text: '#735377' },
    { label: 'Склад', icon: '🎈', bg: '#a989ab', text: '#312A44' },
  ];

  const weekForecast = [
    { day: 'Пет', temp: '22°', wind: '12', icon: '☀️' },
    { day: 'Съб', temp: '24°', wind: '25', icon: '💨' },
    { day: 'Нед', temp: '21°', wind: '8', icon: '🌤️' },
    { day: 'Пон', temp: '19°', wind: '15', icon: '🌦️' },
    { day: 'Вто', temp: '23°', wind: '10', icon: '☀️' },
    { day: 'Сря', temp: '25°', wind: '5', icon: '☀️' },
    { day: 'Чет', temp: '20°', wind: '30', icon: '💨' },
  ];

  const cardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };

  return (
    <div style={{ padding: '40px', backgroundColor: '#fcfaff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER & SINGLE LINE BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#312A44', margin: 0, fontSize: '32px', fontWeight: '900' }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color: '#888', margin: '8px 0 25px 0', fontSize: '16px' }}>Твоят команден център е готов.</p>
          
          {/* ЕДИН ЕДИНСТВЕН РЕД С БУТОНИ */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {allActions.map(b => (
              <button 
                key={b.label} 
                onClick={b.action} 
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: b.bg, 
                  color: b.text, 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: '800', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  fontSize: '14px'
                }}
              >
                {b.icon} {b.label}
              </button>
            ))}
          </div>
        </div>
        <button style={{ padding: '12px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer', fontSize: '20px' }}>⚙️</button>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '25px', marginTop: '40px' }}>
        
        {/* ЛЯВО: Мини Календар */}
        <div style={cardStyle}>
          <div style={{ fontWeight: '900', color: '#312A44', marginBottom: '20px', fontSize: '18px' }}>Май 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontSize: '13px' }}>
            {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map(d => <div key={d} style={{ color: '#ccc', fontWeight: '800' }}>{d}</div>)}
            {[...Array(31)].map((_, i) => (
              <div key={i} style={{ padding: '8px 0', position: 'relative', fontWeight: '600', color: '#555' }}>
                {i + 1}
                {[8, 12, 15].includes(i + 1) && <div style={{ width: '5px', height: '5px', backgroundColor: '#735377', borderRadius: '50%', margin: '4px auto' }}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* ЦЕНТЪР: Събития & Статистики */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900', letterSpacing: '1px' }}>СЛЕДВАЩИ СЪБИТИЯ</div>
            <div style={{ fontSize: '64px', fontWeight: '900', color: '#312A44', marginTop: '10px' }}>0</div>
          </div>
          <div style={{ display: 'flex', gap: '25px' }}>
            <div style={{ ...cardStyle, flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900' }}>ЗАДАЧИ ЗА ДНЕС</div>
              <div style={{ fontSize: '40px', fontWeight: '900', color: '#312A44' }}>0</div>
            </div>
            <div style={{ ...cardStyle, flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900' }}>ИНВЕНТАР</div>
              <div style={{ fontSize: '40px', fontWeight: '900', color: '#312A44' }}>0</div>
            </div>
          </div>
        </div>

        {/* ДЯСНО: Време */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ backgroundColor: '#312A44', padding: '25px', borderRadius: '28px', color: 'white' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Петък, 08 Май</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
              <span style={{ fontSize: '48px' }}>☀️</span>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '900' }}>22°C</div>
                <div style={{ fontSize: '14px', color: '#cebedc' }}>💨 12 km/h (София)</div>
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontWeight: '900', fontSize: '11px', marginBottom: '15px', textAlign: 'center', color: '#312A44' }}>7-ДНЕВНА ПРОГНОЗА</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
              {weekForecast.map(f => (
                <div key={f.day} style={{ textAlign: 'center', fontSize: '10px' }}>
                  <div style={{ fontWeight: '800', color: '#bbb' }}>{f.day}</div>
                  <div style={{ fontSize: '16px', margin: '3px 0' }}>{f.icon}</div>
                  <div style={{ fontWeight: '900' }}>{f.temp}</div>
                  <div style={{ color: f.wind > 20 ? '#ff4d4d' : '#a989ab', fontSize: '9px', fontWeight: '900' }}>{f.wind}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* POP-UP BALLOONPRO CALCULATOR */}
      {isCalcOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(49, 42, 68, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '32px', width: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#312A44', fontWeight: '900' }}>🎈 BalloonPro Калкулатор</h3>
              <button onClick={() => setIsCalcOpen(false)} style={{ border: 'none', background: '#fcfaff', cursor: 'pointer', fontSize: '20px', width: '40px', height: '40px', borderRadius: '50%', color: '#312A44' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#735377', marginBottom: '8px' }}>Брой балони</label>
                <input type="number" placeholder="0" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '16px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#735377', marginBottom: '8px' }}>Диаметър (см)</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '16px', outline: 'none' }}>
                  <option>25 см (стандарт)</option>
                  <option>30 см</option>
                  <option>45 см (гигант)</option>
                  <option>60 см</option>
                </select>
              </div>
              <div style={{ backgroundColor: '#f8ecff', padding: '20px', borderRadius: '20px', border: '1px solid #cebedc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '700', color: '#312A44' }}>Необходим хелий:</span>
                  <span style={{ fontWeight: '900', color: '#735377' }}>0.00 m³</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700', color: '#312A44' }}>Приблизителна цена:</span>
                  <span style={{ fontWeight: '900', color: '#735377' }}>0.00 лв.</span>
                </div>
              </div>
              <button style={{ backgroundColor: '#735377', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', fontSize: '16px' }}>Изчисли себестойност</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;