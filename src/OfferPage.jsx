import React, { useState, useEffect } from 'react'
import { inp, Lbl } from './shared.jsx'
import { supabase } from './supabaseClient'

const STATUS = {
  draft:    { label: '📝 Чернова',  bg: '#F0F9F8', color: '#81BFB7' },
  sent:     { label: '📤 Изпратена', bg: '#FFD3DD', color: '#F3A2BE' },
  accepted: { label: '✅ Приета',    bg: '#C6E6E3', color: '#2a5450' },
  rejected: { label: '❌ Отказана',  bg: '#FFD3DD', color: '#c0392b' },
  expired:  { label: '⏰ Изтекла',   bg: '#f0f0f0', color: '#888' },
}

const inp2 = { width:'100%', padding:'10px 13px', border:'1px solid #C6E6E3', borderRadius:8, fontSize:14, color:'#3a2a35', background:'#F0F9F8', outline:'none', boxSizing:'border-box' }
const card = { background:'rgba(255,255,255,0.85)', borderRadius:20, border:'1px solid rgba(243,162,190,0.2)', padding:20 }

const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']

const formatDate = (iso) => {
  if (!iso) return '—'
  const p = iso.split('-')
  return `${p[2]}.${p[1]}.${p[0]}`
}

const dateToISO = (d) => {
  if (!d || d.includes('-')) return d || null
  const p = d.split('.')
  if (p.length === 3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
  return null
}

const DateInput = ({ value, onChange }) => (
  <input style={inp2} placeholder="дд.мм.гггг" maxLength={10} value={value} onChange={e => {
    let v = e.target.value.replace(/[^0-9.]/g,'')
    if (v.length===2 && !v.includes('.')) v+='.'
    if (v.length===5 && v.split('.').length===2) v+='.'
    onChange(v)
  }} />
)

function OfferForm({ offer, prefill, onClose, onSaved }) {
  const [form, setForm] = useState({
    client_id:'', inquiry_id:'', theme_id:'',
    event_date:'', event_time:'', event_type:'', location:'', guest_count:'',
    items:[], subtotal:0, discount:0, total:0,
    deposit:0, deposit_due_date:'', valid_until:'',
    delivery:false, delivery_price:0,
    installation:false, installation_price:0,
    dismantling:false, dismantling_price:0,
    status:'draft', notes:''
  })
  const [clients, setClients] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [themes, setThemes] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
    if (offer) {
      setForm({
        ...offer,
        event_date: offer.event_date ? formatDate(offer.event_date) : '',
        deposit_due_date: offer.deposit_due_date ? formatDate(offer.deposit_due_date) : '',
        valid_until: offer.valid_until ? formatDate(offer.valid_until) : '',
        items: offer.items || []
      })
    } else if (prefill) {
      setForm(p => ({
        ...p,
        client_id: prefill.client_id || '',
        inquiry_id: prefill.id || '',
        event_date: prefill.event_date ? formatDate(prefill.event_date) : '',
        event_time: prefill.event_start || '',
        event_type: prefill.event_type || '',
        location: prefill.location || '',
        guest_count: prefill.guest_count || '',
      }))
    }
  }, [offer, prefill])

  const loadData = async () => {
    const [c, i, t] = await Promise.all([
      supabase.from('clients').select('id,name').order('name'),
      supabase.from('inquiries').select('id,client_name,event_date,event_type').order('created_at', { ascending:false }),
      supabase.from('themes').select('id,name').order('name'),
    ])
    setClients(c.data || [])
    setInquiries(i.data || [])
    setThemes(t.data || [])
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addItem = () => set('items', [...form.items, { description:'', category:'Декорация', quantity:1, unit_price:0, total:0 }])

  const updateItem = (i, field, value) => {
    const updated = form.items.map((item, idx) => {
      if (idx !== i) return item
      const newItem = { ...item, [field]: value }
      const qty = field === 'quantity' ? +value : +newItem.quantity
      const price = field === 'unit_price' ? +value : +newItem.unit_price
      newItem.total = qty * price
      return newItem
    })
    setForm(p => {
      const services = (p.delivery?+p.delivery_price:0) + (p.installation?+p.installation_price:0) + (p.dismantling?+p.dismantling_price:0)
      const subtotal = updated.reduce((s,i) => s + (i.total||0), 0) + services
      const total = subtotal - (+p.discount||0)
      return { ...p, items: updated, subtotal, total }
    })
  }

  const removeItem = (i) => {
    const updated = form.items.filter((_,idx) => idx!==i)
    set('items', updated)
    recalculate(updated, form.discount, form.delivery, form.delivery_price, form.installation, form.installation_price, form.dismantling, form.dismantling_price)
  }

  const recalculate = (items, discount, delivery, deliveryPrice, installation, installationPrice, dismantling, dismantlingPrice) => {
    const itemsTotal = items.reduce((s,i) => s + (i.total||0), 0)
    const services = (delivery?+deliveryPrice:0) + (installation?+installationPrice:0) + (dismantling?+dismantlingPrice:0)
    const subtotal = itemsTotal + services
    const total = subtotal - (+discount||0)
    setForm(p => ({ ...p, subtotal, total }))
  }

  const handleServiceChange = (key, val) => {
    const next = { ...form, [key]: val }
    recalculate(next.items, next.discount, next.delivery, next.delivery_price, next.installation, next.installation_price, next.dismantling, next.dismantling_price)
    set(key, val)
  }

  const handleSubmit = async () => {
    if (!form.client_id) { setError('Избери клиент'); return }
    setSaving(true); setError('')
    const payload = {
      ...form,
      event_date: dateToISO(form.event_date),
      deposit_due_date: dateToISO(form.deposit_due_date),
      valid_until: dateToISO(form.valid_until),
      guest_count: form.guest_count ? +form.guest_count : null,
      discount: +form.discount,
      deposit: +form.deposit,
      inquiry_id: form.inquiry_id || null,
      theme_id: form.theme_id || null,
      client_id: form.client_id || null,
    }
    const { error: dbErr } = offer
      ? await supabase.from('offers').update(payload).eq('id', offer.id)
      : await supabase.from('offers').insert([payload])
    setSaving(false)
    if (dbErr) { setError('Грешка: ' + dbErr.message); return }
    onSaved()
    onClose()
  }

  const S = { background:'#fff', border:'1px solid #C6E6E3', padding:'20px', marginBottom:12, borderRadius:16 }

  return (
    <div>
      {/* КЛИЕНТ И ВРЪЗКИ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>👥 Клиент и връзки</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <div>
            <Lbl>Клиент *</Lbl>
            <select style={inp2} value={form.client_id} onChange={e => set('client_id', e.target.value)}>
              <option value="">-- Избери клиент --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Свързано запитване</Lbl>
            <select style={inp2} value={form.inquiry_id} onChange={e => set('inquiry_id', e.target.value)}>
              <option value="">-- Без запитване --</option>
              {inquiries.map(i => <option key={i.id} value={i.id}>{i.client_name} · {formatDate(i.event_date)}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Тема</Lbl>
            <select style={inp2} value={form.theme_id} onChange={e => set('theme_id', e.target.value)}>
              <option value="">-- Без тема --</option>
              {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* СЪБИТИЕ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>🎉 Детайли на събитието</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:12 }}>
          <div><Lbl>Дата</Lbl><DateInput value={form.event_date} onChange={v => set('event_date', v)} /></div>
          <div><Lbl>Час</Lbl><input style={inp2} placeholder="чч:мм" maxLength={5} value={form.event_time} onChange={e => {
            let v = e.target.value.replace(/[^0-9:]/g,'')
            if (v.length===2 && !v.includes(':')) v+=':'
            set('event_time', v)
          }} /></div>
          <div><Lbl>Тип събитие</Lbl><input style={inp2} placeholder="Рожден ден, Сватба..." value={form.event_type} onChange={e => set('event_type', e.target.value)} /></div>
          <div><Lbl>Брой гости</Lbl><input style={inp2} type="number" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} /></div>
        </div>
        <div><Lbl>Локация</Lbl><input style={inp2} placeholder="Зала, адрес, град..." value={form.location} onChange={e => set('location', e.target.value)} /></div>
      </div>

      {/* АРТИКУЛИ */}
      <div style={S}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1 }}>📦 Артикули и услуги</div>
          <button onClick={addItem} style={{ padding:'6px 14px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>+ Добави ред</button>
        </div>

        {form.items.length === 0 && (
          <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:20, background:'#F0F9F8', borderRadius:10 }}>Няма добавени артикули</div>
        )}

        {form.items.map((item, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 1fr 1fr auto', gap:8, marginBottom:8, padding:10, background:'#F0F9F8', borderRadius:10, alignItems:'flex-end' }}>
            <div>
              {i===0 && <Lbl>Описание</Lbl>}
              <input style={inp2} placeholder="напр. Органик гирлянд 3м..." value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
            </div>
            <div>
              {i===0 && <Lbl>Категория</Lbl>}
              <select style={inp2} value={item.category} onChange={e => updateItem(i, 'category', e.target.value)}>
                {['Декорация','Балони','Фолио','Услуга','Транспорт','Друго'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              {i===0 && <Lbl>Количество</Lbl>}
              <input style={inp2} type="number" min={0} step="0.5" value={item.quantity} onChange={e => updateItem(i, 'quantity', +e.target.value)} />
            </div>
            <div>
              {i===0 && <Lbl>Ед. цена (€)</Lbl>}
              <input style={inp2} type="number" min={0} step="0.5" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', +e.target.value)} />
            </div>
            <div>
              {i===0 && <Lbl>Общо (€)</Lbl>}
              <div style={{ padding:'10px 13px', background:'#FFD3DD', borderRadius:8, fontWeight:700, color:'#3a2a35', fontSize:14 }}>€{(item.total||0).toFixed(2)}</div>
            </div>
            <button onClick={() => removeItem(i)} style={{ background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:20, paddingBottom:4 }}>×</button>
          </div>
        ))}

        {/* УСЛУГИ */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:12, padding:12, background:'#F0F9F8', borderRadius:10 }}>
          {[
            ['delivery','🚚 Доставка','delivery_price'],
            ['installation','🔧 Монтаж','installation_price'],
            ['dismantling','📦 Демонтаж','dismantling_price'],
          ].map(([key, label, priceKey]) => (
            <div key={key} style={{ background:'#fff', borderRadius:10, padding:12, border:`1px solid ${form[key]?'#F3A2BE':'#C6E6E3'}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <input type="checkbox" checked={form[key]} onChange={e => handleServiceChange(key, e.target.checked)} style={{ width:16, height:16, accentColor:'#F3A2BE', cursor:'pointer' }} />
                <span style={{ fontWeight:700, fontSize:13, color: form[key]?'#F3A2BE':'#81BFB7' }}>{label}</span>
              </div>
              {form[key] && <input style={inp2} type="number" min={0} step="0.5" placeholder="Цена (€)" value={form[priceKey]} onChange={e => handleServiceChange(priceKey, +e.target.value)} />}
            </div>
          ))}
        </div>
      </div>

      {/* ФИНАНСИ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>💰 Финанси</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          <div><Lbl>Отстъпка (€)</Lbl><input style={inp2} type="number" min={0} step="0.5" value={form.discount} onChange={e => { set('discount', +e.target.value); recalculate(form.items, +e.target.value, form.delivery, form.delivery_price, form.installation, form.installation_price, form.dismantling, form.dismantling_price) }} /></div>
          <div><Lbl>Депозит (€)</Lbl><input style={inp2} type="number" min={0} step="0.5" value={form.deposit} onChange={e => set('deposit', +e.target.value)} /></div>
          <div><Lbl>Краен срок депозит</Lbl><DateInput value={form.deposit_due_date} onChange={v => set('deposit_due_date', v)} /></div>
          <div><Lbl>Валидна до</Lbl><DateInput value={form.valid_until} onChange={v => set('valid_until', v)} /></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0, border:'1px solid #C6E6E3', borderRadius:12, overflow:'hidden' }}>
          <div style={{ textAlign:'center', padding:16, background:'#F0F9F8' }}>
            <div style={{ fontSize:10, color:'#81BFB7', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Сума</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#3a2a35' }}>€{form.subtotal.toFixed(2)}</div>
          </div>
          <div style={{ textAlign:'center', padding:16, background:'#FFD3DD', borderLeft:'1px solid #C6E6E3', borderRight:'1px solid #C6E6E3' }}>
            <div style={{ fontSize:10, color:'#F3A2BE', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Отстъпка</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#F3A2BE' }}>-€{(+form.discount||0).toFixed(2)}</div>
          </div>
          <div style={{ textAlign:'center', padding:16, background:'#81BFB7' }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.8)', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Общо</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#fff' }}>€{form.total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* БЕЛЕЖКИ И СТАТУС */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>📝 Бележки и статус</div>
        <div style={{ marginBottom:12 }}>
          <Lbl>Статус</Lbl>
          <div style={{ display:'flex', gap:8 }}>
            {Object.entries(STATUS).map(([k,v]) => (
              <button key={k} onClick={() => set('status', k)} style={{ flex:1, padding:'10px 6px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background: form.status===k?v.bg:'#f0f0f0', color: form.status===k?v.color:'#aaa', outline: form.status===k?`2px solid ${v.color}`:'none' }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Бележки / Специални условия</Lbl>
          <textarea style={{ ...inp2, height:80, resize:'vertical' }} placeholder="Специални условия, забележки..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      {error && <div style={{ color:'#c0392b', fontSize:12, padding:'8px 12px', background:'#FFD3DD', marginBottom:8, borderRadius:8 }}>{error}</div>}

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:14, background:'#fff', border:'1px solid #C6E6E3', color:'#81BFB7', fontWeight:700, cursor:'pointer', borderRadius:12, fontSize:13 }}>Отказ</button>
        <button onClick={handleSubmit} disabled={saving} style={{ flex:2, padding:14, background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', color:'#fff', border:'none', fontWeight:800, cursor:'pointer', borderRadius:12, fontSize:13 }}>
          {saving ? '⏳ Записва...' : offer ? '💾 Обнови офертата' : '📄 Запази офертата'}
        </button>
      </div>
    </div>
  )
}

export default function OfferPage({ onBack, prefillInquiry }) {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(!!prefillInquiry)
  const [editOffer, setEditOffer] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadOffers() }, [])

  const loadOffers = async () => {
    setLoading(true)
    const { data } = await supabase.from('offers').select('*, clients(name)').order('created_at', { ascending:false })
    setOffers(data || [])
    setLoading(false)
  }

  const deleteOffer = async (id) => {
    if (!window.confirm('Изтрий тази оферта?')) return
    await supabase.from('offers').delete().eq('id', id)
    setOffers(p => p.filter(o => o.id !== id))
    setSelected(null)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('offers').update({ status }).eq('id', id)
    setOffers(p => p.map(o => o.id===id ? { ...o, status } : o))
    setSelected(p => p ? { ...p, status } : p)
  }

  const filtered = offers.filter(o => {
    const matchFilter = filter==='all' || o.status===filter
    const matchSearch = (o.offer_number||'').includes(search) || (o.clients?.name||'').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const Popup = ({ title, children, maxW='900px' }) => (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:maxW, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
          <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0, fontSize:18 }}>{title}</h2>
          <button onClick={() => { setIsFormOpen(false); setEditOffer(null) }} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        <div style={{ padding:'20px 32px 32px' }}>{children}</div>
      </div>
    </div>
  )

  if (selected) return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => setSelected(null)} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Назад</button>
        <h2 style={{ color:'#3a2a35', margin:0, fontSize:22, fontWeight:900 }}>{selected.offer_number}</h2>
        <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:STATUS[selected.status]?.bg, color:STATUS[selected.status]?.color, fontWeight:700 }}>{STATUS[selected.status]?.label}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>👥 Клиент и събитие</div>
          {[
            ['Клиент', selected.clients?.name],
            ['Тип събитие', selected.event_type],
            ['Дата', formatDate(selected.event_date)],
            ['Час', selected.event_time],
            ['Локация', selected.location],
            ['Брой гости', selected.guest_count],
          ].map(([l,v]) => v ? (
            <div key={l} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13 }}>
              <span style={{ color:'#81BFB7', minWidth:120 }}>{l}</span>
              <span style={{ color:'#3a2a35', fontWeight:600 }}>{v}</span>
            </div>
          ) : null)}
        </div>

        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>💰 Финанси</div>
          {[
            ['Сума', `€${selected.subtotal?.toFixed(2)}`],
            ['Отстъпка', selected.discount>0?`-€${selected.discount?.toFixed(2)}`:null],
            ['Общо', `€${selected.total?.toFixed(2)}`],
            ['Депозит', selected.deposit>0?`€${selected.deposit?.toFixed(2)}`:null],
            ['Краен срок депозит', formatDate(selected.deposit_due_date)],
            ['Валидна до', formatDate(selected.valid_until)],
          ].map(([l,v]) => v && v!=='—' ? (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
              <span style={{ color:'#81BFB7' }}>{l}</span>
              <span style={{ color:'#3a2a35', fontWeight:700 }}>{v}</span>
            </div>
          ) : null)}
        </div>
      </div>

      {selected.items?.length > 0 && (
        <div style={{ ...card, marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>📦 Артикули</div>
          {selected.items.map((item,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(198,230,227,0.3)', fontSize:13 }}>
              <div>
                <div style={{ fontWeight:600, color:'#3a2a35' }}>{item.description}</div>
                <div style={{ fontSize:11, color:'#81BFB7' }}>{item.quantity} × €{item.unit_price}</div>
              </div>
              <div style={{ fontWeight:700, color:'#F3A2BE' }}>€{item.total?.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...card, marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>🔄 Промени статус</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {Object.entries(STATUS).map(([k,v]) => (
            <button key={k} onClick={() => updateStatus(selected.id, k)} style={{ padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:12, background: selected.status===k?v.bg:'#f0f0f0', color: selected.status===k?v.color:'#aaa', outline: selected.status===k?`2px solid ${v.color}`:'none' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => { setEditOffer(selected); setIsFormOpen(true) }} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer' }}>✏️ Редактирай</button>
        <button style={{ padding:'12px 24px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer' }}>📄 Свали PDF</button>
        <button onClick={async () => {
          const { data: settings } = await supabase.from('settings').select('*').limit(1).single()
          const s = settings || {}
          const clientName = selected.clients?.name || '—'
          const formatD = (iso) => { if (!iso) return '—'; const p = iso.split('-'); return `${p[2]}.${p[1]}.${p[0]}` }

          const itemRows = (selected.items||[]).map(item => `
            <tr>
              <td>${item.description||'—'}</td>
              <td style="text-align:center">${item.quantity}</td>
              <td style="text-align:right">€${(item.unit_price||0).toFixed(2)}</td>
              <td style="text-align:right;font-weight:700">€${(item.total||0).toFixed(2)}</td>
            </tr>`).join('')

          const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Lato:wght@300;400;700&display=swap');
              * { margin:0; padding:0; box-sizing:border-box; }
              body { font-family:'Lato',sans-serif; color:#3a2a35; background:#fff; font-size:13px; }
              .header {
                background: linear-gradient(135deg, #FFD3DD 0%, #C6E6E3 100%);
                padding: 32px 40px 24px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .logo-block { color: #fff; }
              .logo-main { font-family:'Dancing Script',cursive; font-size:42px; font-weight:700; color:#fff; line-height:1; text-shadow: 1px 1px 3px rgba(0,0,0,0.15); }
              .logo-sub { font-size:12px; color:rgba(255,255,255,0.9); letter-spacing:3px; margin-top:2px; }
              .logo-contact { margin-top:12px; font-size:11px; color:rgba(255,255,255,0.85); line-height:1.8; }
              .offer-meta { text-align:right; color:#fff; }
              .offer-num { font-size:18px; font-weight:700; margin-bottom:6px; }
              .offer-date { font-size:11px; color:rgba(255,255,255,0.85); line-height:1.8; }
              .divider { height:1px; background:rgba(255,255,255,0.5); margin: 20px 40px 0; }
              .client-bar { background:rgba(255,255,255,0.4); padding:14px 40px; display:flex; justify-content:space-between; align-items:center; }
              .client-name { font-size:15px; font-weight:700; color:#3a2a35; }
              .client-event { font-size:12px; color:#81BFB7; margin-top:2px; }
              .body { padding:24px 40px; }
              .section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#F3A2BE; margin:20px 0 10px; padding-bottom:6px; border-bottom:2px solid #FFD3DD; }
              table { width:100%; border-collapse:collapse; font-size:12px; }
              thead tr { background:#F0F9F8; }
              th { padding:8px 10px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#81BFB7; font-weight:700; }
              th:last-child, td:last-child { text-align:right; }
              td { padding:8px 10px; border-bottom:1px solid #f5f0ff; }
              tr:last-child td { border-bottom:none; }
              .totals { margin-top:16px; margin-left:auto; width:280px; }
              .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; border-bottom:1px solid #f5f0ff; }
              .total-row.final { font-size:16px; font-weight:700; color:#fff; background:linear-gradient(135deg,#F3A2BE,#81BFB7); padding:12px 16px; border-radius:8px; margin-top:8px; border:none; }
              .total-row.discount { color:#F3A2BE; }
              .deposit-box { margin-top:16px; background:#F0F9F8; border-left:3px solid #81BFB7; padding:12px 16px; font-size:12px; }
              .notes-box { margin-top:16px; background:#FFF8F9; border-left:3px solid #FFD3DD; padding:12px 16px; font-size:12px; color:#3a2a35; line-height:1.6; }
              .footer { margin-top:32px; padding:16px 40px; background:linear-gradient(135deg,#FFD3DD,#C6E6E3); text-align:center; font-size:11px; color:rgba(255,255,255,0.95); }
              .services-row { background:#FFF8F9; }
              @media print { body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} }
            </style>
          </head><body>

          <div class="header">
            <div class="logo-block">
              <div class="logo-main">Eleya Decor</div>
              <div class="logo-sub">studio</div>
              <div class="logo-contact">
                ${s.company_email||'eleya.decor@gmail.com'}<br>
                ${s.company_phone||'+359 877 163 171'}<br>
                ${s.company_address||'гр. Казанлък'}
              </div>
            </div>
            <div class="offer-meta">
              <div class="offer-num">Оферта № ${selected.offer_number||'—'}</div>
              <div class="offer-date">
                Дата: ${formatD(new Date().toISOString().split('T')[0])}<br>
                ${selected.valid_until?'Валидна до: '+formatD(selected.valid_until):''}
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="client-bar">
            <div>
              <div class="client-name">До: ${clientName}</div>
              <div class="client-event">
                ${selected.event_type||''} ${selected.event_date?'· '+formatD(selected.event_date):''} ${selected.event_time?'· '+selected.event_time:''} ${selected.location?'· '+selected.location:''}
              </div>
            </div>
            ${selected.guest_count?`<div style="font-size:12px;color:#81BFB7;">👥 ${selected.guest_count} гости</div>`:''}
          </div>

          <div class="body">
            <div class="section-title">Артикули и услуги</div>
            <table>
              <thead><tr>
                <th>Описание</th>
                <th style="text-align:center">Бр.</th>
                <th style="text-align:right">Ед. цена</th>
                <th style="text-align:right">Общо</th>
              </tr></thead>
              <tbody>
                ${itemRows}
                ${selected.delivery?`<tr class="services-row"><td>🚚 Доставка</td><td style="text-align:center">1</td><td style="text-align:right">€${(selected.delivery_price||0).toFixed(2)}</td><td style="text-align:right;font-weight:700">€${(selected.delivery_price||0).toFixed(2)}</td></tr>`:''}
                ${selected.installation?`<tr class="services-row"><td>🔧 Монтаж</td><td style="text-align:center">1</td><td style="text-align:right">€${(selected.installation_price||0).toFixed(2)}</td><td style="text-align:right;font-weight:700">€${(selected.installation_price||0).toFixed(2)}</td></tr>`:''}
                ${selected.dismantling?`<tr class="services-row"><td>📦 Демонтаж</td><td style="text-align:center">1</td><td style="text-align:right">€${(selected.dismantling_price||0).toFixed(2)}</td><td style="text-align:right;font-weight:700">€${(selected.dismantling_price||0).toFixed(2)}</td></tr>`:''}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row"><span>Сума</span><span>€${(selected.subtotal||0).toFixed(2)}</span></div>
              ${selected.discount>0?`<div class="total-row discount"><span>Отстъпка</span><span>-€${(selected.discount||0).toFixed(2)}</span></div>`:''}
              <div class="total-row final"><span>ОБЩО</span><span>€${(selected.total||0).toFixed(2)}</span></div>
            </div>

            ${selected.deposit>0?`
            <div class="deposit-box">
              💳 <strong>Депозит:</strong> €${(selected.deposit||0).toFixed(2)}
              ${selected.deposit_due_date?` · Краен срок: ${formatD(selected.deposit_due_date)}`:''}
            </div>`:''}

            ${selected.notes?`
            <div class="section-title" style="margin-top:20px">Бележки</div>
            <div class="notes-box">${selected.notes}</div>`:''}
          </div>

          <div class="footer">
            ${s.offer_footer_text||'Благодарим Ви за доверието! 🌸'}<br>
            <strong>Eleya Decor Studio</strong> · ${s.company_email||'eleya.decor@gmail.com'} · ${s.company_phone||'+359 877 163 171'}
          </div>

          </body></html>`

          const w = window.open('','_blank','width=900,height=1100')
          w.document.write(html)
          w.document.close()
          setTimeout(() => w.print(), 800)
        }} style={{ padding:'12px 20px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}>
          📄 Свали PDF
        </button>
        <button onClick={() => {
          const formatD = (iso) => { if (!iso) return '—'; const p = iso.split('-'); return `${p[2]}.${p[1]}.${p[0]}` }
          const subject = encodeURIComponent(`Оферта от Eleya Decor Studio — ${selected.event_type||'Събитие'} ${formatD(selected.event_date)}`)
          const body = encodeURIComponent(`Здравейте, ${selected.clients?.name||''},\n\nБлагодарим Ви за интереса към Eleya Decor Studio! 🌸\n\nМоля, намерете приложената оферта за Вашето събитие.\n\nОферта №: ${selected.offer_number||'—'}\nСъбитие: ${selected.event_type||'—'} на ${formatD(selected.event_date)}\nОбща сума: €${(selected.total||0).toFixed(2)}\n${selected.deposit>0?'Депозит: €'+selected.deposit.toFixed(2)+' до '+formatD(selected.deposit_due_date)+'\n':''}Валидна до: ${formatD(selected.valid_until)}\n\nЗа въпроси не се колебайте да се свържете с нас.\n\nС уважение,\nEleya Decor Studio\neleya.decor@gmail.com\n+359 877 163 171`)
          window.open(`mailto:?subject=${subject}&body=${body}`)
        }} style={{ padding:'12px 20px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer', fontSize:13 }}>
          📧 Изпрати по имейл
        </button>
        <button onClick={() => deleteOffer(selected.id)} style={{ padding:'12px 24px', background:'#FFD3DD', border:'none', borderRadius:12, color:'#c0392b', fontWeight:700, cursor:'pointer' }}>🗑️ Изтрий</button>
      </div>

      {isFormOpen && (
        <Popup title="✏️ Редактирай оферта" maxW="900px">
          <OfferForm offer={editOffer} onClose={() => { setIsFormOpen(false); setEditOffer(null) }} onSaved={() => { loadOffers(); setSelected(null) }} />
        </Popup>
      )}
    </div>
  )

  return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Табло</button>
          <h1 style={{ color:'#3a2a35', margin:0, fontSize:24, fontWeight:900 }}>📄 Оферти</h1>
          <span style={{ fontSize:12, color:'#81BFB7' }}>{offers.length} оферти</span>
        </div>
        <button onClick={() => { setEditOffer(null); setIsFormOpen(true) }} style={{ padding:'12px 20px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:13, cursor:'pointer' }}>
          + Нова оферта
        </button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input style={{ flex:1, padding:'10px 16px', borderRadius:12, border:'1px solid #C6E6E3', background:'rgba(255,255,255,0.8)', fontSize:13, color:'#3a2a35', outline:'none', minWidth:200 }}
          placeholder="🔍 Търси по номер или клиент..." value={search} onChange={e => setSearch(e.target.value)} />
        {['all',...Object.keys(STATUS)].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background: filter===f?(f==='all'?'#F3A2BE':STATUS[f]?.bg):'rgba(255,255,255,0.7)', color: filter===f?(f==='all'?'#fff':STATUS[f]?.color):'#81BFB7' }}>
            {f==='all'?`Всички (${offers.length})`:STATUS[f]?.label+` (${offers.filter(o=>o.status===f).length})`}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign:'center', padding:40, color:'#81BFB7' }}>Зарежда...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:'#81BFB7', background:'rgba(255,255,255,0.7)', borderRadius:20 }}>
          {search ? 'Няма намерени оферти' : 'Няма оферти — създай първата!'}
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(o => (
          <div key={o.id} onClick={() => setSelected(o)} style={{ ...card, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:`4px solid ${STATUS[o.status]?.color||'#C6E6E3'}` }}>
            <div style={{ display:'flex', gap:20, alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800, color:'#3a2a35', fontSize:15 }}>{o.offer_number}</div>
                <div style={{ fontSize:12, color:'#81BFB7' }}>{o.clients?.name || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize:12, color:'#3a2a35' }}>{o.event_type || '—'}</div>
                <div style={{ fontSize:11, color:'#81BFB7' }}>📅 {formatDate(o.event_date)}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:18, fontWeight:900, color:'#F3A2BE' }}>€{o.total?.toFixed(2)}</div>
                {o.deposit>0 && <div style={{ fontSize:11, color:'#81BFB7' }}>Депозит: €{o.deposit?.toFixed(2)}</div>}
              </div>
              <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:STATUS[o.status]?.bg, color:STATUS[o.status]?.color, fontWeight:700 }}>{STATUS[o.status]?.label}</span>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <Popup title={editOffer?'✏️ Редактирай оферта':'📄 Нова оферта'} maxW="900px">
          <OfferForm offer={editOffer} prefill={prefillInquiry} onClose={() => { setIsFormOpen(false); setEditOffer(null) }} onSaved={loadOffers} />
        </Popup>
      )}
    </div>
  )
}