import React, { useState, useEffect } from 'react'
import { inp, Lbl } from './shared.jsx'
import { supabase } from './supabaseClient'

const card = { background: 'rgba(255,255,255,0.85)', borderRadius: 20, border: '1px solid rgba(243,162,190,0.2)', padding: 20 }
const inp2 = { width:'100%', padding:'10px 13px', border:'1px solid #C6E6E3', borderRadius:8, fontSize:14, color:'#3a2a35', background:'#F0F9F8', outline:'none', boxSizing:'border-box' }

function ThemeForm({ theme, onClose, onSaved }) {
  const [form, setForm] = useState({ name:'', description:'', colors:[], notes:'', is_active:true })
  const [materials, setMaterials] = useState([])
  const [inventory, setInventory] = useState([])
  const [beforeFile, setBeforeFile] = useState(null)
  const [afterFile, setAfterFile] = useState(null)
  const [beforePreview, setBeforePreview] = useState(null)
  const [afterPreview, setAfterPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newColor, setNewColor] = useState('#F3A2BE')

  useEffect(() => {
    loadInventory()
    if (theme) {
      setForm({ name:theme.name, description:theme.description||'', colors:theme.colors||[], notes:theme.notes||'', is_active:theme.is_active })
      setBeforePreview(theme.before_image_url)
      setAfterPreview(theme.after_image_url)
      loadMaterials(theme.id)
    }
  }, [theme])

  const loadInventory = async () => {
    const { data } = await supabase.from('inventory').select('id,name,unit,cost_per_unit').order('name')
    setInventory(data || [])
  }

  const loadMaterials = async (id) => {
    const { data } = await supabase.from('theme_materials').select('*').eq('theme_id', id)
    setMaterials(data || [])
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addColor = () => {
    if (!form.colors.includes(newColor)) set('colors', [...form.colors, newColor])
  }

  const removeColor = (c) => set('colors', form.colors.filter(x => x !== c))

  const addMaterial = () => setMaterials(p => [...p, { item_name:'', inventory_id:'', quantity:1, unit:'бр', cost_per_unit:0, notes:'' }])

  const updateMaterial = (i, field, value) => setMaterials(p => p.map((m,idx) => idx===i ? { ...m, [field]:value } : m))

  const removeMaterial = (i) => setMaterials(p => p.filter((_,idx) => idx!==i))

  const selectInventoryItem = (i, invId) => {
    const inv = inventory.find(x => x.id === invId)
    if (inv) updateMaterial(i, 'inventory_id', invId)
    if (inv) updateMaterial(i, 'item_name', inv.name)
    if (inv) updateMaterial(i, 'unit', inv.unit)
    if (inv) updateMaterial(i, 'cost_per_unit', inv.cost_per_unit)
  }

  const uploadImage = async (file, path) => {
    const ext = file.name.split('.').pop()
    const fullPath = `${path}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('themes').upload(fullPath, file)
    if (error) return null
    const { data } = supabase.storage.from('themes').getPublicUrl(fullPath)
    return data.publicUrl
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Въведи името на темата'); return }
    setSaving(true); setError('')

    let before_image_url = theme?.before_image_url || ''
    let after_image_url = theme?.after_image_url || ''
    if (beforeFile) before_image_url = await uploadImage(beforeFile, 'before') || before_image_url
    if (afterFile) after_image_url = await uploadImage(afterFile, 'after') || after_image_url

    const payload = { ...form, before_image_url, after_image_url }

    let themeId = theme?.id
    if (theme) {
      await supabase.from('themes').update(payload).eq('id', theme.id)
    } else {
      const { data } = await supabase.from('themes').insert([payload]).select()
      themeId = data?.[0]?.id
    }

    if (themeId) {
      await supabase.from('theme_materials').delete().eq('theme_id', themeId)
      const mats = materials.filter(m => m.item_name.trim()).map(m => ({ ...m, theme_id: themeId, quantity: +m.quantity, cost_per_unit: +m.cost_per_unit }))
      if (mats.length) await supabase.from('theme_materials').insert(mats)
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const S = { background:'#fff', border:'1px solid #C6E6E3', padding:'20px', marginBottom:12, borderRadius:16 }

  return (
    <div>
      {/* ОСНОВНИ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>🎨 Основни данни</div>
        <div style={{ marginBottom:12 }}><Lbl>Име на темата *</Lbl><input style={inp2} placeholder="напр. Принцеси, Морска, Пастелно..." value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div style={{ marginBottom:12 }}><Lbl>Описание</Lbl><textarea style={{ ...inp2, height:70, resize:'vertical' }} placeholder="Кратко описание на темата..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div style={{ marginBottom:12 }}><Lbl>Бележки</Lbl><textarea style={{ ...inp2, height:60, resize:'vertical' }} placeholder="Допълнителни бележки..." value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      </div>

      {/* ЦВЕТОВЕ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>🎨 Цветова палитра</div>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width:40, height:40, border:'none', cursor:'pointer', borderRadius:8 }} />
          <button onClick={addColor} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer' }}>+ Добави цвят</button>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {form.colors.map((c,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:4, background:'#F0F9F8', borderRadius:20, padding:'4px 10px 4px 6px', border:'1px solid #C6E6E3' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:c, border:'1px solid #eee' }}/>
              <span style={{ fontSize:11, color:'#3a2a35' }}>{c}</span>
              <button onClick={() => removeColor(c)} style={{ background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:14, lineHeight:1 }}>×</button>
            </div>
          ))}
          {form.colors.length === 0 && <div style={{ fontSize:12, color:'#81BFB7' }}>Няма добавени цветове</div>}
        </div>
      </div>

      {/* СНИМКИ */}
      <div style={S}>
        <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>📸 Before & After снимки</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <Lbl>Before снимка</Lbl>
            <input type="file" accept="image/*" onChange={e => { setBeforeFile(e.target.files[0]); setBeforePreview(URL.createObjectURL(e.target.files[0])) }} style={{ marginBottom:8, fontSize:12 }} />
            {beforePreview && <img src={beforePreview} alt="before" style={{ width:'100%', height:140, objectFit:'cover', borderRadius:10, border:'1px solid #C6E6E3' }} />}
          </div>
          <div>
            <Lbl>After снимка</Lbl>
            <input type="file" accept="image/*" onChange={e => { setAfterFile(e.target.files[0]); setAfterPreview(URL.createObjectURL(e.target.files[0])) }} style={{ marginBottom:8, fontSize:12 }} />
            {afterPreview && <img src={afterPreview} alt="after" style={{ width:'100%', height:140, objectFit:'cover', borderRadius:10, border:'1px solid #C6E6E3' }} />}
          </div>
        </div>
      </div>

      {/* МАТЕРИАЛИ */}
      <div style={S}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1 }}>📦 Материали</div>
          <button onClick={addMaterial} style={{ padding:'6px 14px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>+ Добави</button>
        </div>
        {materials.length === 0 && <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:16, background:'#F0F9F8', borderRadius:10 }}>Няма добавени материали</div>}
        {materials.map((m, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:8, marginBottom:8, padding:12, background:'#F0F9F8', borderRadius:10 }}>
            <div>
              <Lbl>Артикул</Lbl>
              <select style={inp2} value={m.inventory_id||''} onChange={e => {
                if (e.target.value === 'custom') { updateMaterial(i,'inventory_id',''); updateMaterial(i,'item_name','') }
                else selectInventoryItem(i, e.target.value)
              }}>
                <option value="">-- От инвентара --</option>
                {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                <option value="custom">✏️ Въведи ръчно</option>
              </select>
              {(!m.inventory_id || m.inventory_id==='') && (
                <input style={{ ...inp2, marginTop:6 }} placeholder="Име на артикула" value={m.item_name} onChange={e => updateMaterial(i,'item_name',e.target.value)} />
              )}
            </div>
            <div><Lbl>Количество</Lbl><input style={inp2} type="number" min={0} step="0.5" value={m.quantity} onChange={e => updateMaterial(i,'quantity',+e.target.value)} /></div>
            <div><Lbl>Единица</Lbl><select style={inp2} value={m.unit} onChange={e => updateMaterial(i,'unit',e.target.value)}>{['бр','м','кг','пакет','ролка'].map(u=><option key={u} value={u}>{u}</option>)}</select></div>
            <div><Lbl>€/единица</Lbl><input style={inp2} type="number" min={0} step="0.01" value={m.cost_per_unit} onChange={e => updateMaterial(i,'cost_per_unit',+e.target.value)} /></div>
            <button onClick={() => removeMaterial(i)} style={{ marginTop:20, background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:20 }}>×</button>
          </div>
        ))}
        {materials.length > 0 && (
          <div style={{ display:'flex', justifyContent:'flex-end', padding:'8px 12px', background:'#FFD3DD', borderRadius:10, fontSize:13, fontWeight:700, color:'#3a2a35' }}>
            Обща себестойност: €{materials.reduce((s,m) => s + (m.quantity * m.cost_per_unit), 0).toFixed(2)}
          </div>
        )}
      </div>

      {error && <div style={{ color:'#c0392b', fontSize:12, padding:'8px 12px', background:'#FFD3DD', marginBottom:8, borderRadius:8 }}>{error}</div>}

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:13, background:'#fff', border:'1px solid #C6E6E3', color:'#81BFB7', fontWeight:700, cursor:'pointer', borderRadius:12, fontSize:13 }}>Отказ</button>
        <button onClick={handleSubmit} disabled={saving} style={{ flex:2, padding:13, background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', color:'#fff', border:'none', fontWeight:800, cursor:'pointer', borderRadius:12, fontSize:13 }}>
          {saving ? '⏳ Записва...' : theme ? '💾 Обнови темата' : '🎨 Запази темата'}
        </button>
      </div>
    </div>
  )
}

export default function ThemesPage({ onBack }) {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTheme, setEditTheme] = useState(null)
  const [selected, setSelected] = useState(null)
  const [materials, setMaterials] = useState([])

  useEffect(() => { loadThemes() }, [])

  const loadThemes = async () => {
    setLoading(true)
    const { data } = await supabase.from('themes').select('*').order('name')
    setThemes(data || [])
    setLoading(false)
  }

  const loadMaterials = async (id) => {
    const { data } = await supabase.from('theme_materials').select('*').eq('theme_id', id)
    setMaterials(data || [])
  }

  const deleteTheme = async (id) => {
    if (!window.confirm('Изтрий тази тема?')) return
    await supabase.from('themes').delete().eq('id', id)
    setThemes(p => p.filter(t => t.id !== id))
    setSelected(null)
  }

  const Popup = ({ title, children }) => (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(58,42,53,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#F0F9F8', borderRadius:32, width:'90%', maxWidth:'800px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'20px 32px', borderBottom:'1px solid #FFD3DD', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.9)', borderTopLeftRadius:32, borderTopRightRadius:32 }}>
          <h2 style={{ color:'#3a2a35', fontWeight:900, margin:0, fontSize:18 }}>{title}</h2>
          <button onClick={() => { setIsFormOpen(false); setEditTheme(null) }} style={{ border:'none', background:'#FFD3DD', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18 }}>✕</button>
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
      </div>

      {/* BEFORE & AFTER */}
      {(selected.before_image_url || selected.after_image_url) && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          {selected.before_image_url && (
            <div style={card}>
              <div style={{ fontSize:11, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>📸 Before</div>
              <img src={selected.before_image_url} alt="before" style={{ width:'100%', borderRadius:12, maxHeight:250, objectFit:'cover' }} />
            </div>
          )}
          {selected.after_image_url && (
            <div style={card}>
              <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>✨ After</div>
              <img src={selected.after_image_url} alt="after" style={{ width:'100%', borderRadius:12, maxHeight:250, objectFit:'cover' }} />
            </div>
          )}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>🎨 Детайли</div>
          {selected.description && <p style={{ fontSize:13, color:'#3a2a35', marginBottom:12, lineHeight:1.6 }}>{selected.description}</p>}
          {selected.colors?.length > 0 && (
            <div>
              <div style={{ fontSize:11, color:'#81BFB7', marginBottom:8 }}>Цветова палитра:</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {selected.colors.map((c,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F9F8', borderRadius:20, padding:'4px 12px 4px 6px' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:c, border:'1px solid #eee' }}/>
                    <span style={{ fontSize:11 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selected.notes && <p style={{ fontSize:12, color:'#81BFB7', marginTop:12 }}>{selected.notes}</p>}
        </div>

        <div style={card}>
          <div style={{ fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>📦 Материали</div>
          {materials.length === 0 ? (
            <div style={{ fontSize:12, color:'#81BFB7', textAlign:'center', padding:20 }}>Няма добавени материали</div>
          ) : (
            <>
              {materials.map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(198,230,227,0.3)', fontSize:13 }}>
                  <div>
                    <div style={{ fontWeight:600, color:'#3a2a35' }}>{m.item_name}</div>
                    <div style={{ fontSize:11, color:'#81BFB7' }}>{m.quantity} {m.unit}</div>
                  </div>
                  <div style={{ fontWeight:700, color:'#F3A2BE' }}>€{(m.quantity*m.cost_per_unit).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 0', fontSize:14, fontWeight:900, color:'#3a2a35' }}>
                <span>Обща себестойност</span>
                <span style={{ color:'#F3A2BE' }}>€{materials.reduce((s,m)=>s+(m.quantity*m.cost_per_unit),0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => { setEditTheme(selected); setIsFormOpen(true) }} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer' }}>✏️ Редактирай</button>
        <button onClick={() => deleteTheme(selected.id)} style={{ padding:'12px 24px', background:'#FFD3DD', border:'none', borderRadius:12, color:'#c0392b', fontWeight:700, cursor:'pointer' }}>🗑️ Изтрий</button>
      </div>

      {isFormOpen && (
        <Popup title="✏️ Редактирай тема">
          <ThemeForm theme={editTheme} onClose={() => { setIsFormOpen(false); setEditTheme(null) }} onSaved={() => { loadThemes(); setSelected(null) }} />
        </Popup>
      )}
    </div>
  )

  return (
    <div style={{ padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer' }}>← Табло</button>
          <h1 style={{ color:'#3a2a35', margin:0, fontSize:24, fontWeight:900 }}>🎨 Теми</h1>
          <span style={{ fontSize:12, color:'#81BFB7' }}>{themes.length} теми</span>
        </div>
        <button onClick={() => { setEditTheme(null); setIsFormOpen(true) }} style={{ padding:'12px 20px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:13, cursor:'pointer' }}>
          + Нова тема
        </button>
      </div>

      {loading && <div style={{ textAlign:'center', padding:40, color:'#81BFB7' }}>Зарежда...</div>}

      {!loading && themes.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:'#81BFB7', background:'rgba(255,255,255,0.7)', borderRadius:20 }}>
          Няма теми — добави първата!
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {themes.map(t => (
          <div key={t.id} onClick={() => { setSelected(t); loadMaterials(t.id) }} style={{ ...card, cursor:'pointer', overflow:'hidden', padding:0 }}>
            {t.after_image_url ? (
              <img src={t.after_image_url} alt={t.name} style={{ width:'100%', height:180, objectFit:'cover' }} />
            ) : (
              <div style={{ width:'100%', height:180, background:'linear-gradient(135deg,#FFD3DD,#C6E6E3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>🎨</div>
            )}
            <div style={{ padding:16 }}>
              <div style={{ fontWeight:800, color:'#3a2a35', fontSize:16, marginBottom:6 }}>{t.name}</div>
              {t.description && <div style={{ fontSize:12, color:'#81BFB7', marginBottom:8 }}>{t.description}</div>}
              {t.colors?.length > 0 && (
                <div style={{ display:'flex', gap:6 }}>
                  {t.colors.slice(0,6).map((c,i) => <div key={i} style={{ width:20, height:20, borderRadius:'50%', background:c, border:'1px solid #eee' }}/>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <Popup title={editTheme ? '✏️ Редактирай тема' : '🎨 Нова тема'}>
          <ThemeForm theme={editTheme} onClose={() => { setIsFormOpen(false); setEditTheme(null) }} onSaved={loadThemes} />
        </Popup>
      )}
    </div>
  )
}