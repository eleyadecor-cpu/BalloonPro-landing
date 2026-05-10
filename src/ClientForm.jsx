import React, { useState, useEffect } from 'react'
import { inp, Lbl } from './shared.jsx'
import { supabase } from './supabaseClient'

const SOURCES = ['Facebook', 'Instagram', 'Google', 'Препоръка', 'Повторен клиент', 'Друго']
const CONTACTS = ['Телефон', 'Viber', 'WhatsApp', 'Имейл', 'Facebook', 'Instagram']
const STATUSES = [
  { value: 'regular',    label: '👤 Редовен',  bg: '#F0F9F8', color: '#81BFB7' },
  { value: 'vip',        label: '⭐ VIP',       bg: '#FFD3DD', color: '#F3A2BE' },
  { value: 'ambassador', label: '🌸 Посланик',  bg: '#C6E6E3', color: '#2a5450' },
]

export default function ClientForm({ onClose, onSaved, editClient }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', birthday: '',
    preferred_contact: 'Телефон', rating: 5,
    status: 'regular', source: '', referred_by: '',
    preferred_theme: '', notes: '', family_members: []
  })
  const [clients, setClients] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editClient) setForm({ ...editClient, family_members: editClient.family_members || [] })
    loadClients()
  }, [editClient])

  const loadClients = async () => {
    const { data } = await supabase.from('clients').select('id, name').order('name')
    setClients(data || [])
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addFamilyMember = () => set('family_members', [...form.family_members, { name: '', birthday: '', phone: '' }])

  const updateMember = (i, field, value) => {
    const updated = form.family_members.map((m, idx) => idx === i ? { ...m, [field]: value } : m)
    set('family_members', updated)
  }

  const removeMember = (i) => set('family_members', form.family_members.filter((_, idx) => idx !== i))

  const dateToISO = (d) => {
    if (!d || d.includes('-')) return d || null
    const p = d.split('.')
    if (p.length === 3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
    return null
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Въведи името на клиента'); return }
    setSaving(true); setError('')
    const payload = {
      ...form,
      birthday: dateToISO(form.birthday),
      family_members: form.family_members.map(m => ({ ...m, birthday: dateToISO(m.birthday) })),
      referred_by: form.referred_by || null,
      rating: parseInt(form.rating),
    }
    const { error: dbErr } = editClient
      ? await supabase.from('clients').update(payload).eq('id', editClient.id)
      : await supabase.from('clients').insert([payload])
    setSaving(false)
    if (dbErr) { setError('Грешка: ' + dbErr.message); return }
    onSaved && onSaved()
    onClose()
  }

  const S = { background: '#fff', border: '1px solid #C6E6E3', padding: '20px', marginBottom: 12, borderRadius: 16 }

  const DateField = ({ value, onChange, placeholder = 'дд.мм.гггг' }) => (
    <input style={inp} placeholder={placeholder} maxLength={10} value={value} onChange={e => {
      let v = e.target.value.replace(/[^0-9.]/g, '')
      if (v.length === 2 && !v.includes('.')) v += '.'
      if (v.length === 5 && v.split('.').length === 2) v += '.'
      onChange(v)
    }} />
  )

  return (
    <div>
      {/* ОСНОВНИ ДАННИ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>🌸 Основни данни</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div><Lbl>Име *</Lbl><input style={inp} placeholder="Мария Иванова" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div><Lbl>Телефон</Lbl><input style={inp} placeholder="+359 88..." value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div><Lbl>Имейл</Lbl><input style={inp} placeholder="email@gmail.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><Lbl>Рожден ден</Lbl><DateField value={form.birthday} onChange={v => set('birthday', v)} /></div>
          <div>
            <Lbl>Предпочита контакт</Lbl>
            <select style={inp} value={form.preferred_contact} onChange={e => set('preferred_contact', e.target.value)}>
              {CONTACTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Рейтинг</Lbl>
            <div style={{ display:'flex', gap:6, paddingTop:8 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} onClick={() => set('rating', n)} style={{ fontSize:24, cursor:'pointer', opacity: n <= form.rating ? 1 : 0.3 }}>⭐</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* СТАТУТ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>⭐ Статут</div>
        <div style={{ display:'flex', gap:8 }}>
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => set('status', s.value)} style={{
              flex:1, padding:'12px 8px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
              background: form.status === s.value ? s.bg : '#f5f5f5',
              color: form.status === s.value ? s.color : '#aaa',
              outline: form.status === s.value ? `2px solid ${s.color}` : 'none',
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* КАК НИ НАМЕРИ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>🔍 Как ни намери</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <Lbl>Намерил ни чрез</Lbl>
            <select style={inp} value={form.source} onChange={e => set('source', e.target.value)}>
              <option value="">-- Избери --</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Препоръчан от</Lbl>
            <select style={inp} value={form.referred_by} onChange={e => set('referred_by', e.target.value)}>
              <option value="">-- Избери клиент --</option>
              {clients.filter(c => c.id !== editClient?.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ПРЕДПОЧИТАНА ТЕМА */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>🎨 Предпочитана тема</div>
        <input style={inp} placeholder="напр. Принцеси, Пастелно, Морска..." value={form.preferred_theme} onChange={e => set('preferred_theme', e.target.value)} />
      </div>

      {/* СЕМЕЙНА ИНФОРМАЦИЯ */}
      <div style={S}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1 }}>👨‍👩‍👧 Семейна информация</div>
          <button onClick={addFamilyMember} style={{ padding:'6px 12px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>+ Добави член</button>
        </div>
        {form.family_members.length === 0 && (
          <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16, background:'#F0F9F8', borderRadius:10 }}>
            Натисни "+ Добави член" за да добавиш семейна информация
          </div>
        )}
        {form.family_members.map((m, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:8, marginBottom:8, padding:12, background:'#F0F9F8', borderRadius:10 }}>
            <div><Lbl>Име</Lbl><input style={inp} placeholder="напр. Иван" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} /></div>
            <div><Lbl>Рожден ден</Lbl><DateField value={m.birthday || ''} onChange={v => updateMember(i, 'birthday', v)} /></div>
            <div><Lbl>Телефон</Lbl><input style={inp} placeholder="+359..." value={m.phone || ''} onChange={e => updateMember(i, 'phone', e.target.value)} /></div>
            <button onClick={() => removeMember(i)} style={{ marginTop:20, background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:20 }}>×</button>
          </div>
        ))}
      </div>

      {/* БЕЛЕЖКИ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>📝 Бележки</div>
        <textarea style={{ ...inp, height:80, resize:'vertical' }} placeholder="Предпочитания, специфики, важни детайли..." value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      {error && <div style={{ color:'#c0392b', fontSize:12, padding:'8px 12px', background:'#FFD3DD', marginBottom:8, borderRadius:8 }}>{error}</div>}

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:14, background:'#fff', border:'1px solid #C6E6E3', color:'#81BFB7', fontWeight:700, cursor:'pointer', borderRadius:12, fontSize:13 }}>
          Отказ
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{ flex:2, padding:14, background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', color:'#fff', border:'none', fontWeight:800, cursor:'pointer', borderRadius:12, fontSize:13 }}>
          {saving ? '⏳ Записва...' : editClient ? '💾 Обнови клиента' : '🌸 Запази клиента'}
        </button>
      </div>
    </div>
  )
}