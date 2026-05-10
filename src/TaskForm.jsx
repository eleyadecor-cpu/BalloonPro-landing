import React, { useState } from 'react'
import { C, inp, Lbl } from './shared.jsx'
import { supabase } from './supabaseClient'

const PRIORITIES = [
  { value: 'low',    label: 'Ниска',   color: '#81BFB7' },
  { value: 'normal', label: 'Нормална', color: '#F3A2BE' },
  { value: 'high',   label: 'Висока',  color: '#c0892b' },
  { value: 'urgent', label: 'Спешна',  color: '#c0392b' },
]

export default function TaskForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '', description: '', due_date: '', due_time: '',
    priority: 'normal', related_client: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Въведи заглавие на задачата'); return }
    setSaving(true); setError('')
    const dateToISO = (d) => {
      if (!d) return null
      if (d.includes('-')) return d
      const p = d.split('.')
      if (p.length === 3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
      return null
    }
    const { error: dbErr } = await supabase.from('tasks').insert([{
      ...form,
      due_date: dateToISO(form.due_date),
    }])
    setSaving(false)
    if (dbErr) { setError('Грешка: ' + dbErr.message); return }
    onSaved && onSaved()
    onClose()
  }

  const S = { background: '#fff', border: `1px solid #C6E6E3`, padding: '20px', marginBottom: 2, borderRadius: 12 }

  return (
    <div>
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#81BFB7', marginBottom:14, letterSpacing:1 }}>📋 Детайли на задачата</div>
        <div style={{ marginBottom:12 }}>
          <Lbl>Заглавие *</Lbl>
          <input style={inp} placeholder="напр. Обади се на клиента, Поръчай балони..." value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div style={{ marginBottom:12 }}>
          <Lbl>Описание</Lbl>
          <textarea style={{ ...inp, height:70, resize:'vertical' }} placeholder="Допълнителни детайли..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <Lbl>Дата</Lbl>
            <input style={inp} placeholder="дд.мм.гггг" maxLength={10} value={form.due_date} onChange={e => {
              let v = e.target.value.replace(/[^0-9.]/g,'')
              if (v.length===2 && !v.includes('.')) v += '.'
              if (v.length===5 && v.split('.').length===2) v += '.'
              set('due_date', v)
            }} />
          </div>
          <div>
            <Lbl>Час</Lbl>
            <input style={inp} placeholder="чч:мм" maxLength={5} value={form.due_time} onChange={e => {
              let v = e.target.value.replace(/[^0-9:]/g,'')
              if (v.length===2 && !v.includes(':')) v += ':'
              set('due_time', v)
            }} />
          </div>
        </div>
        <div style={{ marginBottom:12 }}>
          <Lbl>Свързан клиент</Lbl>
          <input style={inp} placeholder="напр. Мария Иванова" value={form.related_client} onChange={e => set('related_client', e.target.value)} />
        </div>
      </div>

      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#81BFB7', marginBottom:14, letterSpacing:1 }}>⚡ Приоритет</div>
        <div style={{ display:'flex', gap:8 }}>
          {PRIORITIES.map(p => (
            <button key={p.value} onClick={() => set('priority', p.value)} style={{
              flex:1, padding:'10px 6px', borderRadius:12, border:'none', cursor:'pointer',
              background: form.priority === p.value ? p.color : '#f0f0f0',
              color: form.priority === p.value ? '#fff' : '#888',
              fontWeight:700, fontSize:12
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ color:'#c0392b', fontSize:12, padding:'8px 12px', background:'#FFD3DD', marginBottom:8, borderRadius:8 }}>{error}</div>}

      <div style={{ display:'flex', gap:10, marginTop:4 }}>
        <button onClick={onClose} style={{ flex:1, padding:13, background:'#fff', border:'1px solid #C6E6E3', color:'#81BFB7', fontWeight:700, cursor:'pointer', borderRadius:12, fontSize:13 }}>
          Отказ
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{ flex:2, padding:13, background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', color:'#fff', border:'none', fontWeight:800, cursor:'pointer', borderRadius:12, fontSize:13 }}>
          {saving ? '⏳ Записва...' : '✅ Запази задачата'}
        </button>
      </div>
    </div>
  )
}