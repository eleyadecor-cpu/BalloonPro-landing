import React from 'react';

const Dashboard = () => {
  return (
    <div className="page-container" style={{ padding: '30px', backgroundColor: '#fcfaff', minHeight: '100vh' }}>
      
      {/* 1. HEADER СЪС ЗАГЛАВИЕ И ВРЕМЕ */}
      <header style={{ 
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ color: 'var(--mauve-dark)', fontSize: '28px', margin: 0, fontWeight: '800' }}>
            Здравей, Balloon Pro! ✨
          </h1>
          <p style={{ color: '#888', marginTop: '5px', fontSize: '16px' }}>
            Твоят команден център е готов.
          </p>
        </div>
        
        {/* Weather Widget */}
        <div className="weather-card" style={{
          backgroundColor: 'white',
          padding: '15px 25px',
          borderRadius: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '11px', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Прогноза за декорация
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <span style={{ fontSize: '32px' }}>☀️</span>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--mauve-dark)' }}>22°C</div>
              <div style={{ fontSize: '12px', color: '#666' }}>София (Идеално време)</div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. БЪРЗИТЕ 5 БУТОНА */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        {[
          { label: 'Нова поръчка', icon: '➕', color: '#f0f4ff' },
          { label: 'Склад', icon: '🎈', color: '#fff0f5' },
          { label: 'Клиенти', icon: '👤', color: '#f0fff4' },
          { label: 'Календар', icon: '📅', color: '#fff9f0' },
          { label: 'Настройки', icon: '⚙️', color: '#f5f5f5' }
        ].map((item) => (
          <button 
            key={item.label}
            style={{
              padding: '25px 20px',
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.03)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              color: 'var(--mauve-dark)',
              fontWeight: '700',
              outline: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = 'var(--mauve-light)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)';
            }}
          >
            <div style={{ 
              fontSize: '30px', 
              backgroundColor: item.color, 
              width: '60px', 
              height: '60px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '18px',
              marginBottom: '5px'
            }}>
              {item.icon}
            </div>
            <span style={{ fontSize: '15px' }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 3. СТАТИСТИКИ ИЛИ ТАБЛИЦИ (МЯСТО ЗА БЪДЕЩО СЪДЪРЖАНИЕ) */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.5)', 
        borderRadius: '30px', 
        padding: '40px', 
        textAlign: 'center',
        border: '2px dashed #eee',
        color: '#aaa'
      }}>
        Тук ще се появят твоите последни поръчки и графици...
      </div>

    </div>
  );
};

export default Dashboard;