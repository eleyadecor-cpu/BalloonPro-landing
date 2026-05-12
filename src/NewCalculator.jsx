import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const inp = { width:'100%', padding:'10px 13px', border:'1px solid #C6E6E3', borderRadius:8, fontSize:14, color:'#3a2a35', background:'#F0F9F8', outline:'none', boxSizing:'border-box' }
const Lbl = ({children}) => <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>{children}</div>
const Sec = ({title, children}) => (
  <div style={{background:'#fff',border:'1px solid #C6E6E3',padding:'20px',marginBottom:12,borderRadius:16}}>
    <div style={{fontSize:12,fontWeight:900,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #FFD3DD'}}>{title}</div>
    {children}
  </div>
)
const Row = ({children}) => <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:12}}>{children}</div>

const EVENT_TYPES = ['Рожден ден','Сватба','Кръщене','Абитуриентски бал','Корпоративно събитие','Детско парти','Годишнина','Годеж','Друго']
const [clusterTemplates, setClusterTemplates] = useState([])
const INIT = {
  // Таб 1 — Събитие
  inquiry_id: '',
  client_name: '',
  client_phone: '',
  client_email: '',
  event_type: '',
  event_theme: '',
  event_date: '',
  event_start: '',
  event_end: '',
  location: '',
  guest_count: '',
  budget: '',
  notes: '',
  inspiration_urls: [],
  // Таб 2 — Гирлянди
  garlands: [],
  // Таб 4 — Допълнения
  extras: [],
  // Таб 9 — Ценообразуване
  margin: 30,
  margin_type: 'percent',
  discount: 0,
  discount_type: 'percent',
}

const TABS = [
  { id: 1, label: '📅 Събитие' },
  { id: 2, label: '🎈 Гирлянди' },
  { id: 3, label: '🎨 Цветове' },
  { id: 4, label: '✨ Допълнения' },
  { id: 5, label: '⏱️ Труд' },
  { id: 6, label: '✅ Добри практики' },
  { id: 7, label: '🚗 Транспорт' },
  { id: 8, label: '📦 Наем' },
  { id: 9, label: '💰 Ценообразуване' },
  { id: 10, label: '📊 Финал' },
]

