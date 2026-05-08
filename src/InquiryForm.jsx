import React, { useState } from 'react'
import { C, inp, pill, Lbl } from './shared.jsx'
import { supabase } from './supabaseClient'

const EVENT_TYPES = ['Рожден ден', 'Сватба', 'Кръщене', 'Абитуриентски бал', 'Корпоративно събитие', 'Детско парти', 'Годишнина', 'Друго']

export default function InquiryForm({ onClose }) {
  const [form, setForm] = useState({
    client_name: '', client_phone: '', client_email: '',
    event_type: '', event_theme: '', event_date: '',
    event_start: '', location: '', guest_count: '',
    budget: '', notes: '', inspiration_url: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.client_name.trim()) { setError('Въведи името на клиента'); return }
    if (!form.event_date) { setError('Въведи дата на събитието'); return }
    setSaving(true); setError('')

    let inspiration_url = ''
    if (imgFile) {
      const ext = imgFile.name.split('.').pop()
      const path = `inspirations/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('inquiries').upload(path, imgFile)
      if (!upErr) {
        const { data } = supabase.storage.from('inquiries').getPublicUrl(path)
        inspiration_url = data.publicUrl
      }
    }

    const { error: dbErr } = await supabase.from('inquiries').insert([{
      ...form,
      guest_count: form.guest_count ? parseInt(form.guest_count) : null,
      budget: form.budget ? parseFloat(form.budget) : null,
      inspiration_url,
    }])

    setSaving(false)
    if (dbErr) { setError('Грешка при запис: ' + dbErr.message); return }
    setSaved(true)
    setTimeout(() => onClose(), 2000)
  }

  const S = { background: '#fff', border: `1px solid ${C.l100}`, padding: '20px', marginBottom: 2 }

  if (saved) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.l600 }}>Запитването е записано!</div>
    </div>
  )

  return (
    <div>
      {/* КЛИЕНТ */}
      <div style={S}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.l600, marginBottom: 14 }}>👤 Данни на клиента</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div><Lbl>Име *</Lbl><input style={inp} placeholder="Мария Иванова" value={form.client_name} onChange={e => set('client_name', e.target.value)} /></div>
          <div><Lbl>Телефон</Lbl><input style={inp} placeholder="0888 123 456" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} /></div>
          <div><Lbl>Имейл</Lbl><input style={inp} placeholder="maria@email.com" value={form.client_email} onChange={e => set('client_email', e.target.value)} /></div>
        </div>
      </div>

      {/* СЪБИТИЕ */}
      <div style={S}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.l600, marginBottom: 14 }}>🎉 Детайли на събитието</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <Lbl>Тип събитие</Lbl>
            <select style={{ ...inp }} value={form.event_type} onChange={e => set('event_type', e.target.value)}>
              <option value="">-- Избери --</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><Lbl>Тема на украсата</Lbl><input style={inp} placeholder="напр. Принцеси, Морска, Минималистична..." value={form.event_theme} onChange={e => set('event_theme', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div><Lbl>Дата *</Lbl><input style={inp} placeholder="дд.мм.гггг" maxLength={10} value={form.event_date} onChange={e => {
  let v = e.target.value.replace(/[^0-9.]/g,'')
  if (v.length === 2 && !v.includes('.')) v += '.'
  if (v.length === 5 && v.split('.').length === 2) v += '.'
  set('event_date', v)
}} /></div>
          <div><Lbl>Начален час</Lbl><input style={inp} placeholder="чч:мм" maxLength={5} value={form.event_start} onChange={e => {
  let v = e.target.value.replace(/[^0-9:]/g,'')
  if (v.length === 2 && !v.includes(':')) v += ':'
  set('event_start', v)
}} /></div>
          <div><Lbl>Брой гости</Lbl><input style={inp} type="number" placeholder="50" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} /></div>
          <div><Lbl>Бюджет (€)</Lbl><input style={inp} type="number" placeholder="500" value={form.budget} onChange={e => set('budget', e.target.value)} /></div>
        </div>
        <div><Lbl>Локация</Lbl><input style={inp} placeholder="Зала, адрес, град..." value={form.location} onChange={e => set('location', e.target.value)} /></div>
      </div>

      {/* БЕЛЕЖКИ */}
      <div style={S}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.l600, marginBottom: 14 }}>📝 Бележки и вдъхновение</div>
        <div style={{ marginBottom: 12 }}>
          <Lbl>Бележки</Lbl>
          <textarea style={{ ...inp, height: 80, resize: 'vertical' }} placeholder="Допълнителни желания, изисквания..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <Lbl>📸 Снимка за вдъхновение</Lbl>
        <input type="file" accept="image/*" onChange={handleImage} style={{ marginBottom: 8, fontSize: 12 }} />
        {imgPreview && (
          <div style={{ marginTop: 8 }}>
            <img src={imgPreview} alt="preview" style={{ maxWidth: 200, maxHeight: 150, border: `1px solid ${C.l100}`, borderRadius: 8 }} />
          </div>
        )}
      </div>

      {error && <div style={{ color: '#c0392b', fontSize: 12, padding: '8px 12px', background: '#fde8e6', marginBottom: 8 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 14, background: '#fff', border: `1px solid ${C.l100}`, color: C.gray, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          Отказ
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: 14, background: C.l600, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          {saving ? '⏳ Записва...' : '💾 Запази запитването'}
        </button>
      </div>
    </div>
  )
}