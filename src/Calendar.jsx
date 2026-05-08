import React, { useEffect, useState, useCallback } from 'react'
import { db } from './supabase'
import { fmtDate, eur0 } from './utils'

const BG_DAYS = ['Нед','Пон','Вт','Ср','Чет','Пет','Съб']
const BG_MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']

// Твоите нови цветове за типове събития
const EVENT_COLORS = {
  'Рожден ден':'#805C98', 'Кръщене':'#BD97C6', 'Сватба':'#382842',
  'Корпоративно':'#4e8c69', 'Друго':'#7a7490'
}

export default function Calendar() {
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [weather, setWeather] = useState({}) // Тук ще пазим времето

  // Зареждане на данни
  useEffect(() => {
    async function load() {
      const { data: ev } = await db.from('quotes').select('*, clients(name)')
      const { data: ts } = await db.from('tasks').select('*')
      setEvents(ev || [])
      setTasks(ts || [])
    }
    load()
  }, [])

  // Генериране на дните за месеца
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--mauve-dark)' }}>{BG_MONTHS[month]} {year}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="nav-link" onClick={() => setDate(new Date(year, month - 1))}>◀</button>
          <button className="nav-link" onClick={() => setDate(new Date())}>Днес</button>
          <button className="nav-link" onClick={() => setDate(new Date(year, month + 1))}>▶</button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '1px', 
        background: 'var(--border)',
        borderRadius: '15px',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        {BG_DAYS.map(d => (
          <div key={d} style={{ background: '#f8f5fa', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--gray)' }}>{d}</div>
        ))}
        
        {/* Празни квадратчета за началото на месеца */}
        {Array.from({ length: firstDay }).map((_, i) => <div key={i} style={{ background: 'white', minHeight: '120px' }} />)}

        {days.map(d => {
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const dayEvents = events.filter(e => e.event_date === iso)
          const dayTasks = tasks.filter(t => t.due_date === iso)
          const isToday = iso === new Date().toISOString().slice(0, 10)

          return (
            <div key={d} style={{ background: 'white', minHeight: '120px', padding: '8px', border: isToday ? '2px solid var(--jubilee)' : 'none' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', color: isToday ? 'var(--jubilee)' : 'inherit' }}>{d}</div>
              
              {/* Събития */}
              {dayEvents.map(e => (
                <div key={e.id} style={{ 
                  fontSize: '10px', 
                  background: EVENT_COLORS[e.event_type] || 'var(--jubilee)', 
                  color: 'white', 
                  padding: '2px 5px', 
                  borderRadius: '4px', 
                  marginBottom: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}>
                  🎈 {e.clients?.name}
                </div>
              ))}

              {/* Задачи */}
              {dayTasks.map(t => (
                <div key={t.id} style={{ fontSize: '10px', color: 'var(--mauve-dark)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <input type="checkbox" checked={t.is_completed} readOnly style={{ width: '10px', height: '10px' }} />
                  <span style={{ textDecoration: t.is_completed ? 'line-through' : 'none' }}>{t.title}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      
      <div style={{ marginTop: '20px', color: 'var(--gray)', fontSize: '12px' }}>
        💡 Кликни на дата, за да добавиш нова задача или събитие (функцията ще бъде активна в следващата стъпка).
      </div>
    </div>
  )
}