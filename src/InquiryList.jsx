import React, { useState, useEffect } from 'react'
import { C, pill, pillLight } from './shared.jsx'
import { supabase } from './supabaseClient'
import InquiryForm from './InquiryForm.jsx'
const STATUS = {
  new:       { label: 'Ново',       bg: '#FFD3DD', color: '#5a2d3a' },
  reviewed:  { label: 'Прегледано', bg: '#C6E6E3', color: '#2a5450' },
  quoted:    { label: 'Оферирано',  bg: '#F3A2BE', color: '#fff' },
  confirmed: { label: 'Потвърдено', bg: '#81BFB7', color: '#fff' },
  cancelled: { label: 'Отказано',   bg: '#eee',    color: '#888' },
}

const formatDate = (iso) => {
  if (!iso) return '—'
  const p = iso.split('-')
  return `${p[2]}.${p[1]}.${p[0]}`
}

export default function InquiryList({ onOpenCalc }) {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editInquiry, setEditInquiry] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    setInquiries(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('inquiries').update({ status }).eq('id', id)
    setInquiries(p => p.map(i => i.id === id ? { ...i, status } : i))
    setSelected(p => p ? { ...p, status } : p)
  }

  const deleteInquiry = async (id) => {
    if (!window.confirm('Изтрий това запитване?')) return
    await supabase.from('inquiries').delete().eq('id', id)
    setInquiries(p => p.filter(i => i.id !== id))
    setSelected(null)
  }

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter)

  const Tag = ({ status }) => (
    <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background: STATUS[status]?.bg, color: STATUS[status]?.color, fontWeight:700 }}>
      {STATUS[status]?.label}
    </span>
  )

  // ДЕТАЙЛЕН ИЗГЛЕД (ПОП-АП)
  if (selected) return (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000, padding:20 }}>
      <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:600, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>

        {/* ХЕДЪР */}
        <div style={{ padding:'20px 30px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:18, color:'#3a2a35' }}>{selected.client_name}</div>
            <div style={{ fontSize:12, color:'#81BFB7' }}>{selected.client_phone} · {selected.client_email}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <Tag status={selected.status} />
            <button onClick={() => setSelected(null)} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
          </div>
        </div>

        <div style={{ padding:'24px 30px' }}>
          {/* ДЕТАЙЛИ */}
          <div style={{ background:'rgba(255,255,255,0.75)', borderRadius:16, padding:20, border:'1px solid rgba(243,162,190,0.3)', marginBottom:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:13 }}>
              {[
                ['🎉 Тип събитие', selected.event_type],
                ['🎨 Тема', selected.event_theme],
                ['📅 Дата', formatDate(selected.event_date)],
                ['⏰ Начален час', selected.event_start],
                ['📍 Локация', selected.location],
                ['👥 Брой гости', selected.guest_count],
                ['💶 Бюджет', selected.budget ? `€${selected.budget}` : null],
              ].map(([l, v]) => v ? (
                <div key={l}>
                  <div style={{ color:'#81BFB7', fontSize:10, fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                  <div style={{ color:'#3a2a35', fontWeight:600 }}>{v}</div>
                </div>
              ) : null)}
            </div>
            {selected.notes && (
              <div style={{ marginTop:14, background:'#FFD3DD', borderRadius:10, padding:12, fontSize:12, color:'#3a2a35' }}>
                📝 {selected.notes}
              </div>
            )}
            {selected.inspiration_url && (
              <img src={selected.inspiration_url} alt="inspiration" style={{ width:'100%', borderRadius:10, maxHeight:180, objectFit:'cover', marginTop:12 }} />
            )}
          </div>

          {/* СТАТУС */}
          <div style={{ background:'rgba(255,255,255,0.75)', borderRadius:16, padding:16, border:'1px solid rgba(243,162,190,0.3)', marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', marginBottom:10 }}>Промени статус</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} onClick={() => updateStatus(selected.id, k)} style={{
                  padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', border:'none',
                  background: selected.status === k ? v.color === '#fff' ? v.bg : v.bg : '#f0f0f0',
                  color: selected.status === k ? v.color : '#888',
                  outline: selected.status === k ? `2px solid ${v.bg}` : 'none',
                }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* ДЕЙСТВИЯ */}
          <div style={{ display:'flex', flexDirection:'row', gap:8 }}>
            <button onClick={() => { setEditInquiry(selected); setIsEditing(true) }} style={{ flex:1, padding:'10px 6px', background:'#C6E6E3', color:'#2a5450', border:'none', borderRadius:14, fontWeight:800, cursor:'pointer', fontSize:11, textAlign:'center' }}>
              ✏️ Редактирай
            </button>
            <button onClick={() => { onOpenCalc(selected); setSelected(null) }} style={{ flex:1, padding:'10px 6px', background:'#F3A2BE', color:'#fff', border:'none', borderRadius:14, fontWeight:800, cursor:'pointer', fontSize:11, textAlign:'center' }}>
              🎈 Калкулатор
            </button>
            <button style={{ flex:1, padding:'10px 6px', background:'rgba(255,255,255,0.8)', color:'#81BFB7', border:'1px solid #C6E6E3', borderRadius:14, fontWeight:800, cursor:'pointer', fontSize:11, textAlign:'center' }}>
              📄 Оферта
            </button>
            <button onClick={() => deleteInquiry(selected.id)} style={{ flex:1, padding:'10px 6px', background:'#FFD3DD', color:'#c0392b', border:'none', borderRadius:14, fontWeight:800, cursor:'pointer', fontSize:11, textAlign:'center' }}>
              🗑️ Изтрий
            </button>
          </div>
        </div>
      </div>
      {isEditing && editInquiry && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:3000, padding:20 }}>
          <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:800, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
              <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0 }}>✏️ Редактирай запитване</h2>
              <button onClick={() => { setIsEditing(false); setEditInquiry(null) }} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:'20px 32px 32px' }}>
              <InquiryForm editInquiry={editInquiry} onClose={() => { setIsEditing(false); setEditInquiry(null) }} onSaved={() => { load(); setSelected(null) }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // СПИСЪК
  return (
    <div>
      {/* ФИЛТРИ */}
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:12 }}>
        <button onClick={() => setFilter('all')} style={{ fontSize:10, padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, background: filter==='all' ? '#F3A2BE' : 'rgba(255,255,255,0.7)', color: filter==='all' ? '#fff' : '#81BFB7' }}>
          Всички ({inquiries.length})
        </button>
        {Object.entries(STATUS).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            fontSize:10, padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700,
            background: filter===k ? v.bg : 'rgba(255,255,255,0.7)',
            color: filter===k ? v.color : '#81BFB7',
          }}>
            {v.label} ({inquiries.filter(i => i.status === k).length})
          </button>
        ))}
      </div>

      {loading && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:20 }}>Зарежда...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:30, background:'rgba(255,255,255,0.7)', borderRadius:16 }}>
          Няма запитвания
        </div>
      )}

      {filtered.map(inq => (
        <div key={inq.id} onClick={() => setSelected(inq)} style={{
          background:'rgba(255,255,255,0.75)', borderRadius:14, padding:14,
          border:'1px solid rgba(243,162,190,0.25)', marginBottom:8, cursor:'pointer',
          borderLeft:`3px solid ${STATUS[inq.status]?.bg || '#FFD3DD'}`,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
            <div style={{ fontWeight:800, color:'#3a2a35', fontSize:13 }}>{inq.client_name}</div>
            <Tag status={inq.status} />
          </div>
          {(inq.event_type || inq.event_theme) && (
            <div style={{ fontSize:11, color:'#81BFB7', marginBottom:4 }}>
              {inq.event_type && `🎉 ${inq.event_type}`}{inq.event_theme && ` · ${inq.event_theme}`}
            </div>
          )}
          <div style={{ fontSize:11, color:'#F3A2BE', fontWeight:700 }}>
            📅 {formatDate(inq.event_date)}{inq.event_start && ` · ${inq.event_start}`}
          </div>
          {inq.budget && <div style={{ fontSize:11, color:'#81BFB7', fontWeight:700, marginTop:3 }}>💶 €{inq.budget}</div>}
        </div>
      ))}
    </div>
  )
}