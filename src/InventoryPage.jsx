import React, { useState, useEffect } from 'react'
import { inp, Lbl } from './shared.jsx'
import { supabase } from './supabaseClient'

const CATEGORIES = {
  balloons:     { label: '🎈 Балони',      color: '#F3A2BE' },
  foil:         { label: '✨ Фолио',        color: '#81BFB7' },
  confetti:     { label: '🎊 Конфети',      color: '#F3A2BE' },
  ribbons:      { label: '🎀 Ленти',        color: '#81BFB7' },
  stands:       { label: '🪄 Стойки',       color: '#F3A2BE' },
  consumables:  { label: '📦 Консумативи',  color: '#81BFB7' },
  other:        { label: '📋 Друго',        color: '#aaa' },
}

const UNITS = ['бр', 'м', 'кг', 'пакет', 'ролка', 'кутия']

const card = { background: 'rgba(255,255,255,0.85)', borderRadius: 20, border: '1px solid rgba(243,162,190,0.2)', padding: 20 }
const inp2 = { ...{ width:'100%', padding:'10px 13px', border:'1px solid #C6E6E3', borderRadius:8, fontSize:14, color:'#3a2a35', background:'#F0F9F8', outline:'none', boxSizing:'border-box' } }

function ItemForm({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', category: 'balloons', quantity: 0, unit: 'бр',
    cost_per_unit: 0, min_quantity: 0, supplier: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => { if (item) setForm(item) }, [item])

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Въведи името на артикула'); return }
    setSaving(true); setError('')
    const { error: dbErr } = item
      ? await supabase.from('inventory').update(form).eq('id', item.id)
      : await supabase.from('inventory').insert([form])
    setSaving(false)
    if (dbErr) { setError('Грешка: ' + dbErr.message); return }
    onSaved()
    onClose()
  }

  const S = { background: '#fff', border: '1px solid #C6E6E3', padding: '20px', marginBottom: 12, borderRadius: 16 }

  return (
    <div>
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>📦 Детайли на артикула</div>
        <div style={{ marginBottom:12 }}>
          <Lbl>Име *</Lbl>
          <input style={inp2} placeholder="напр. Балони 12' пастел розово" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <Lbl>Категория</Lbl>
            <select style={inp2} value={form.category} onChange={e => set('category', e.target.value)}>
              {Object.entries(CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Мерна единица</Lbl>
            <select style={inp2} value={form.unit} onChange={e => set('unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Количество</Lbl>
            <input style={inp2} type="number" min={0} step="0.5" value={form.quantity} onChange={e => set('quantity', +e.target.value)} />
          </div>
          <div>
            <Lbl>Минимално количество</Lbl>
            <input style={inp2} type="number" min={0} step="0.5" value={form.min_quantity} onChange={e => set('min_quantity', +e.target.value)} />
            <div style={{ fontSize:10, color:'#81BFB7', marginTop:4 }}>Известяване при ниска наличност</div>
          </div>
          <div>
            <Lbl>Себестойност (€/единица)</Lbl>
            <input style={inp2} type="number" min={0} step="0.01" value={form.cost_per_unit} onChange={e => set('cost_per_unit', +e.target.value)} />
          </div>
          <div>
            <Lbl>Доставчик</Lbl>
            <input style={inp2} placeholder="напр. Gemar, Kalisan..." value={form.supplier} onChange={e => set('supplier', e.target.value)} />
          </div>
        </div>
        <div>
          <Lbl>Бележки</Lbl>
          <textarea style={{ ...inp2, height:70, resize:'vertical' }} placeholder="Допълнителна информация..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      {error && <div style={{ color:'#c0392b', fontSize:12, padding:'8px 12px', background:'#FFD3DD', marginBottom:8, borderRadius:8 }}>{error}</div>}

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:13, background:'#fff', border:'1px solid #C6E6E3', color:'#81BFB7', fontWeight:700, cursor:'pointer', borderRadius:12, fontSize:13 }}>Отказ</button>
        <button onClick={handleSubmit} disabled={saving} style={{ flex:2, padding:13, background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', color:'#fff', border:'none', fontWeight:800, cursor:'pointer', borderRadius:12, fontSize:13 }}>
          {saving ? '⏳ Записва...' : item ? '💾 Обнови' : '📦 Добави артикул'}
        </button>
      </div>
    </div>
  )
}

function MovementForm({ item, onClose, onSaved }) {
  const [qty, setQty] = useState(0)
  const [type, setType] = useState('add')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!qty) return
    setSaving(true)
    const change = type === 'remove' ? -Math.abs(qty) : Math.abs(qty)
    await supabase.from('inventory_movements').insert([{
      inventory_id: item.id, quantity_change: change, type, reason
    }])
    await supabase.from('inventory').update({ quantity: item.quantity + change }).eq('id', item.id)
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div style={{ padding:'0 0 8px' }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#3a2a35', marginBottom:16 }}>{item.name}</div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {[['add','➕ Добави'],['remove','➖ Извади'],['adjustment','🔄 Корекция']].map(([v,l]) => (
          <button key={v} onClick={() => setType(v)} style={{ flex:1, padding:'10px 6px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:12, background: type===v ? '#F3A2BE' : '#f0f0f0', color: type===v ? '#fff' : '#888' }}>{l}</button>
        ))}
      </div>
      <div style={{ marginBottom:12 }}>
        <Lbl>Количество ({item.unit})</Lbl>
        <input style={inp2} type="number" min={0} step="0.5" value={qty} onChange={e => setQty(+e.target.value)} />
      </div>
      <div style={{ marginBottom:16 }}>
        <Lbl>Причина</Lbl>
        <input style={inp2} placeholder="напр. Покупка от Gemar, Използвано за събитие..." value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:13, background:'#fff', border:'1px solid #C6E6E3', color:'#81BFB7', fontWeight:700, cursor:'pointer', borderRadius:12 }}>Отказ</button>
        <button onClick={handleSubmit} disabled={saving||!qty} style={{ flex:2, padding:13, background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', color:'#fff', border:'none', fontWeight:800, cursor:'pointer', borderRadius:12 }}>
          {saving ? '⏳...' : 'Запази'}
        </button>
      </div>
    </div>
  )
}

export default function InventoryPage({ onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selected, setSelected] = useState(null)
  const [movements, setMovements] = useState([])
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [moveItem, setMoveItem] = useState(null)

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('inventory').select('*').order('name')
    setItems(data || [])
    setLoading(false)
  }

  const loadMovements = async (id) => {
    const { data } = await supabase.from('inventory_movements').select('*').eq('inventory_id', id).order('created_at', { ascending: false }).limit(10)
    setMovements(data || [])
  }

  const deleteItem = async (id) => {
    if (!window.confirm('Изтрий този артикул?')) return
    await supabase.from('inventory').delete().eq('id', id)
    setItems(p => p.filter(i => i.id !== id))
    setSelected(null)
  }

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.supplier||'').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || i.category === filter || (filter === 'low' && i.quantity <= i.min_quantity)
    return matchSearch && matchFilter
  })

  const lowStock = items.filter(i => i.quantity <= i.min_quantity && i.min_quantity > 0).length

  const Popup = ({ title, children, maxW='600px' }) => (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:maxW, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
          <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0, fontSize:18 }}>{title}</h2>
          <button onClick={() => { setIsFormOpen(false); setIsMoveOpen(false); setEditItem(null); setMoveItem(null) }} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        <div style={{ padding:'20px 32px 32px' }}>{children}</div>
      </div>
    </div>
  )

  if (selected) return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => setSelected(null)} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Назад</button>
        <h2 style={{ color:'#3a2a35', margin:0, fontSize:22, fontWeight:900 }}>{selected.name}</h2>
        <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background: CATEGORIES[selected.category]?.color+'22', color: CATEGORIES[selected.category]?.color, fontWeight:700 }}>
          {CATEGORIES[selected.category]?.label}
        </span>
        {selected.quantity <= selected.min_quantity && selected.min_quantity > 0 && (
          <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:'#FFD3DD', color:'#c0392b', fontWeight:700 }}>⚠️ Ниска наличност</span>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>📦 Информация</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:13 }}>
            {[
              ['Наличност', `${selected.quantity} ${selected.unit}`],
              ['Минимум', `${selected.min_quantity} ${selected.unit}`],
              ['Себестойност', `€${selected.cost_per_unit}/${selected.unit}`],
              ['Обща стойност', `€${(selected.quantity * selected.cost_per_unit).toFixed(2)}`],
              ['Доставчик', selected.supplier],
            ].map(([l,v]) => v ? (
              <div key={l} style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'#81BFB7' }}>{l}</span>
                <span style={{ fontWeight:700, color:'#3a2a35' }}>{v}</span>
              </div>
            ) : null)}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>📊 История на движенията</div>
          {movements.length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16 }}>Няма движения</div>}
          {movements.map(m => (
            <div key={m.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(198,230,227,0.3)', fontSize:12 }}>
              <div>
                <div style={{ fontWeight:700, color: m.quantity_change > 0 ? '#81BFB7' : '#F3A2BE' }}>
                  {m.quantity_change > 0 ? '+' : ''}{m.quantity_change} {selected.unit}
                </div>
                <div style={{ fontSize:10, color:'#81BFB7' }}>{m.reason || '—'}</div>
              </div>
              <div style={{ fontSize:10, color:'#aaa' }}>{new Date(m.created_at).toLocaleDateString('bg-BG')}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => { setMoveItem(selected); setIsMoveOpen(true) }} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}>
          📦 Движение на количество
        </button>
        <button onClick={() => { setEditItem(selected); setIsFormOpen(true) }} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}>
          ✏️ Редактирай
        </button>
        <button onClick={() => deleteItem(selected.id)} style={{ padding:'12px 24px', background:'#FFD3DD', border:'none', borderRadius:12, color:'#c0392b', fontWeight:700, cursor:'pointer', fontSize:13 }}>
          🗑️ Изтрий
        </button>
      </div>

      {isFormOpen && <Popup title="✏️ Редактирай артикул"><ItemForm item={editItem} onClose={() => { setIsFormOpen(false); setEditItem(null) }} onSaved={() => { loadItems(); setSelected(null) }} /></Popup>}
      {isMoveOpen && <Popup title="📦 Движение на количество"><MovementForm item={selected} onClose={() => setIsMoveOpen(false)} onSaved={() => { loadItems(); loadMovements(selected.id); setSelected(p => ({ ...p, quantity: p.quantity })) }} /></Popup>}
    </div>
  )

  return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Табло</button>
          <h1 style={{ color:'#3a2a35', margin:0, fontSize:24, fontWeight:900 }}>📦 Инвентар</h1>
          <span style={{ fontSize:12, color:'#81BFB7' }}>{items.length} артикула</span>
          {lowStock > 0 && <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:'#FFD3DD', color:'#c0392b', fontWeight:700 }}>⚠️ {lowStock} с ниска наличност</span>}
        </div>
        <button onClick={() => { setEditItem(null); setIsFormOpen(true) }} style={{ padding:'12px 20px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:13, cursor:'pointer' }}>
          + Нов артикул
        </button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input style={{ flex:1, padding:'10px 16px', borderRadius:12, border:'1px solid #C6E6E3', background:'rgba(255,255,255,0.8)', fontSize:13, color:'#3a2a35', outline:'none', minWidth:200 }}
          placeholder="🔍 Търси по име или доставчик..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setFilter('all')} style={{ padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background: filter==='all'?'#F3A2BE':'rgba(255,255,255,0.7)', color: filter==='all'?'#fff':'#81BFB7' }}>
          Всички ({items.length})
        </button>
        <button onClick={() => setFilter('low')} style={{ padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background: filter==='low'?'#c0392b':'rgba(255,255,255,0.7)', color: filter==='low'?'#fff':'#81BFB7' }}>
          ⚠️ Ниска наличност ({lowStock})
        </button>
        {Object.entries(CATEGORIES).map(([k,v]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background: filter===k?v.color:'rgba(255,255,255,0.7)', color: filter===k?'#fff':'#81BFB7' }}>
            {v.label} ({items.filter(i=>i.category===k).length})
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign:'center', padding:40, color:'#81BFB7' }}>Зарежда...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:'#81BFB7', background:'rgba(255,255,255,0.7)', borderRadius:20 }}>
          {search ? 'Няма намерени артикули' : 'Няма артикули — добави първия!'}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
        {filtered.map(item => {
          const isLow = item.quantity <= item.min_quantity && item.min_quantity > 0
          return (
            <div key={item.id} onClick={() => { setSelected(item); loadMovements(item.id) }} style={{ ...card, cursor:'pointer', borderLeft:`4px solid ${isLow?'#c0392b':CATEGORIES[item.category]?.color||'#C6E6E3'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ fontWeight:800, color:'#3a2a35', fontSize:15 }}>{item.name}</div>
                <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background: CATEGORIES[item.category]?.color+'22', color: CATEGORIES[item.category]?.color, fontWeight:700, flexShrink:0 }}>
                  {CATEGORIES[item.category]?.label}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:900, color: isLow?'#c0392b':'#3a2a35' }}>{item.quantity} <span style={{ fontSize:13, fontWeight:400, color:'#81BFB7' }}>{item.unit}</span></div>
                  {item.supplier && <div style={{ fontSize:11, color:'#81BFB7' }}>📦 {item.supplier}</div>}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#F3A2BE' }}>€{item.cost_per_unit}/{item.unit}</div>
                  <div style={{ fontSize:11, color:'#81BFB7' }}>€{(item.quantity*item.cost_per_unit).toFixed(2)} общо</div>
                </div>
              </div>
              {isLow && <div style={{ marginTop:8, fontSize:11, color:'#c0392b', fontWeight:700, background:'#FFD3DD', padding:'4px 8px', borderRadius:6 }}>⚠️ Ниска наличност!</div>}
            </div>
          )
        })}
      </div>

      {isFormOpen && <Popup title={editItem ? '✏️ Редактирай артикул' : '📦 Нов артикул'}><ItemForm item={editItem} onClose={() => { setIsFormOpen(false); setEditItem(null) }} onSaved={loadItems} /></Popup>}
    </div>
  )
}