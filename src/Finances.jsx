import React, { useState, useEffect } from 'react'
import { db } from './supabase'
import { eur } from './utils'

export default function Finances() {
  const [stats, setStats] = useState({ revenue: 0, costs: 0, transport: 0, profit: 0 })

  useEffect(() => {
    async function loadStats() {
      const { data: events } = await db.from('events').select('total_price, transport_fee, km')
      
      let rev = 0, trans = 0, ammort = 0
      events?.forEach(e => {
        rev += e.total_price || 0
        trans += e.transport_fee || 0
        // Новата логика: 0.35 лв на км амортизация
        ammort += (e.km || 0) * 0.35 
      })

      setStats({
        revenue: rev,
        transport: trans,
        costs: ammort,
        profit: rev - ammort
      })
    }
    loadStats()
  }, [])

  return (
    <div className="page-container">
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--mauve-dark)', fontSize: '28px' }}>Финансов Отчет 📈</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard label="Общ Приход" value={eur(stats.revenue)} color="var(--jubilee)" />
        <StatCard label="Транспортни такси (Приход)" value={eur(stats.transport)} color="var(--green)" />
        <StatCard label="Амортизация (Разход 0.35/км)" value={eur(stats.costs)} color="var(--red)" />
        <StatCard label="Чиста Печалба" value={eur(stats.profit)} color="var(--mauve-dark)" isBold />
      </div>

      <div style={{ marginTop: '40px', padding: '25px', background: 'white', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <h3 style={{ color: 'var(--mauve-dark)', marginBottom: '15px' }}>Анализ на разходите</h3>
        <p style={{ color: 'var(--gray)' }}>
          Системата автоматично изчислява <b>0.35 лв.</b> разход за всеки изминат километър (гориво + поддръжка), 
          за да ти даде реална представа за печалбата след амортизация на автомобила.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, isBold }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '20px', 
      border: '1px solid var(--border)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }}>
      <div style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ 
        fontSize: isBold ? '24px' : '20px', 
        fontWeight: '800', 
        color: color 
      }}>{value}</div>
    </div>
  )
}