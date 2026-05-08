import React, { useEffect, useState } from 'react'
import { db } from './supabase' // Връзката, която току-що оправихме
import { eur0, daysFrom, fmtDate } from './utils'

export default function Dashboard() {
  const [stats, setStats] = useState({ quotes: [], tasks: [], inventory: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const today = new Date().toISOString().slice(0, 10)
        
        // Вземаме данни от новата база
        const [{ data: quotes }, { data: tasks }, { data: products }] = await Promise.all([
          db.from('quotes').select('*, clients(name)').order('event_date').limit(5),
          db.from('tasks').select('*').eq('due_date', today),
          db.from('products').select('quantity')
        ])

        setStats({
          quotes: quotes || [],
          tasks: tasks || [],
          inventory: products?.length || 0
        })
      } catch (err) {
        console.error("Грешка при зареждане:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="page-container">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: 'var(--mauve-dark)', fontSize: '28px', margin: 0 }}>Здравей, Balloon Pro! ✨</h1>
          <p style={{ color: 'var(--gray)', marginTop: '5px' }}>Твоят команден център е готов.</p>
        </div>
        
        {/* Weather Widget (Placeholder) */}
        <div className="weather-card">
          <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Прогноза за декорация</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '12px' }}>
            <span style={{ fontSize: '32px' }}>☀️</span>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>22°C</div>
              <div style={{ fontSize: '12px' }}>София (Идеално време)</div>
            </div>
          </div>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Следващи събития</div>
          <div className="value">{stats.quotes.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Задачи за днес</div>
          <div className="value">{stats.tasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Наличен инвентар</div>
          <div className="value">{stats.inventory}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        <div className="stat-card">
          <h3 style={{ color: 'var(--mauve-dark)', marginBottom: '20px' }}>📅 Предстоящи монтажи</h3>
          {stats.quotes.length > 0 ? stats.quotes.map(q => (
            <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{q.clients?.name || 'Клиент'}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{q.event_type}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--jubilee)', fontWeight: 'bold' }}>{fmtDate(q.event_date)}</div>
              </div>
            </div>
          )) : <p style={{color: 'var(--gray)', fontSize: '14px'}}>Няма предстоящи събития.</p>}
        </div>

        <div className="stat-card">
          <h3 style={{ color: 'var(--mauve-dark)', marginBottom: '20px' }}>✅ Задачи</h3>
          <button className="nav-link" style={{ width: '100%', background: 'var(--bg)', color: 'var(--jubilee)', border: '1px dashed var(--jubilee)', justifyContent: 'center' }}>
            + Нова задача
          </button>
        </div>
      </div>
    </div>
  )
}