import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ClientForm from './ClientForm.jsx'

const STATUSES = {
  regular:    { label: '👤 Редовен',  bg: '#F0F9F8', color: '#81BFB7' },
  vip:        { label: '⭐ VIP',       bg: '#FFD3DD', color: '#F3A2BE' },
  ambassador: { label: '🌸 Посланик', bg: '#C6E6E3', color: '#2a5450' },
}

const formatDate = (iso) => {
  if (!iso) return '—'
  const p = iso.split('-')
  return `${p[2]}.${p[1]}.${p[0]}`
}

export default function ClientsPage({ onBack }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editClient, setEditClient] = useState(null)

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('name')
    setClients(data || [])
    setLoading(false)
  }

  const deleteClient = async (id) => {
    if (!window.confirm('Изтрий този клиент?')) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(p => p.filter(c => c.id !== id))
    setSelected(null)
  }

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) || (c.email || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  const card = { background: 'rgba(255,255,255,0.85)', borderRadius: 20, border: '1px solid rgba(243,162,190,0.2)', padding: 20 }

  const Popup = ({ children, maxW = '700px' }) => (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:maxW, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
        {children}
      </div>
    </div>
  )

  // ДЕТАЙЛЕН ИЗГЛЕД
  if (selected) return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => setSelected(null)} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer', fontSize:13 }}>← Назад</button>
        <h2 style={{ color:'#3a2a35', margin:0, fontSize:22, fontWeight:900 }}>{selected.name}</h2>
        <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background: STATUSES[selected.status]?.bg, color: STATUSES[selected.status]?.color, fontWeight:700 }}>
          {STATUSES[selected.status]?.label}
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>🌸 Основни данни</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:13 }}>
            {[
              ['📞 Телефон', selected.phone],
              ['📧 Имейл', selected.email],
              ['🎂 Рожден ден', formatDate(selected.birthday)],
              ['📱 Предпочита', selected.preferred_contact],
              ['🔍 Намерил ни чрез', selected.source],
              ['🎨 Предпочитана тема', selected.preferred_theme],
            ].map(([l, v]) => v ? (
              <div key={l} style={{ display:'flex', gap:8 }}>
                <span style={{ color:'#81BFB7', minWidth:160 }}>{l}</span>
                <span style={{ color:'#3a2a35', fontWeight:600 }}>{v}</span>
              </div>
            ) : null)}
            <div style={{ display:'flex', gap:4, marginTop:4 }}>
              {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:18, opacity: n <= (selected.rating||5) ? 1 : 0.2 }}>⭐</span>)}
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>👨‍👩‍👧 Семейна информация</div>
          {(!selected.family_members || selected.family_members.length === 0) ? (
            <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:20 }}>Няма добавена семейна информация</div>
          ) : selected.family_members.map((m, i) => (
            <div key={i} style={{ padding:'10px 12px', background:'#F0F9F8', borderRadius:10, marginBottom:8 }}>
              <div style={{ fontWeight:700, color:'#3a2a35', fontSize:13 }}>{m.name}</div>
              {m.birthday && <div style={{ fontSize:11, color:'#81BFB7' }}>🎂 {formatDate(m.birthday)}</div>}
              {m.phone && <div style={{ fontSize:11, color:'#81BFB7' }}>📞 {m.phone}</div>}
            </div>
          ))}
        </div>

        {selected.notes && (
          <div style={{ ...card, gridColumn:'1/-1' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>📝 Бележки</div>
            <div style={{ fontSize:13, color:'#3a2a35', lineHeight:1.6 }}>{selected.notes}</div>
          </div>
        )}
      </div>

      <div style={{ display:'flex', gap:10, marginTop:16 }}>
        <button onClick={() => { setEditClient(selected); setIsFormOpen(true) }} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}>
          ✏️ Редактирай
        </button>
        <button onClick={() => deleteClient(selected.id)} style={{ padding:'12px 24px', background:'#FFD3DD', border:'none', borderRadius:12, color:'#c0392b', fontWeight:700, cursor:'pointer', fontSize:13 }}>
          🗑️ Изтрий
        </button>
      </div>

      {isFormOpen && (
        <Popup>
          <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
            <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0 }}>✏️ Редактирай клиент</h2>
            <button onClick={() => { setIsFormOpen(false); setEditClient(null) }} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
          </div>
          <div style={{ padding:'20px 32px 32px' }}>
            <ClientForm editClient={editClient} onClose={() => { setIsFormOpen(false); setEditClient(null) }} onSaved={() => { loadClients(); setSelected(null) }} />
          </div>
        </Popup>
      )}
    </div>
  )

  // СПИСЪК
  return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer', fontSize:13 }}>← Табло</button>
          <h1 style={{ color:'#3a2a35', margin:0, fontSize:24, fontWeight:900 }}>👥 Клиенти</h1>
          <span style={{ fontSize:12, color:'#81BFB7' }}>{clients.length} клиента</span>
        </div>
        <button onClick={() => { setEditClient(null); setIsFormOpen(true) }} style={{ padding:'12px 20px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:13, cursor:'pointer' }}>
          + Нов клиент
        </button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input style={{ flex:1, padding:'10px 16px', borderRadius:12, border:'1px solid #C6E6E3', background:'rgba(255,255,255,0.8)', fontSize:13, color:'#3a2a35', outline:'none', minWidth:200 }}
          placeholder="🔍 Търси по име, телефон, имейл..." value={search} onChange={e => setSearch(e.target.value)} />
        {['all','regular','vip','ambassador'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'10px 16px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:12,
            background: filter===f ? '#F3A2BE' : 'rgba(255,255,255,0.7)',
            color: filter===f ? '#fff' : '#81BFB7'
          }}>
            {f==='all' ? `Всички (${clients.length})` : `${STATUSES[f]?.label} (${clients.filter(c=>c.status===f).length})`}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign:'center', padding:40, color:'#81BFB7' }}>Зарежда...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:'#81BFB7', background:'rgba(255,255,255,0.7)', borderRadius:20 }}>
          {search ? 'Няма намерени клиенти' : 'Няма клиенти — добави първия!'}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
        {filtered.map(c => (
          <div key={c.id} onClick={() => setSelected(c)} style={{ ...card, cursor:'pointer', borderLeft:`4px solid ${c.status==='vip'?'#F3A2BE':c.status==='ambassador'?'#81BFB7':'#C6E6E3'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:800, color:'#3a2a35', fontSize:16 }}>{c.name}</div>
                {c.phone && <div style={{ fontSize:12, color:'#81BFB7' }}>📞 {c.phone}</div>}
                {c.email && <div style={{ fontSize:12, color:'#81BFB7' }}>📧 {c.email}</div>}
              </div>
              <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background: STATUSES[c.status]?.bg, color: STATUSES[c.status]?.color, fontWeight:700, flexShrink:0 }}>
                {STATUSES[c.status]?.label}
              </span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', gap:2 }}>
                {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:14, opacity: n <= (c.rating||5) ? 1 : 0.2 }}>⭐</span>)}
              </div>
              {c.preferred_theme && <div style={{ fontSize:11, color:'#F3A2BE', fontWeight:600 }}>🎨 {c.preferred_theme}</div>}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <Popup>
          <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
            <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0 }}>🌸 Нов клиент</h2>
            <button onClick={() => setIsFormOpen(false)} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
          </div>
          <div style={{ padding:'20px 32px 32px' }}>
            <ClientForm onClose={() => setIsFormOpen(false)} onSaved={loadClients} />
          </div>
        </Popup>
      )}
    </div>
  )
}