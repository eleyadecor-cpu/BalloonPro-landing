import React from 'react';

const Dashboard = () => {
  // Дефиниране на бутоните според твоята палитра
  const quickActions = [
    { label: 'Нова поръчка', icon: '➕', bg: '#312A44', text: '#D7C5D2' }, // Midnight Orchid
    { label: 'Склад', icon: '🎈', bg: '#88703E', text: '#DAD4DF' },        // Dusky Lilac
    { label: 'Клиенти', icon: '👤', bg: '#BAB0C8', text: '#312A44' },      // Iris Mist
    { label: 'Календар', icon: '📅', bg: '#D7C5D2', text: '#312A44' },      // Plum Blossom
    { label: 'Настройки', icon: '⚙️', bg: '#DAD4DF', text: '#88703E' }       // Silver Wisteria
  ];

  return (
    <div className="page-container" style={{ padding: '30px', backgroundColor: '#fcfaff', minHeight: '100vh' }}>
      
      {/* HEADER СЪС ЗАГЛАВИЕ И ВРЕМЕ */}
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#312A44', fontSize: '28px', margin: 0, fontWeight: '800' }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color: '#888', marginTop: '5px' }}>Твоят команден център е готов.</p>
          
          {/* СИНЯТА СТРЕЛКА: Твоите нови дискретни бутони */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <button 
                key={action.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: action.bg,
                  color: action.text,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span style={{ fontSize: '14px' }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Widget */}
        <div className="weather-card" style={{ backgroundColor: 'white', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Прогноза за декорация</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <span style={{ fontSize: '32px' }}>☀️</span>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#312A44' }}>22°C</div>
              <div style={{ fontSize: '12px', color: '#666' }}>София (Идеално време)</div>
            </div>
          </div>
        </div>
      </header>

      {/* КАРТИ СЪС СТАТИСТИКИ (Старият дизайн) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {['СЛЕДВАЩИ СЪБИТИЯ', 'ЗАДАЧИ ЗА ДНЕС', 'НАЛИЧЕН ИНВЕНТАР'].map(title => (
          <div key={title} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', marginBottom: '10px' }}>{title}</div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#312A44' }}>0</div>
          </div>
        ))}
      </div>

      {/* СЕКЦИИ СЪС ЗАДАЧИ (Старият дизайн) */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', flex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#312A44', fontWeight: 'bold' }}>
            <span>📅</span> Предстоящи монтажи
          </div>
          <p style={{ color: '#aaa', marginTop: '15px' }}>Няма предстоящи събития.</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#312A44', fontWeight: 'bold' }}>
            <span>✅</span> Задачи
          </div>
          <div style={{ marginTop: '15px', padding: '10px', border: '1px dashed #ddd', borderRadius: '8px', textAlign: 'center', color: '#88703E', fontSize: '13px' }}>
            + Нова задача
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;