export default function NewCalculator({ onBack, inquiry, onCreateOffer }) {
  const [step, setStep] = useState(1)
  const [state, setState] = useState(INIT)
  const [settings, setSettings] = useState({})
  const [balloonPrices, setBalloonPrices] = useState([])
  const [clusterTemplates, setClusterTemplates] = useState([])
  const set = (k, v) => setState(p => ({...p, [k]: v}))

  useEffect(() => { loadSettings() }, [])

  useEffect(() => {
    if (inquiry) {
      setState(p => ({
        ...p,
        inquiry_id: inquiry.id || '',
        client_name: inquiry.client_name || '',
        client_phone: inquiry.client_phone || '',
        client_email: inquiry.client_email || '',
        event_type: inquiry.event_type || '',
        event_theme: inquiry.event_theme || '',
        event_date: inquiry.event_date ? inquiry.event_date.split('-').reverse().join('.') : '',
        event_start: inquiry.event_start || '',
        location: inquiry.location || '',
        guest_count: inquiry.guest_count || '',
        budget: inquiry.budget || '',
        notes: inquiry.notes || '',
        inspiration_urls: [
          inquiry.inspiration_url,
          inquiry.inspiration_url_2,
          inquiry.inspiration_url_3,
        ].filter(Boolean),
      }))
    }
  }, [inquiry])

  const loadSettings = async () => {
    const [ts, fs, bp, ct] = await Promise.all([
      supabase.from('time_settings').select('*').limit(1).single(),
      supabase.from('financial_settings').select('*').limit(1).single(),
      supabase.from('balloon_prices').select('*, balloon_series(name, manufacturer_id, manufacturers(name))').order('size_inch'),
      supabase.from('cluster_templates').select('*').order('name'),
    ])
    setSettings({ times: ts.data || {}, finances: fs.data || {} })
    setBalloonPrices(bp.data || [])
    setClusterTemplates(ct.data || [])
  }

  const formatDate = (d) => {
    if (!d) return ''
    if (d.includes('-')) return d.split('-').reverse().join('.')
    return d
  }

  const Tab1 = () => (
    <div>
      {inquiry && (
        <div style={{background:'#C6E6E3',borderRadius:12,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#2a5450',fontWeight:700}}>
          📝 Данните са заредени от запитване — провери и коригирай ако е нужно
        </div>
      )}

      <Sec title="👤 Данни на клиента">
        <Row>
          <div><Lbl>Ime на клиента</Lbl><input style={inp} placeholder="Мария Иванова" value={state.client_name} onChange={e=>set('client_name',e.target.value)} /></div>
          <div><Lbl>Телефон</Lbl><input style={inp} placeholder="+359 88..." value={state.client_phone} onChange={e=>set('client_phone',e.target.value)} /></div>
          <div><Lbl>Имейл</Lbl><input style={inp} placeholder="email@gmail.com" value={state.client_email} onChange={e=>set('client_email',e.target.value)} /></div>
        </Row>
      </Sec>

      <Sec title="🎉 Детайли на събитието">
        <Row>
          <div>
            <Lbl>Тип събитие</Lbl>
            <select style={inp} value={state.event_type} onChange={e=>set('event_type',e.target.value)}>
              <option value="">-- Избери --</option>
              {EVENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><Lbl>Тема на украсата</Lbl><input style={inp} placeholder="напр. Принцеси, Бохо..." value={state.event_theme} onChange={e=>set('event_theme',e.target.value)} /></div>
        </Row>
        <Row>
          <div>
            <Lbl>Дата</Lbl>
            <input style={inp} placeholder="дд.мм.гггг" maxLength={10} value={state.event_date} onChange={e=>{
              let v = e.target.value.replace(/[^0-9.]/g,'')
              if (v.length===2 && !v.includes('.')) v+='.'
              if (v.length===5 && v.split('.').length===2) v+='.'
              set('event_date',v)
            }} />
          </div>
          <div>
            <Lbl>Начален час</Lbl>
            <input style={inp} placeholder="чч:мм" maxLength={5} value={state.event_start} onChange={e=>{
              let v = e.target.value.replace(/[^0-9:]/g,'')
              if (v.length===2 && !v.includes(':')) v+=':'
              set('event_start',v)
            }} />
          </div>
          <div>
            <Lbl>Краен час</Lbl>
            <input style={inp} placeholder="чч:мм" maxLength={5} value={state.event_end} onChange={e=>{
              let v = e.target.value.replace(/[^0-9:]/g,'')
              if (v.length===2 && !v.includes(':')) v+=':'
              set('event_end',v)
            }} />
          </div>
          <div><Lbl>Брой гости</Lbl><input style={inp} type="number" value={state.guest_count} onChange={e=>set('guest_count',e.target.value)} /></div>
        </Row>
        <div style={{marginBottom:12}}><Lbl>Локация</Lbl><input style={inp} placeholder="Зала, адрес, град..." value={state.location} onChange={e=>set('location',e.target.value)} /></div>
        <div><Lbl>Бюджет на клиента (€)</Lbl><input style={inp} type="number" value={state.budget} onChange={e=>set('budget',e.target.value)} /></div>
      </Sec>

      <Sec title="📝 Бележки и вдъхновение">
        <div style={{marginBottom:12}}>
          <Lbl>Бележки от клиента</Lbl>
          <textarea style={{...inp,height:80,resize:'vertical'}} placeholder="Желания, специфики..." value={state.notes} onChange={e=>set('notes',e.target.value)} />
        </div>
        {state.inspiration_urls.length > 0 && (
          <div>
            <Lbl>📸 Снимки за вдъхновение от клиента</Lbl>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:8}}>
              {state.inspiration_urls.map((url,i)=>(
                <img key={i} src={url} alt={`inspiration ${i+1}`} style={{width:'100%',height:140,objectFit:'cover',borderRadius:10,border:'1px solid #C6E6E3'}} />
              ))}
            </div>
          </div>
        )}
      </Sec>
    </div>
  )

  const Tab2 = () => {
    const addGarland = () => {
      set('garlands', [...state.garlands, {
        id: Date.now(),
        name: `Гирлянд ${state.garlands.length + 1}`,
        length_cm: 300,
        templates: [],
      }])
    }

    const updateGarland = (gId, field, value) => {
      set('garlands', state.garlands.map(g => g.id===gId ? {...g,[field]:value} : g))
    }

    const removeGarland = (gId) => {
      set('garlands', state.garlands.filter(g => g.id!==gId))
    }

    const addTemplate = (gId) => {
      const firstTemplate = clusterTemplates[0]
      set('garlands', state.garlands.map(g => g.id!==gId ? g : {
        ...g,
        templates: [...g.templates, {
          id: Date.now(),
          template_id: firstTemplate?.id || '',
          main_size_inch: firstTemplate?.main_size_inch || 10,
          main_per_cluster: firstTemplate?.main_per_cluster || 4,
          has_small: firstTemplate?.has_small || false,
          small_per_cluster: firstTemplate?.small_per_cluster || 2,
          has_large: firstTemplate?.has_large || false,
          large_per_cluster: firstTemplate?.large_per_cluster || 1,
          stuffing_percent: firstTemplate?.stuffing_percent || 0,
          cluster_count: 0,
        }]
      }))
    }

    const applyTemplate = (gId, tId, templateId) => {
      const tmpl = clusterTemplates.find(t => t.id === templateId)
      if (!tmpl) return
      set('garlands', state.garlands.map(g => g.id!==gId ? g : {
        ...g,
        templates: g.templates.map(t => t.id!==tId ? t : {
          ...t,
          template_id: templateId,
          main_size_inch: tmpl.main_size_inch,
          main_per_cluster: tmpl.main_per_cluster,
          has_small: tmpl.has_small,
          small_per_cluster: tmpl.small_per_cluster,
          has_large: tmpl.has_large,
          large_per_cluster: tmpl.large_per_cluster,
          stuffing_percent: tmpl.stuffing_percent,
        })
      }))
    }

    const updateTemplate = (gId, tId, field, value) => {
      set('garlands', state.garlands.map(g => g.id!==gId ? g : {
        ...g,
        templates: g.templates.map(t => t.id!==tId ? t : {...t,[field]:value})
      }))
    }

    const removeTemplate = (gId, tId) => {
      set('garlands', state.garlands.map(g => g.id!==gId ? g : {
        ...g,
        templates: g.templates.filter(t => t.id!==tId)
      }))
    }

    // Автоматично изчисление на кластри по О'Кели формула
    const calcClusters = (lengthCm, sizeInch, perCluster) => {
      const price = balloonPrices.find(p => p.size_inch === sizeInch)
      const diamCm = price?.size_cm || (sizeInch * 2.54)
      const factor = perCluster <= 4 ? 4.8 : 6.3
      return Math.ceil((lengthCm / diamCm) * factor / perCluster)
    }

    return (
      <div>
        {state.garlands.length === 0 && (
          <div style={{textAlign:'center',padding:40,color:'#81BFB7',background:'rgba(255,255,255,0.7)',borderRadius:20,marginBottom:16}}>
            Няма гирлянди — добави първия!
          </div>
        )}

        {state.garlands.map((g, gi) => {
          const totalClusters = g.templates.reduce((s,t) => s + (t.cluster_count||0), 0)
          const autoClusters = g.templates.length > 0 && g.templates[0].cluster_count === 0
            ? calcClusters(g.length_cm, g.templates[0]?.main_size_inch||10, g.templates[0]?.main_per_cluster||4)
            : 0

          return (
            <div key={g.id} style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{display:'flex',gap:12,alignItems:'center',flex:1}}>
                  <input style={{...inp,maxWidth:200,fontWeight:700}} value={g.name} onChange={e=>updateGarland(g.id,'name',e.target.value)} />
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Lbl>Дължина:</Lbl>
                    <input style={{...inp,maxWidth:100}} type="number" min={10} step={10} value={g.length_cm} onChange={e=>updateGarland(g.id,'length_cm',+e.target.value)} />
                    <span style={{fontSize:13,color:'#81BFB7'}}>см</span>
                  </div>
                </div>
                <button onClick={()=>removeGarland(g.id)} style={{background:'#FFD3DD',border:'none',borderRadius:8,color:'#c0392b',cursor:'pointer',fontWeight:700,padding:'6px 12px'}}>🗑️ Изтрий</button>
              </div>

              {/* ШАБЛОНИ */}
              {g.templates.map((t, ti) => {
                const auto = calcClusters(g.length_cm, t.main_size_inch, t.main_per_cluster)
                const clusters = t.cluster_count || auto

                return (
                  <div key={t.id} style={{background:'#F0F9F8',borderRadius:12,padding:14,marginBottom:10,border:'1px solid #C6E6E3'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{fontSize:12,fontWeight:700,color:'#81BFB7'}}>Шаблон {ti+1}</span>
                        <select style={{...inp,maxWidth:200}} value={t.template_id||''} onChange={e=>applyTemplate(g.id,t.id,e.target.value)}>
                          <option value="">-- Избери шаблон --</option>
                          {clusterTemplates.map(ct=>(
                            <option key={ct.id} value={ct.id}>{ct.name}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={()=>removeTemplate(g.id,t.id)} style={{background:'none',border:'none',color:'#F3A2BE',cursor:'pointer',fontSize:18}}>×</button>
                    </div>

                    <Row>
                      <div>
                        <Lbl>Основен размер (")</Lbl>
                        <select style={inp} value={t.main_size_inch} onChange={e=>updateTemplate(g.id,t.id,'main_size_inch',+e.target.value)}>
                          {[...new Set(balloonPrices.map(p=>p.size_inch))].sort((a,b)=>a-b).map(s=>(
                            <option key={s} value={s}>{s}"</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Lbl>Бр. балони в кластър</Lbl>
                        <select style={inp} value={t.main_per_cluster} onChange={e=>updateTemplate(g.id,t.id,'main_per_cluster',+e.target.value)}>
                          {[2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} бр</option>)}
                        </select>
                      </div>
                      <div>
                        <Lbl>Брой кластри</Lbl>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <input style={inp} type="number" min={0} value={t.cluster_count||''} placeholder={`авт. ${auto}`} onChange={e=>updateTemplate(g.id,t.id,'cluster_count',+e.target.value)} />
                          {t.cluster_count===0 && <span style={{fontSize:10,color:'#F3A2BE',whiteSpace:'nowrap'}}>← авт.</span>}
                        </div>
                      </div>
                    </Row>

                    <Row>
                      <div>
                        <Lbl>Балон в балон (%)</Lbl>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <input style={{...inp,flex:1}} type="number" min={0} max={100} value={t.stuffing_percent} onChange={e=>updateTemplate(g.id,t.id,'stuffing_percent',+e.target.value)} />
                          <span style={{fontSize:13,color:'#81BFB7'}}>%</span>
                        </div>
                      </div>
                      <div>
                        <Lbl>+ Малки 5" балони</Lbl>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <input type="checkbox" checked={t.has_small} onChange={e=>updateTemplate(g.id,t.id,'has_small',e.target.checked)} style={{width:18,height:18,accentColor:'#F3A2BE',cursor:'pointer'}} />
                          {t.has_small && <>
                            <input style={{...inp,flex:1}} type="number" min={1} value={t.small_per_cluster} onChange={e=>updateTemplate(g.id,t.id,'small_per_cluster',+e.target.value)} />
                            <span style={{fontSize:12,color:'#81BFB7'}}>бр/кластър</span>
                          </>}
                        </div>
                      </div>
                      <div>
                        <Lbl>+ Голям 18" балон</Lbl>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <input type="checkbox" checked={t.has_large} onChange={e=>updateTemplate(g.id,t.id,'has_large',e.target.checked)} style={{width:18,height:18,accentColor:'#F3A2BE',cursor:'pointer'}} />
                          {t.has_large && <>
                            <input style={{...inp,flex:1}} type="number" min={1} value={t.large_per_cluster} onChange={e=>updateTemplate(g.id,t.id,'large_per_cluster',+e.target.value)} />
                            <span style={{fontSize:12,color:'#81BFB7'}}>бр/кластър</span>
                          </>}
                        </div>
                      </div>
                    </Row>

                    {/* Автоматично резюме на шаблона */}
                    <div style={{background:'#FFD3DD',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#3a2a35'}}>
                      <strong>{clusters} кластра</strong> × {t.main_per_cluster} бр {t.main_size_inch}"
                      {t.has_small ? ` + ${t.small_per_cluster} бр 5"` : ''}
                      {t.has_large ? ` + ${t.large_per_cluster} бр 18"` : ''}
                      {t.stuffing_percent > 0 ? ` · ${t.stuffing_percent}% балон в балон` : ''}
                      {' → '}
                      <strong>{clusters * t.main_per_cluster} бр {t.main_size_inch}"</strong>
                      {t.has_small ? `, ${clusters * t.small_per_cluster} бр 5"` : ''}
                      {t.has_large ? `, ${clusters * t.large_per_cluster} бр 18"` : ''}
                    </div>
                  </div>
                )
              })}

              <button onClick={()=>addTemplate(g.id)} style={{width:'100%',padding:'10px',background:'linear-gradient(135deg,#C6E6E3,#81BFB7)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13}}>
                + Добави шаблон към {g.name}
              </button>
            </div>
          )
        })}

        <button onClick={addGarland} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',border:'none',borderRadius:12,color:'#fff',fontWeight:800,cursor:'pointer',fontSize:14}}>
          + Добави гирлянд
        </button>
      </div>
    )
  }

  const Tab3 = () => {
    const allSizes = [...new Set(balloonPrices.map(p => p.size_inch))].sort((a,b) => a-b)

    const setColor = (gId, tId, cIdx, field, value) => {
      set('garlands', state.garlands.map(g => g.id!==gId ? g : {
        ...g,
        templates: g.templates.map(t => {
          if (t.id!==tId) return t
          const colors = [...(t.colors||[])]
          while (colors.length <= cIdx) colors.push({name:'', size_inch: t.main_size_inch, clusters:0, stuffing_color:'', stuffing_size_inch:5})
          colors[cIdx] = {...colors[cIdx], [field]: value}
          return {...t, colors}
        })
      }))
    }

    const calcClusters = (lengthCm, sizeInch, perCluster) => {
      const price = balloonPrices.find(p => p.size_inch === sizeInch)
      const diamCm = price?.size_cm || (sizeInch * 2.54)
      const factor = perCluster <= 4 ? 4.8 : 6.3
      return Math.ceil((lengthCm / diamCm) * factor / perCluster)
    }

    // Изчисляваме пълния списък за поръчка
    const shoppingList = {}
    const stuffingList = {}

    state.garlands.forEach(g => {
      g.templates.forEach(t => {
        const clusters = t.cluster_count || calcClusters(g.length_cm, t.main_size_inch, t.main_per_cluster)
        const colors = t.colors || []
        const usedClusters = colors.reduce((s,c) => s + (c.clusters||0), 0)
        const remaining = Math.max(0, clusters - usedClusters)

        colors.forEach((c, ci) => {
          const clCount = c.clusters || (ci===colors.length-1 ? remaining : 0)
          if (!clCount) return
          const key = `${c.name||'Без цвят'}_${t.main_size_inch}`
          if (!shoppingList[key]) shoppingList[key] = {name: c.name||'Без цвят', size: t.main_size_inch, count: 0}
          shoppingList[key].count += clCount * t.main_per_cluster

          // Stuffing
          if (t.stuffing_percent > 0) {
            const stuffCount = Math.ceil(clCount * t.main_per_cluster * t.stuffing_percent / 100)
            const sKey = `${c.stuffing_color||c.name||'Без цвят'}_${t.main_size_inch}_inner`
            if (!stuffingList[sKey]) stuffingList[sKey] = {name: c.stuffing_color||c.name||'Без цвят', size: t.main_size_inch, count: 0}
            stuffingList[sKey].count += stuffCount
          }

          // Малки 5"
          if (t.has_small) {
            const sKey5 = `${c.name||'Без цвят'}_5`
            if (!shoppingList[sKey5]) shoppingList[sKey5] = {name: c.name||'Без цвят', size: 5, count: 0}
            shoppingList[sKey5].count += clCount * t.small_per_cluster
            // Stuffing за 5"
            if (t.stuffing_percent > 0) {
              const stuff5 = Math.ceil(clCount * t.small_per_cluster * t.stuffing_percent / 100)
              const sKey5i = `${c.stuffing_color||c.name||'Без цвят'}_5_inner`
              if (!stuffingList[sKey5i]) stuffingList[sKey5i] = {name: c.stuffing_color||c.name||'Без цвят', size: 5, count: 0}
              stuffingList[sKey5i].count += stuff5
            }
          }

          // Голям 18"
          if (t.has_large) {
            const lKey = `${c.name||'Без цвят'}_18`
            if (!shoppingList[lKey]) shoppingList[lKey] = {name: c.name||'Без цвят', size: 18, count: 0}
            shoppingList[lKey].count += clCount * t.large_per_cluster
          }
        })

        // Ако няма цветове — добавяме без цвят
        if (colors.length === 0) {
          const key = `Без цвят_${t.main_size_inch}`
          if (!shoppingList[key]) shoppingList[key] = {name: 'Без цвят', size: t.main_size_inch, count: 0}
          shoppingList[key].count += clusters * t.main_per_cluster
        }
      })
    })

    const getBuffer = (size) => {
      const f = settings.finances || {}
      if (size <= 6) return (f.defect_buffer_small || 10) / 100
      if (size <= 14) return (f.defect_buffer_medium || 7) / 100
      return (f.defect_buffer_large || 5) / 100
    }

    return (
      <div>
        {state.garlands.length === 0 && (
          <div style={{textAlign:'center',padding:40,color:'#81BFB7',background:'rgba(255,255,255,0.7)',borderRadius:20}}>
            Първо добави гирлянди в Таб 2
          </div>
        )}

        {state.garlands.map(g => (
          <div key={g.id} style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:900,color:'#F3A2BE',marginBottom:16}}>🎈 {g.name} — {g.length_cm} см</div>

            {g.templates.map((t, ti) => {
              const clusters = t.cluster_count || calcClusters(g.length_cm, t.main_size_inch, t.main_per_cluster)
              const colors = t.colors || []
              const usedClusters = colors.reduce((s,c) => s + (c.clusters||0), 0)
              const remaining = clusters - usedClusters

              return (
                <div key={t.id} style={{background:'#F0F9F8',borderRadius:12,padding:14,marginBottom:12,border:'1px solid #C6E6E3'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#81BFB7',marginBottom:12}}>
                    Шаблон {ti+1} — {clusters} кластра × {t.main_per_cluster} бр {t.main_size_inch}"
                    {t.has_small ? ` + ${t.small_per_cluster} бр 5"` : ''}
                    {t.has_large ? ` + ${t.large_per_cluster} бр 18"` : ''}
                  </div>

                  {/* ЦВЕТОВЕ */}
                  {colors.map((c, ci) => (
                    <div key={ci} style={{background:'#fff',borderRadius:10,padding:12,marginBottom:8,border:'1px solid #FFD3DD'}}>
                      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,alignItems:'end',marginBottom: t.stuffing_percent>0?8:0}}>
                        <div>
                          {ci===0 && <div style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Цвят</div>}
                          <input style={inp} placeholder="напр. Rose Gold, White..." value={c.name||''} onChange={e=>setColor(g.id,t.id,ci,'name',e.target.value)} />
                        </div>
                        <div>
                          {ci===0 && <div style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Брой кластри</div>}
                          <input style={inp} type="number" min={0} max={clusters} value={c.clusters||''} placeholder={ci===colors.length-1?`авт. ${remaining}`:''} onChange={e=>setColor(g.id,t.id,ci,'clusters',+e.target.value)} />
                        </div>
                        <div>
                          {ci===0 && <div style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Балони</div>}
                          <div style={{padding:'10px 13px',background:'#FFD3DD',borderRadius:8,fontWeight:700,color:'#3a2a35',fontSize:13}}>
                            {(c.clusters || (ci===colors.length-1?remaining:0)) * t.main_per_cluster} бр
                          </div>
                        </div>
                        <button onClick={()=>{
                          set('garlands', state.garlands.map(gg => gg.id!==g.id ? gg : {
                            ...gg,
                            templates: gg.templates.map(tt => tt.id!==t.id ? tt : {
                              ...tt,
                              colors: (tt.colors||[]).filter((_,i) => i!==ci)
                            })
                          }))
                        }} style={{background:'none',border:'none',color:'#F3A2BE',cursor:'pointer',fontSize:20,paddingBottom:4}}>×</button>
                      </div>

                      {/* STUFFING цвят */}
                      {t.stuffing_percent > 0 && (
                        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8,paddingTop:8,borderTop:'1px dashed #FFD3DD'}}>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>🎈 Вътрешен цвят (stuffing)</div>
                            <input style={inp} placeholder={`= ${c.name||'същия цвят'}`} value={c.stuffing_color||''} onChange={e=>setColor(g.id,t.id,ci,'stuffing_color',e.target.value)} />
                          </div>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Брой за stuffing</div>
                            <div style={{padding:'10px 13px',background:'#FFD3DD',borderRadius:8,fontWeight:700,color:'#3a2a35',fontSize:13}}>
                              {Math.ceil((c.clusters || (ci===colors.length-1?remaining:0)) * t.main_per_cluster * t.stuffing_percent / 100)} бр
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Оставащи кластри */}
                  {remaining > 0 && colors.length > 0 && (
                    <div style={{fontSize:12,color:'#c0392b',fontWeight:700,marginBottom:8}}>
                      ⚠️ Оставащи {remaining} кластра без цвят
                    </div>
                  )}

                  <button onClick={()=>{
                    set('garlands', state.garlands.map(gg => gg.id!==g.id ? gg : {
                      ...gg,
                      templates: gg.templates.map(tt => tt.id!==t.id ? tt : {
                        ...tt,
                        colors: [...(tt.colors||[]), {name:'', clusters:0, stuffing_color:''}]
                      })
                    }))
                  }} style={{width:'100%',padding:'8px',background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:12}}>
                    + Добави цвят
                  </button>
                </div>
              )
            })}
          </div>
        ))}

        {/* СПИСЪК ЗА ПОРЪЧКА */}
        {Object.keys(shoppingList).length > 0 && (
          <div style={{background:'#fff',border:'2px solid #81BFB7',borderRadius:16,padding:20,marginTop:8}}>
            <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #C6E6E3'}}>
              🛒 Списък за поръчка
            </div>

            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:8,marginBottom:8}}>
              {['Цвят','Размер','Основни','+ Буфер','ПОРЪЧАЙ'].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1}}>{h}</div>
              ))}
            </div>

            {Object.values(shoppingList).map((item,i) => {
              const buf = getBuffer(item.size)
              const withBuf = Math.ceil(item.count * (1 + buf))
              return (
                <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:8,padding:'8px 0',borderBottom:'1px solid #F0F9F8',alignItems:'center'}}>
                  <div style={{fontWeight:600,color:'#3a2a35',fontSize:13}}>{item.name}</div>
                  <div style={{fontSize:13,color:'#81BFB7'}}>{item.size}"</div>
                  <div style={{fontWeight:700,color:'#3a2a35'}}>{item.count} бр</div>
                  <div style={{fontSize:12,color:'#F3A2BE'}}>+{Math.ceil(item.count*buf)} бр ({Math.round(buf*100)}%)</div>
                  <div style={{fontWeight:900,color:'#fff',background:'#81BFB7',borderRadius:8,padding:'4px 10px',textAlign:'center'}}>{withBuf} бр</div>
                </div>
              )
            })}

            {/* STUFFING СПИСЪК */}
            {Object.keys(stuffingList).length > 0 && (
              <div style={{marginTop:16,paddingTop:16,borderTop:'2px dashed #FFD3DD'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>
                  🎈 Допълнителни за Stuffing (балон в балон)
                </div>
                {Object.values(stuffingList).map((item,i) => (
                  <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,padding:'6px 0',borderBottom:'1px solid #F0F9F8',fontSize:13}}>
                    <div style={{fontWeight:600,color:'#3a2a35'}}>{item.name} (вътрешен)</div>
                    <div style={{color:'#81BFB7'}}>{item.size}"</div>
                    <div style={{fontWeight:700,color:'#F3A2BE'}}>{item.count} бр</div>
                  </div>
                ))}
              </div>
            )}

            {/* ОБЩО */}
            <div style={{marginTop:16,padding:'12px 16px',background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontWeight:700,color:'#fff',fontSize:14}}>ОБЩО ЗА ПОРЪЧКА</span>
              <span style={{fontWeight:900,color:'#fff',fontSize:18}}>
                {Object.values(shoppingList).reduce((s,i) => s + Math.ceil(i.count*(1+getBuffer(i.size))), 0) +
                 Object.values(stuffingList).reduce((s,i) => s + i.count, 0)} бр
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
 
  const Tab4 = () => {
    const TYPES = [
      { id:'sign', label:'🖊️ Надпис' },
      { id:'flowers', label:'🌸 Цветя' },
      { id:'toy', label:'🧸 Плюшена играчка' },
      { id:'figure', label:'🎭 Фигура' },
      { id:'neon', label:'💡 Неон' },
      { id:'number', label:'🔢 Цифра' },
      { id:'cloud', label:'☁️ Облак' },
      { id:'other', label:'✨ Друго' },
    ]

    const addExtra = () => {
      set('extras', [...(state.extras||[]), {
        id: Date.now(),
        type: 'sign',
        description: '',
        material_cost: 0,
        rental_cost: 0,
        prep_at_home: false,
        prep_home_min: 0,
        prep_at_location: false,
        prep_location_min: 0,
        placement_min: 0,
      }])
    }

    const updateExtra = (id, field, value) => {
      set('extras', (state.extras||[]).map(e => e.id===id ? {...e,[field]:value} : e))
    }

    const removeExtra = (id) => {
      set('extras', (state.extras||[]).filter(e => e.id!==id))
    }

    const totalMaterial = (state.extras||[]).reduce((s,e) => s + (+e.material_cost||0) + (+e.rental_cost||0), 0)
    const totalTime = (state.extras||[]).reduce((s,e) => s + (+e.prep_home_min||0) + (+e.prep_location_min||0) + (+e.placement_min||0), 0)

    return (
      <div>
        {(state.extras||[]).length === 0 && (
          <div style={{textAlign:'center',padding:40,color:'#81BFB7',background:'rgba(255,255,255,0.7)',borderRadius:20,marginBottom:16}}>
            Няма допълнения — добави!
          </div>
        )}

        {(state.extras||[]).map((e, ei) => (
          <div key={e.id} style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{display:'flex',gap:10,alignItems:'center',flex:1,flexWrap:'wrap'}}>
                <select style={{...inp,maxWidth:180,fontWeight:700}} value={e.type} onChange={ev=>updateExtra(e.id,'type',ev.target.value)}>
                  {TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <input style={{...inp,flex:1,minWidth:200}} placeholder="Описание (напр. Еднорог голям, Надпис с ime...)" value={e.description} onChange={ev=>updateExtra(e.id,'description',ev.target.value)} />
              </div>
              <button onClick={()=>removeExtra(e.id)} style={{background:'#FFD3DD',border:'none',borderRadius:8,color:'#c0392b',cursor:'pointer',fontWeight:700,padding:'6px 12px',marginLeft:8}}>🗑️</button>
            </div>

            {/* РАЗХОДИ */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>💰 Материал (€)</div>
                <input style={inp} type="number" min={0} step={0.5} value={e.material_cost||0} onChange={ev=>updateExtra(e.id,'material_cost',+ev.target.value)} />
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>🔑 Наем (€)</div>
                <input style={inp} type="number" min={0} step={0.5} value={e.rental_cost||0} onChange={ev=>updateExtra(e.id,'rental_cost',+ev.target.value)} />
              </div>
            </div>

            {/* ИЗРАБОТКА */}
            <div style={{background:'#F0F9F8',borderRadius:10,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>⏱️ Изработка</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{background:'#fff',borderRadius:8,padding:10,border:`1px solid ${e.prep_at_home?'#F3A2BE':'#C6E6E3'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <input type="checkbox" checked={e.prep_at_home} onChange={ev=>updateExtra(e.id,'prep_at_home',ev.target.checked)} style={{width:16,height:16,accentColor:'#F3A2BE',cursor:'pointer'}} />
                    <span style={{fontSize:12,fontWeight:700,color:e.prep_at_home?'#F3A2BE':'#81BFB7'}}>🏠 Вкъщи</span>
                  </div>
                  {e.prep_at_home && (
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <input style={{...inp,flex:1}} type="number" min={0} value={e.prep_home_min||0} onChange={ev=>updateExtra(e.id,'prep_home_min',+ev.target.value)} />
                      <span style={{fontSize:12,color:'#81BFB7'}}>мин</span>
                    </div>
                  )}
                </div>
                <div style={{background:'#fff',borderRadius:8,padding:10,border:`1px solid ${e.prep_at_location?'#F3A2BE':'#C6E6E3'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <input type="checkbox" checked={e.prep_at_location} onChange={ev=>updateExtra(e.id,'prep_at_location',ev.target.checked)} style={{width:16,height:16,accentColor:'#F3A2BE',cursor:'pointer'}} />
                    <span style={{fontSize:12,fontWeight:700,color:e.prep_at_location?'#F3A2BE':'#81BFB7'}}>📍 На локация</span>
                  </div>
                  {e.prep_at_location && (
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <input style={{...inp,flex:1}} type="number" min={0} value={e.prep_location_min||0} onChange={ev=>updateExtra(e.id,'prep_location_min',+ev.target.value)} />
                      <span style={{fontSize:12,color:'#81BFB7'}}>мин</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ПОСТАВЯНЕ */}
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1}}>📍 Поставяне на локация</div>
              <input style={{...inp,maxWidth:80}} type="number" min={0} value={e.placement_min||0} onChange={ev=>updateExtra(e.id,'placement_min',+ev.target.value)} />
              <span style={{fontSize:12,color:'#81BFB7'}}>мин</span>
            </div>
          </div>
        ))}

        <button onClick={addExtra} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',border:'none',borderRadius:12,color:'#fff',fontWeight:800,cursor:'pointer',fontSize:14,marginBottom:16}}>
          + Добави допълнение
        </button>

        {/* РЕЗЮМЕ */}
        {(state.extras||[]).length > 0 && (
          <div style={{background:'#fff',border:'2px solid #81BFB7',borderRadius:16,padding:20}}>
            <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>📊 Резюме на допълненията</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div style={{textAlign:'center',padding:12,background:'#F0F9F8',borderRadius:10}}>
                <div style={{fontSize:10,color:'#81BFB7',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>Разходи</div>
                <div style={{fontSize:20,fontWeight:900,color:'#F3A2BE'}}>€{totalMaterial.toFixed(2)}</div>
              </div>
              <div style={{textAlign:'center',padding:12,background:'#F0F9F8',borderRadius:10}}>
                <div style={{fontSize:10,color:'#81BFB7',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>Общо време</div>
                <div style={{fontSize:20,fontWeight:900,color:'#81BFB7'}}>{totalTime} мин</div>
              </div>
              <div style={{textAlign:'center',padding:12,background:'#F0F9F8',borderRadius:10}}>
                <div style={{fontSize:10,color:'#81BFB7',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>Брой допълнения</div>
                <div style={{fontSize:20,fontWeight:900,color:'#3a2a35'}}>{(state.extras||[]).length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const Tab5 = () => {
    const t = settings.times || {}
    const f = settings.finances || {}

    // Надуване — изчисляваме по размер на балоните
    const INFLATE_SEC = { 5: 8, 10: 22, 11: 24, 12: 26, 16: 35, 18: 40, 24: 55, 36: 80 }

    const calcClusters = (lengthCm, sizeInch, perCluster) => {
      const price = balloonPrices.find(p => p.size_inch === sizeInch)
      const diamCm = price?.size_cm || (sizeInch * 2.54)
      const factor = perCluster <= 4 ? 4.8 : 6.3
      return Math.ceil((lengthCm / diamCm) * factor / perCluster)
    }

    // Изчисляваме всички балони
    let totalBalloons = { main: {}, small: 0, large: 0 }
    let totalClusters = 0
    let totalStuffing = 0

    state.garlands.forEach(g => {
      g.templates.forEach(t2 => {
        const clusters = t2.cluster_count || calcClusters(g.length_cm, t2.main_size_inch, t2.main_per_cluster)
        totalClusters += clusters
        const mainCount = clusters * t2.main_per_cluster
        totalBalloons.main[t2.main_size_inch] = (totalBalloons.main[t2.main_size_inch]||0) + mainCount
        if (t2.has_small) totalBalloons.small += clusters * t2.small_per_cluster
        if (t2.has_large) totalBalloons.large += clusters * t2.large_per_cluster
        if (t2.stuffing_percent > 0) {
          totalStuffing += Math.ceil(mainCount * t2.stuffing_percent / 100)
          if (t2.has_small) totalStuffing += Math.ceil(clusters * t2.small_per_cluster * t2.stuffing_percent / 100)
        }
      })
    })

    // Надуване секунди
    let inflateSecMain = Object.entries(totalBalloons.main).reduce((s,[size,count]) => s + count * (INFLATE_SEC[+size]||22), 0)
    let inflateSecSmall = totalBalloons.small * (INFLATE_SEC[5]||8)
    let inflateSecLarge = totalBalloons.large * (INFLATE_SEC[18]||40)
    let totalInflateSec = inflateSecMain + inflateSecSmall + inflateSecLarge
    let totalInflateMin = Math.ceil(totalInflateSec / 60)

    // Stuffing секунди
    let stuffingMin = Math.ceil(totalStuffing * (t.stuffing_sec_per_balloon||20) / 60)

    // Сглобяване кластри
    let clusterAssemblyMin = Math.ceil(totalClusters * (t.cluster_assembly_sec||45) / 60)

    // Закачане кластри на локация
    let clusterAttachMin = Math.ceil(totalClusters * (t.cluster_attachment_sec||45) / 60)

    // Допълнения
    let extrasHomeMin = (state.extras||[]).reduce((s,e) => s + (e.prep_at_home ? (+e.prep_home_min||0) : 0), 0)
    let extrasLocationMin = (state.extras||[]).reduce((s,e) => {
      let total = 0
      if (e.prep_at_location) total += (+e.prep_location_min||0)
      total += (+e.placement_min||0)
      return s + total
    }, 0)
    let extrasSignsMin = (state.extras||[]).filter(e=>e.prep_at_home).reduce((s,e) => s + (+e.prep_home_min||0), 0)

    // ВКЪЩИ
    const homeRows = [
      { label:'📞 Комуникация', min: (+t.consultation_min||0) + (+t.followup_min||0), rate: f.rate_consultation||8 },
      { label:'📋 Подготовка поръчка', min: (+t.stock_check_min||0) + (+t.order_min||0) + (+t.delivery_receive_min||0), rate: f.rate_preparation||8 },
      { label:'🔀 Сортиране балони', min: t.sorting_min||10, rate: f.rate_inflation||10 },
      { label:'✍️ Изработка допълнения', min: extrasHomeMin, rate: f.rate_preparation||8 },
      { label:'🎈 Stuffing (балон в балон)', min: stuffingMin, rate: f.rate_inflation||10 },
      { label:'💨 Надуване', min: totalInflateMin, rate: f.rate_inflation||10 },
      { label:'🔗 Сглобяване кластри', min: clusterAssemblyMin, rate: f.rate_inflation||10 },
      { label:'📦 Зареждане на кола', min: t.car_loading_min||15, rate: f.rate_installation||12 },
    ].filter(r => r.min > 0)

    // НА ЛОКАЦИЯ
    const locationRows = [
      { label:'📦 Разопаковане', min: t.unpacking_min||15, rate: f.rate_installation||12 },
      { label:'🏛️ Подготовка пространство', min: t.space_prep_min||10, rate: f.rate_installation||12 },
      { label:'🏗️ Сглобяване арка', min: t.arch_assembly_min||15, rate: f.rate_installation||12 },
      { label:'🎀 Поставяне покривало', min: t.cover_placement_min||5, rate: f.rate_installation||12 },
      { label:'📍 Закачане кластри', min: clusterAttachMin, rate: f.rate_installation||12 },
      { label:'✨ Допълнения на локация', min: extrasLocationMin, rate: f.rate_installation||12 },
      { label:'🔧 Финални корекции', min: t.final_corrections_min||10, rate: f.rate_installation||12 },
      { label:'📸 Снимки', min: t.photo_time_min||10, rate: f.rate_installation||12 },
    ].filter(r => r.min > 0)

    const calcCost = (min, rate) => (min / 60) * rate

    const homeTotalMin = homeRows.reduce((s,r) => s + r.min, 0)
    const homeTotalCost = homeRows.reduce((s,r) => s + calcCost(r.min, r.rate), 0)
    const locationTotalMin = locationRows.reduce((s,r) => s + r.min, 0)
    const locationTotalCost = locationRows.reduce((s,r) => s + calcCost(r.min, r.rate), 0)

    const dismantlePercent = (t.dismantling_percent||50) / 100
    const dismantleMin = Math.ceil(locationTotalMin * dismantlePercent)
    const dismantleCost = (dismantleMin / 60) * (f.rate_dismantling||10)

    const grandTotalMin = homeTotalMin + locationTotalMin + dismantleMin
    const grandTotalCost = homeTotalCost + locationTotalCost + dismantleCost

    const LaborRow = ({row}) => (
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,padding:'8px 0',borderBottom:'1px solid #F0F9F8',fontSize:13,alignItems:'center'}}>
        <div style={{color:'#3a2a35'}}>{row.label}</div>
        <div style={{color:'#81BFB7',textAlign:'right'}}>{row.min} мин</div>
        <div style={{fontWeight:700,color:'#F3A2BE',textAlign:'right'}}>€{calcCost(row.min,row.rate).toFixed(2)}</div>
      </div>
    )

    const TotalRow = ({label, min, cost, color='#F3A2BE'}) => (
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,padding:'10px 12px',background:'#F0F9F8',borderRadius:8,fontSize:14,fontWeight:700,marginTop:8}}>
        <div style={{color:'#3a2a35'}}>{label}</div>
        <div style={{color:'#81BFB7',textAlign:'right'}}>{min} мин</div>
        <div style={{color,textAlign:'right'}}>€{cost.toFixed(2)}</div>
      </div>
    )

    return (
      <div>
        {/* ВКЪЩИ */}
        <div style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:900,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #FFD3DD'}}>
            🏠 Подготовка вкъщи / студио
          </div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,marginBottom:8}}>
            {['Дейност','Времe','Разход'].map(h=>(
              <div key={h} style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,textAlign:h==='Дейност'?'left':'right'}}>{h}</div>
            ))}
          </div>
          {homeRows.map((r,i) => <LaborRow key={i} row={r} />)}
          <TotalRow label="Общо вкъщи" min={homeTotalMin} cost={homeTotalCost} />
        </div>

        {/* НА ЛОКАЦИЯ */}
        <div style={{background:'#fff',border:'2px solid #C6E6E3',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #C6E6E3'}}>
            📍 На локация — монтаж
          </div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,marginBottom:8}}>
            {['Дейност','Времe','Разход'].map(h=>(
              <div key={h} style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,textAlign:h==='Дейност'?'left':'right'}}>{h}</div>
            ))}
          </div>
          {locationRows.map((r,i) => <LaborRow key={i} row={r} />)}
          <TotalRow label="Общо монтаж" min={locationTotalMin} cost={locationTotalCost} color='#81BFB7' />
        </div>

        {/* ДЕМОНТАЖ */}
        <div style={{background:'#fff',border:'2px solid #C6E6E3',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12,paddingBottom:8,borderBottom:'2px solid #C6E6E3'}}>
            📦 Демонтаж ({t.dismantling_percent||50}% от монтажа)
          </div>
          <TotalRow label="Демонтаж" min={dismantleMin} cost={dismantleCost} color='#81BFB7' />
        </div>

        {/* ОБЩО */}
        <div style={{background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',borderRadius:16,padding:20}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8}}>
            <div style={{fontSize:14,fontWeight:900,color:'#fff'}}>ОБЩО ТРУД</div>
            <div style={{fontSize:16,fontWeight:900,color:'#fff',textAlign:'right'}}>{grandTotalMin} мин</div>
            <div style={{fontSize:20,fontWeight:900,color:'#fff',textAlign:'right'}}>€{grandTotalCost.toFixed(2)}</div>
          </div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',marginTop:4}}>
            {Math.floor(grandTotalMin/60)}ч {grandTotalMin%60}мин общо
          </div>
        </div>
      </div>
    )
  }

  const renderTab = () => {
    if (step === 1) return Tab1()
    if (step === 2) return Tab2()
    if (step === 3) return Tab3()
    if (step === 4) return Tab4()
    if (step === 5) return Tab5()
    return <div style={{textAlign:'center',padding:60,color:'#81BFB7'}}>🚧 Скоро...</div>
  }

  return (
    <div style={{padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif'}}>

      {/* ХЕДЪР */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{padding:'8px 16px',background:'rgba(255,255,255,0.8)',border:'1px solid #C6E6E3',borderRadius:12,color:'#81BFB7',fontWeight:700,cursor:'pointer'}}>← Табло</button>
        <h1 style={{color:'#3a2a35',margin:0,fontSize:22,fontWeight:900}}>🧮 Калкулатор</h1>
        {inquiry && <span style={{fontSize:12,color:'#F3A2BE',background:'#FFD3DD',padding:'4px 12px',borderRadius:20,fontWeight:700}}>📝 {inquiry.client_name}</span>}
      </div>

      {/* ТАБОВЕ */}
      <div style={{display:'flex',gap:6,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setStep(t.id)} style={{
            padding:'8px 14px', borderRadius:12, border:'none', cursor:'pointer',
            fontWeight:700, fontSize:12, whiteSpace:'nowrap',
            background: step===t.id ? '#F3A2BE' : 'rgba(255,255,255,0.8)',
            color: step===t.id ? '#fff' : '#81BFB7',
            opacity: t.id > 2 ? 0.5 : 1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* СЪДЪРЖАНИЕ */}
      <div style={{background:'rgba(255,255,255,0.6)',borderRadius:20,padding:24,border:'1px solid rgba(243,162,190,0.2)'}}>
        {renderTab()}
      </div>

      {/* НАВИГАЦИЯ */}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
        <button onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1} style={{padding:'12px 24px',borderRadius:12,border:'none',background:step===1?'rgba(255,255,255,0.4)':'#FFD3DD',color:step===1?'#bbb':'#3a2a35',fontWeight:700,cursor:step===1?'default':'pointer'}}>
          ← Назад
        </button>
        <span style={{fontSize:12,color:'#81BFB7',alignSelf:'center'}}>{step} / {TABS.length}</span>
        <button onClick={()=>setStep(s=>Math.min(TABS.length,s+1))} disabled={step===TABS.length} style={{padding:'12px 24px',borderRadius:12,border:'none',background:step===TABS.length?'rgba(255,255,255,0.4)':'#F3A2BE',color:step===TABS.length?'#bbb':'#fff',fontWeight:700,cursor:step===TABS.length?'default':'pointer'}}>
          Напред →
        </button>
      </div>
    </div>
  )
}