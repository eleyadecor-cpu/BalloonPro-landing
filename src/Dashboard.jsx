import React from 'react';

const Dashboard = () => {
  // Твоите нови 5 бутона с цветове точно от последната палитра
  const quickActions = [
    { label: 'Нова поръчка', icon: '➕', bg: '#735377', text: '#f8ecff' },
    { label: 'Склад', icon: '🎈', bg: '#a989ab', text: '#312A44' },
    { label: 'Клиенти', icon: '👤', bg: '#cebedc', text: '#312A44' },
    { label: 'Календар', icon: '📅', bg: '#d9cde4', text: '#735377' },
    { label: 'Настройки', icon: '⚙️', bg: '#f8ecff', text: '#735377' }
  ];

  return (
    <div className="page-container" style={{ padding: '30px', backgroundColor: '#fcfaff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. HEADER */}
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ color: '#312A44', fontSize: '28px', margin: 0, fontWeight: '800' }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color: '#888', marginTop: '5px' }}>Твоят команден център е готов.</p>
          
          {/* БЪРЗИ БУТОНИ (Под заглавието) */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <button 
                key={action.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: action.bg,
                  color: action.text,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Weather Widget (С подобрена видимост на текста) */}
        <div className="weather-card" style={{ 
          backgroundColor: '#312A44', // Midnight Orchid от твоята палитра
          padding: '20px 30px', 
          borderRadius: '24px', 
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          minWidth: '250px'
        }}>
          <div style={{ fontSize: '11px', color: '#cebedc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Прогноза за декорация
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
            <span style={{ fontSize: '35px' }}>☀️</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>22°C</div>
              <div style={{ fontSize: '13px', color: '#d9cde4' }}>София (Идеално време)</div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. СТАТИСТИКИ (Карти) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {['СЛЕДВАЩИ СЪБИТИЯ', 'ЗАДАЧИ ЗА ДНЕС', 'НАЛИЧЕН ИНВЕНТАР'].map(title => (
          <div key={title} style={{ 
            backgroundColor: 'white', 
            padding: '25px', 
            borderRadius: '20px', 
            flex: '1', 
            minWidth: '200px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', marginBottom: '10px' }}>{title}</div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#312A44' }}>0</div>
          </div>
        ))}
      </div>

      {/* 3. СЕКЦИИ */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', flex: '2', minWidth: '300px', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#312A44', fontWeight: '800', fontSize: '18px' }}>
            <span style={{ fontSize: '22px' }}>📅</span> Предстоящи монтажи
          </div>
          <p style={{ color: '#aaa', marginTop: '20px' }}>Няма предстоящи събития за днес.</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', flex: '1', minWidth: '250px', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#312A44', fontWeight: '800', fontSize: '18px' }}>
            <span style={{ fontSize: '22px' }}>✅</span> Задачи
          </div>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            border: '2px dashed #eee', 
            borderRadius: '12px', 
            textAlign: 'center', 
            color: '#a989ab', 
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            + Нова задача
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;