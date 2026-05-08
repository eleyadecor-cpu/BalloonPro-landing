import React, { useState } from 'react';
import BalloonPro from './BalloonPro.jsx'; // Импортираме твоя калкулатор

const Dashboard = () => {
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Всички 6 бутона в един ред с правилните цветове
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
      
      {/* HEADER & ALL BUTTONS IN ONE LINE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#312A44', margin: 0, fontSize: '32px', fontWeight: '900' }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color: '#888', margin: '8px 0 25px 0', fontSize: '16px' }}>Твоят команден център е готов.</p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {allActions.map(b => (
              <button key={b.label} onClick={b.action} style={{ padding: '12px 18px', backgroundColor: b.bg, color: b.text, border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>
        </div>
        <button style={{ padding: '12px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer', fontSize: '20px' }}>⚙️</button>
      </div>

      {/* ОСНОВЕН ГРИД (Layout-ът, който харесваш) */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '25px', marginTop: '40px' }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: '900', color: '#312A44', marginBottom: '20px' }}>Май 2026</div>
          {/* ... Календар ... */}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '900' }}>СЛЕДВАЩИ СЪБИТИЯ</div>
            <div style={{ fontSize: '64px', fontWeight: '900', color: '#312A44' }}>0</div>
          </div>
          <div style={{ display: 'flex', gap: '25px' }}>
            <div style={cardStyle} className="flex-1">ЗАДАЧИ: 0</div>
            <div style={cardStyle} className="flex-1">ИНВЕНТАР: 0</div>
          </div>
        </div>

        <div style={cardStyle}>
          {/* ... Прогноза за времето ... */}
        </div>
      </div>

      {/* МОДАЛЕН ПРОЗОРЕЦ С ТВОЯ BALLOONPRO КАЛКУЛАТОР */}
      {isCalcOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(49, 42, 68, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
          <div style={{ backgroundColor: '#fcfaff', borderRadius: '32px', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '20px 40px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', sticky: 'top', backgroundColor: 'white', borderTopLeftRadius: '32px', borderTopRightRadius: '32px' }}>
              <h2 style={{ color: '#312A44', fontWeight: '900', margin: 0 }}>🎈 Професионален Калкулатор BalloonPro</h2>
              <button onClick={() => setIsCalcOpen(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '40px' }}>
              <BalloonPro /> {/* ТУК СЕ ЗАРЕЖДАТ ВСИЧКИ ТВОИ СТРАНИЦИ (Основа, Цветове и т.н.) */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
