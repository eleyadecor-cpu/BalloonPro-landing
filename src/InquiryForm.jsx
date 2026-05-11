import React, { useState, useEffect } from 'react'
import { C, inp, Lbl } from './shared.jsx'
import { supabase } from './supabaseClient'

const EVENT_TYPES = ['Рожден ден', 'Сватба', 'Кръщене', 'Абитуриентски бал', 'Корпоративно събитие', 'Детско парти', 'Годишнина', 'Друго']

export default function InquiryForm({ onClose, onSaved, editInquiry }) {
  const [form, setForm] = useState({
    client_name: '', client_phone: '', client_email: '',
    event_type: '', event_theme: '', event_date: '',
    event_start: '', location: '', guest_count: '',
    budget: '', notes: '',
    inspiration_url: '', inspiration_url_2: '', inspiration_url_3: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [imgFiles, setImgFiles] = useState([null, null, null])
  const [imgPreviews, setImgPreviews] = useState([null, null, null])

  useEffect(() => {
    if (editInquiry) {
      setForm({
        client_name: editInquiry.client_name || '',
        client_phone: editInquiry.client_phone || '',
        client_email: editInquiry.client_email || '',
        event_type: editInquiry.event_type || '',
        event_theme: editInquiry.event_theme || '',
        event_date: editInquiry.event_date ? formatDate(editInquiry.event_date) : '',
        event_start: editInquiry.event_start || '',
        location: editInquiry.location || '',
        guest_count: editInquiry.guest_count || '',
        budget: editInquiry.budget || '',
        notes: editInquiry.notes || '',
        inspiration_url: editInquiry.inspiration_url || '',
        inspiration_url_2: editInquiry.inspiration_url_2 || '',
        inspiration_url_3: editInquiry.inspiration_url_3 || '',
      })
      setImgPreviews([
        editInquiry.inspiration_url || null,
        editInquiry.inspiration_url_2 || null,
        editInquiry.inspiration_url_3 || null,
      ])
    }
  }, [editInquiry])

  const formatDate = (iso) => {
    if (!iso) return ''
    const p = iso.split('-')
    return `${p[2]}.${p[1]}.${p[0]}`
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleImage = (e, index) => {
    const file = e.target.files[0]
    if (!file) return
    const newFiles = [...imgFiles]
    newFiles[index] = file
    setImgFiles(newFiles)
    const newPreviews = [...imgPreviews]
    newPreviews[index] = URL.createObjectURL(file)
    setImgPreviews(newPreviews)
  }

  const uploadImage = async (file, path) => {
    const ext = file.name.split('.').pop()
    const fullPath = `${path}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('inquiries').upload(fullPath, file)
    if (error) return null
    const { data } = supabase.storage.from('inquiries').getPublicUrl(fullPath)
    return data.publicUrl
  }

  const dateToISO = (d) => {
    if (!d) return null
    if (d.includes('-')) return d
    const p = d.split('.')
    if (p.length === 3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
    return null
  }

  const handleSubmit = async () => {
    if (!form.client_name.trim()) { setError('Въведи името на клиента'); return }
    if (!form.event_date) { setError('Въведи дата на събитието'); return }
    setSaving(true); setError('')

    const urlKeys = ['inspiration_url', 'inspiration_url_2', 'inspiration_url_3']
    const urls = [form.inspiration_url, form.inspiration_url_2, form.inspiration_url_3]

    for (let i = 0; i < 3; i++) {
      if (imgFiles[i]) {
        const url = await uploadImage(imgFiles[i], `inspirations`)
        if (url) urls[i] = url
      }
    }

    const payload = {
      ...form,
      event_date: dateToISO(form.event_date),
      guest_count: form.guest_count ? parseInt(form.guest_count) : null,
      budget: form.budget ? parseFloat(form.budget) : null,
      inspiration_url: urls[0] || null,
      inspiration_url_2: urls[1] || null,
      inspiration_url_3: urls[2] || null,
    }

    const { error: dbErr } = editInquiry
      ? await supabase.from('inquiries').update(payload).eq('id', editInquiry.id)
      : await supabase.from('inquiries').insert([payload])

    setSaving(false)
    if (dbErr) { setError('Грешка при запис: ' + dbErr.message); return }

    if (!editInquiry) {
      setSaved(true)
      setTimeout(() => onClose(), 2000)
    } else {
      onSaved && onSaved()
      onClose()
    }
  }

  const S = { background: '#fff', border: `1px solid #C6E6E3`, padding: '20px', marginBottom: 2, borderRadius: 12 }

  if (saved) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#F3A2BE' }}>Запитването е записано!</div>
    </div>
  )

  return (
    <div>
      {/* КЛИЕНТ */}
      <div style={S}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#81BFB7', marginBottom: 14, letterSpacing: 1 }}>👤 Данни на клиента</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div><Lbl>Име *</Lbl><input style={inp} placeholder="Мария Иванова" value={form.client_name} onChange={e => set('client_name', e.target.value)} /></div>
          <div><Lbl>Телефон</Lbl><input style={inp} placeholder="0888 123 456" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} /></div>
          <div><Lbl>Имейл</Lbl><input style={inp} placeholder="maria@email.com" value={form.client_email} onChange={e => set('client_email', e.target.value)} /></div>
        </div>
      </div>

      {/* СЪБИТИЕ */}
      <div style={S}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#81BFB7', marginBottom: 14, letterSpacing: 1 }}>🎉 Детайли на събитието</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <Lbl>Тип събитие</Lbl>
            <select style={{ ...inp }} value={form.event_type} onChange={e => set('event_type', e.target.value)}>
              <option value="">-- Избери --</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><Lbl>Тема на украсата</Lbl><input style={inp} placeholder="напр. Принцеси, Морска..." value={form.event_theme} onChange={e => set('event_theme', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div><Lbl>Дата *</Lbl><input style={inp} placeholder="дд.мм.гггг" maxLength={10} value={form.event_date} onChange={e => {
            let v = e.target.value.replace(/[^0-9.]/g,'')
            if (v.length===2 && !v.includes('.')) v+='.'
            if (v.length===5 && v.split('.').length===2) v+='.'
            set('event_date', v)
          }} /></div>
          <div><Lbl>Начален час</Lbl><input style={inp} placeholder="чч:мм" maxLength={5} value={form.event_start} onChange={e => {
            let v = e.target.value.replace(/[^0-9:]/g,'')
            if (v.length===2 && !v.includes(':')) v+=':'
            set('event_start', v)
          }} /></div>
          <div><Lbl>Брой гости</Lbl><input style={inp} type="number" placeholder="50" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} /></div>
          <div><Lbl>Бюджет (€)</Lbl><input style={inp} type="number" placeholder="500" value={form.budget} onChange={e => set('budget', e.target.value)} /></div>
        </div>
        <div><Lbl>Локация</Lbl><input style={inp} placeholder="Зала, адрес, град..." value={form.location} onChange={e => set('location', e.target.value)} /></div>
      </div>

      {/* БЕЛЕЖКИ */}
      <div style={S}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#81BFB7', marginBottom: 14, letterSpacing: 1 }}>📝 Бележки и вдъхновение</div>
        <div style={{ marginBottom: 12 }}>
          <Lbl>Бележки</Lbl>
          <textarea style={{ ...inp, height: 80, resize: 'vertical' }} placeholder="Допълнителни желания, изисквания..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <Lbl>📸 Снимки за вдъхновение (до 3)</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: '#F0F9F8', borderRadius: 10, padding: 10, border: '1px solid #C6E6E3' }}>
              <div style={{ fontSize: 11, color: '#81BFB7', fontWeight: 700, marginBottom: 6 }}>Снимка {i + 1}</div>
              <input type="file" accept="image/*" onChange={e => handleImage(e, i)} style={{ fontSize: 11, marginBottom: 6, width: '100%' }} />
              {imgPreviews[i] && (
                <img src={imgPreviews[i]} alt={`preview ${i+1}`} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #C6E6E3' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ color: '#c0392b', fontSize: 12, padding: '8px 12px', background: '#FFD3DD', marginBottom: 8, borderRadius: 8 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 14, background: '#fff', border: '1px solid #C6E6E3', color: '#81BFB7', fontWeight: 600, cursor: 'pointer', borderRadius: 12, fontSize: 13 }}>
          Отказ
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: 14, background: 'linear-gradient(135deg,#FFD3DD,#F3A2BE)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', borderRadius: 12, fontSize: 13 }}>
          {saving ? '⏳ Записва...' : editInquiry ? '💾 Обнови запитването' : '💾 Запази запитването'}
        </button>
      </div>
    </div>
  )
}