import React, { useEffect, useState, useCallback } from 'react'
import { db } from './supabase' // Свързваме с новия файл, който оправихме
import { eur, eur0 } from './utils'

const PRODUCT_TYPES = ['Консуматив','Реквизит','Наемен','Handmade','Друго']
const UNITS = ['бр','пакет','метър','литър','кг','компл.']

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('products')
  const [search, setSearch] = useState('')

  // Зареждане на данни от новата база
  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.from('products').select('*').order('name')
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = products.filter(p => p.quantity <= p.min_quantity)

  return (
    <div className="page-container">
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--mauve-dark)', fontSize: '28px', margin: 0 }}>Склад и Наличности 📦</h1>
        <p style={{ color: 'var(--gray)' }}>Управлявай своите балони и консумативи.</p>
      </header>

      {/* Табове в твоя стил */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {[
          { id: 'products', label: `Всички (${products.length})`, ico: '📦' },
          { id: 'low', label: `Ниски наличности (${lowStock.length})`, ico: '⚠️' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: tab === t.id ? 'var(--jubilee)' : 'white',
              color: tab === t.id ? 'white' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{t.ico}</span> {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Търси по име или SKU код..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 15px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--bg)' }}>
              <th style={{ padding: '12px', color: 'var(--gray)', fontSize: '12px' }}>АРТИКУЛ</th>
              <th style={{ padding: '12px', color: 'var(--gray)', fontSize: '12px' }}>КОЛИЧЕСТВО</th>
              <th style={{ padding: '12px', color: 'var(--gray)', fontSize: '12px' }}>ЦЕНА (ЕД.)</th>
              <th style={{ padding: '12px', color: 'var(--gray)', fontSize: '12px' }}>СТАТУС</th>
            </tr>
          </thead>
          <tbody>
            {(tab === 'low' ? lowStock : filtered).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--bg)' }}>
                <td style={{ padding: '15px 12px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--mauve-dark)' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray)' }}>SKU: {p.sku || '---'}</div>
                </td>
                <td style={{ padding: '15px 12px' }}>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: p.quantity <= p.min_quantity ? 'var(--red)' : 'var(--text)' 
                  }}>
                    {p.quantity} {p.unit}
                  </span>
                </td>
                <td style={{ padding: '15px 12px' }}>{eur(p.price)}</td>
                <td style={{ padding: '15px 12px' }}>
                  {p.quantity <= p.min_quantity ? (
                    <span style={{ background: '#fff0f0', color: 'var(--red)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                      ЗА ПОРЪЧКА
                    </span>
                  ) : (
                    <span style={{ background: '#f0fff4', color: 'var(--green)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                      В НАЛИЧНОСТ
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>
            Няма намерени артикули.
          </div>
        )}
      </div>
    </div>
  )
}