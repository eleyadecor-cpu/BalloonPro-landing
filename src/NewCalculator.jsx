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
  // Таб 6
  dismantle_same_day: true,
  dismantle_date: '',
  dismantle_time: '',
  // Таб 7 — Транспорт
  travel_km: 0,
  travel_min: 0,
  // Таб 8 — наем
  rentals: [],
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
  const [showOfferPopup, setShowOfferPopup] = useState(false)
  const [offerForm, setOfferForm] = useState({
    client_id: '',
    client_name_manual: '',
    client_phone_manual: '',
    deposit: 0,
    deposit_due_date: '',
    valid_until: '',
    notes: '',
    visual_files: [null, null, null],
    visual_previews: [null, null, null],
  })
  const [clients, setClients] = useState([])
  const [savingOffer, setSavingOffer] = useState(false)
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
    const { data: clientsData } = await supabase.from('clients').select('id,name,phone').order('name')
    setClients(clientsData || [])
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
        
        {/* ДЕМОНТАЖ */}
        <div style={{marginTop:12,padding:12,background:'#F0F9F8',borderRadius:10,border:'1px solid #C6E6E3'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>📦 Демонтаж</div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button onClick={()=>set('dismantle_same_day',true)} style={{flex:1,padding:'8px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:state.dismantle_same_day?'#F3A2BE':'#fff',color:state.dismantle_same_day?'#fff':'#81BFB7'}}>
              Същия ден (след крайния час)
            </button>
            <button onClick={()=>set('dismantle_same_day',false)} style={{flex:1,padding:'8px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:!state.dismantle_same_day?'#F3A2BE':'#fff',color:!state.dismantle_same_day?'#fff':'#81BFB7'}}>
              Друг ден / час
            </button>
          </div>
          {!state.dismantle_same_day && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <Lbl>Дата демонтаж</Lbl>
                <input style={inp} placeholder="дд.мм.гггг" maxLength={10} value={state.dismantle_date||''} onChange={e=>{
                  let v = e.target.value.replace(/[^0-9.]/g,'')
                  if (v.length===2 && !v.includes('.')) v+='.'
                  if (v.length===5 && v.split('.').length===2) v+='.'
                  set('dismantle_date',v)
                }} />
              </div>
              <div>
                <Lbl>Час демонтаж</Lbl>
                <input style={inp} placeholder="чч:мм" maxLength={5} value={state.dismantle_time||''} onChange={e=>{
                  let v = e.target.value.replace(/[^0-9:]/g,'')
                  if (v.length===2 && !v.includes(':')) v+=':'
                  set('dismantle_time',v)
                }} />
              </div>
            </div>
          )}
        </div>
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
          inflate_location: 'home',
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

    // Общо кластри за целия гирлянд
    const totalGarlandClusters = (g) => {
      if (g.templates.length === 0) return 0
      const firstTemplate = g.templates[0]
      return firstTemplate.cluster_count || calcClusters(g.length_cm, firstTemplate.main_size_inch, firstTemplate.main_per_cluster)
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
                const totalClusters = totalGarlandClusters(g)
                const usedByPrev = g.templates.slice(0, ti).reduce((s, prev) => {
                  return s + (prev.cluster_count || calcClusters(g.length_cm, prev.main_size_inch, prev.main_per_cluster))
                }, 0)
                const autoRemaining = Math.max(0, totalClusters - usedByPrev)
                const auto = ti === 0 ? totalClusters : autoRemaining
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
                        <div style={{display:'flex',gap:6,alignItems:'center',flexDirection:'column'}}>
                          <div style={{display:'flex',gap:6,alignItems:'center',width:'100%'}}>
                            <input style={inp} type="number" min={0} value={t.cluster_count||''} placeholder={`авт. ${auto}`} onChange={e=>updateTemplate(g.id,t.id,'cluster_count',+e.target.value)} />
                            {!t.cluster_count && <span style={{fontSize:10,color:'#F3A2BE',whiteSpace:'nowrap'}}>← авт.</span>}
                          </div>
                          {g.templates.length > 1 && (
                            <div style={{fontSize:10,color:'#81BFB7',width:'100%'}}>
                              Общо гирлянд: {totalClusters} кластра
                              {ti > 0 && ` · Използвани: ${usedByPrev}`}
                            </div>
                          )}
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

                     {/* НАДУВАНЕ */}
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginRight:4}}>💨 Надуване:</div>
                      <button onClick={()=>updateTemplate(g.id,t.id,'inflate_location','home')} style={{padding:'6px 14px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:(t.inflate_location||'home')==='home'?'#F3A2BE':'#f0f0f0',color:(t.inflate_location||'home')==='home'?'#fff':'#81BFB7'}}>
                        🏠 Предварително
                      </button>
                      <button onClick={()=>updateTemplate(g.id,t.id,'inflate_location','site')} style={{padding:'6px 14px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:t.inflate_location==='site'?'#81BFB7':'#f0f0f0',color:t.inflate_location==='site'?'#fff':'#81BFB7'}}>
                        📍 На локация
                      </button>
                    </div> 

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

  const Tab6 = () => {
    const t = settings.times || {}

    const calcClusters = (lengthCm, sizeInch, perCluster) => {
      const price = balloonPrices.find(p => p.size_inch === sizeInch)
      const diamCm = price?.size_cm || (sizeInch * 2.54)
      const factor = perCluster <= 4 ? 4.8 : 6.3
      return Math.ceil((lengthCm / diamCm) * factor / perCluster)
    }

    const subMins = (time, m) => {
      if (!time) return ''
      const [h, min] = time.split(':').map(Number)
      let total = h * 60 + min - m
      total = ((total % 1440) + 1440) % 1440
      return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
    }

    const INFLATE_SEC = { 5:8, 10:22, 11:24, 12:26, 16:35, 18:40, 24:55, 36:80 }
    let totalClusters = 0
    let totalInflateHomeMin = 0
    let totalInflateSiteMin = 0
    let totalStuffingMin = 0
    let totalClusterAssemblyMin = 0

    state.garlands.forEach(g => {
      g.templates.forEach(t2 => {
        const clusters = t2.cluster_count || calcClusters(g.length_cm, t2.main_size_inch, t2.main_per_cluster)
        totalClusters += clusters
        const mainCount = clusters * t2.main_per_cluster
        const smallCount = t2.has_small ? clusters * t2.small_per_cluster : 0
        const largeCount = t2.has_large ? clusters * t2.large_per_cluster : 0
        const inflMin = Math.ceil((mainCount * (INFLATE_SEC[t2.main_size_inch]||22) + smallCount * 8 + largeCount * 40) / 60)
        if (t2.inflate_location === 'site') {
          totalInflateSiteMin += inflMin
        } else {
          totalInflateHomeMin += inflMin
        }
        if (t2.stuffing_percent > 0) {
          totalStuffingMin += Math.ceil((mainCount + smallCount) * t2.stuffing_percent / 100 * (t.stuffing_sec_per_balloon||20) / 60)
        }
        totalClusterAssemblyMin += Math.ceil(clusters * (t.cluster_assembly_sec||45) / 60)
      })
    })
    const totalInflateMin = totalInflateHomeMin + totalInflateSiteMin

    const extrasHomeMin = (state.extras||[]).reduce((s,e) => s + (e.prep_at_home ? (+e.prep_home_min||0) : 0), 0)
    const extrasLocationMin = (state.extras||[]).reduce((s,e) => {
      let total = 0
      if (e.prep_at_location) total += (+e.prep_location_min||0)
      total += (+e.placement_min||0)
      return s + total
    }, 0)
    const clusterAttachMin = Math.ceil(totalClusters * (t.cluster_attachment_sec||45) / 60)
    const locationTotalMin = (t.unpacking_min||15) + (t.space_prep_min||10) + (t.arch_assembly_min||15) + (t.cover_placement_min||5) + clusterAttachMin + extrasLocationMin + (t.final_corrections_min||10) + (t.photo_time_min||10)
    const dismantleMin = Math.ceil(locationTotalMin * ((t.dismantling_percent||50) / 100))
    const bufferFinish = t.buffer_finish_min || 10
    const bufferBefore = t.buffer_before_min || 15

    const buildSetupTL = () => {
      if (!state.event_start) return []
      const eventTime = state.event_start.slice(0,5)
      const readyTime = subMins(eventTime, bufferFinish)
      const steps = []
      if (t.photo_time_min > 0) steps.push({ label:'📸 Снимки', mins: t.photo_time_min||10, note:`${t.photo_time_min||10} мин` })
      if (extrasLocationMin > 0) steps.push({ label:'✨ Допълнения', mins: extrasLocationMin, note:`${extrasLocationMin} мин` })
      steps.push({ label:'🔧 Финални корекции', mins: t.final_corrections_min||10, note:`${t.final_corrections_min||10} мин` })
      steps.push({ label:'📍 Закачане кластри', mins: clusterAttachMin, note:`${totalClusters} кластра · ${clusterAttachMin} мин` })
      steps.push({ label:'🏗️ Сглобяване арка', mins: t.arch_assembly_min||15, note:`${t.arch_assembly_min||15} мин` })
      steps.push({ label:'📦 Разопаковане', mins: (t.unpacking_min||15) + (t.space_prep_min||10), note:`${(t.unpacking_min||15)+(t.space_prep_min||10)} мин` })
      if (state.travel_min > 0) steps.push({ label:'🚗 Пристигане', mins: +state.travel_min, note:`${state.travel_km||0} км · ${state.travel_min} мин` })
      if (totalInflateSiteMin > 0) steps.push({ label:'🎈 Надуване на локация', mins: totalInflateSiteMin, note:`${totalInflateSiteMin} мин` })
      if (totalInflateHomeMin > 0) steps.push({ label:'🎈 Надуване (предварително)', mins: totalInflateHomeMin + totalStuffingMin + totalClusterAssemblyMin, note:`надуване ${totalInflateHomeMin} мин · сглобяване ${totalClusterAssemblyMin} мин` })
      if (extrasHomeMin > 0) steps.push({ label:'✍️ Изработка вкъщи', mins: extrasHomeMin, note:`${extrasHomeMin} мин` })
      if (state.travel_min > 0 || bufferBefore > 0) steps.push({ label:'🚗 Тръгни', mins: (+state.travel_min||0) + bufferBefore, note:`пътуване + ${bufferBefore} мин резерв` })

      const rows = []
      let cur = readyTime
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].mins > 0) cur = subMins(cur, steps[i].mins)
        rows.push({ time: cur, label: steps[i].label, note: steps[i].note })
      }
      rows.reverse()
      if (bufferFinish > 0) rows.push({ time: readyTime, label:`✅ Готово (${bufferFinish} мин резерв)`, note:'' })
      rows.push({ time: eventTime, label:'🎉 Събитието започва', note:'', isEvent: true })
      return rows
    }

    const buildDismTL = () => {
      const dismTime = state.dismantle_same_day
        ? state.event_end?.slice(0,5)
        : state.dismantle_time?.slice(0,5)
      if (!dismTime) return []

      const dismSteps = []
      dismSteps.push({ label:'📍 Демонтаж', mins: dismantleMin, note:`${t.dismantling_percent||50}% от монтажа · ${dismantleMin} мин` })
      if (state.travel_min > 0) dismSteps.push({ label:'🚗 Пристигане', mins: +state.travel_min, note:`${state.travel_km||0} км` })
      if (state.travel_min > 0 || bufferBefore > 0) dismSteps.push({ label:'🚗 Тръгни', mins: (+state.travel_min||0) + bufferBefore, note:`+ ${bufferBefore} мин резерв` })

      const rows = []
      let cur = dismTime
      for (let i = 0; i < dismSteps.length; i++) {
        if (dismSteps[i].mins > 0) cur = subMins(cur, dismSteps[i].mins)
        rows.push({ time: cur, label: dismSteps[i].label, note: dismSteps[i].note })
      }
      rows.reverse()
      rows.push({ time: dismTime, label:'✅ Демонтаж завършен', note:'', isEvent: true })
      return rows
    }

    const setupTL = buildSetupTL()
    const dismTL = buildDismTL()

    const TLRow = ({row}) => (
      <div style={{display:'flex',gap:12,alignItems:'flex-start',paddingBottom:10,marginBottom:10,borderBottom:`1px solid ${row.isEvent?'transparent':'#F0F9F8'}`}}>
        <div style={{minWidth:58,padding:'5px 8px',background:row.isEvent?'#F3A2BE':'#fff',color:row.isEvent?'#fff':'#81BFB7',border:`1.5px solid ${row.isEvent?'#F3A2BE':'#C6E6E3'}`,fontSize:13,fontWeight:700,textAlign:'center',borderRadius:8,flexShrink:0}}>
          {row.time}
        </div>
        <div>
          <div style={{fontWeight:700,color:row.isEvent?'#F3A2BE':'#3a2a35',fontSize:13}}>{row.label}</div>
          {row.note && <div style={{fontSize:11,color:'#81BFB7',marginTop:2}}>{row.note}</div>}
        </div>
      </div>
    )

    return (
      <div>
        {!state.event_start && (
          <div style={{textAlign:'center',padding:40,color:'#81BFB7',background:'rgba(255,255,255,0.7)',borderRadius:20,marginBottom:16}}>
            ⚠️ Въведи начален час в Таб 1 за да видиш Timeline
          </div>
        )}
        {setupTL.length > 0 && (
          <div style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:900,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #FFD3DD'}}>
              📅 Timeline — Монтаж {state.location ? `· ${state.location}` : ''}
            </div>
            {setupTL.map((row,i) => <TLRow key={i} row={row} />)}
          </div>
        )}
        {dismTL.length > 0 && (
          <div style={{background:'#fff',border:'2px solid #C6E6E3',borderRadius:16,padding:20}}>
            <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #C6E6E3'}}>
              📦 Timeline — Демонтаж
            </div>
            {dismTL.map((row,i) => <TLRow key={i} row={row} />)}
          </div>
        )}
        {!state.event_end && state.event_start && (
          <div style={{textAlign:'center',padding:20,color:'#81BFB7',background:'rgba(255,255,255,0.7)',borderRadius:12,marginTop:16,fontSize:13}}>
            💡 Въведи краен час в Таб 1 за да видиш Timeline за демонтаж
          </div>
        )}
      </div>
    )
  }
  const Tab7 = () => {
    const f = settings.finances || {}

    const fuelCost = (state.travel_km||0) * 2 * ((f.fuel_per_100km||8) / 100) * (f.fuel_price_per_liter||2.65)
    const amortCost = (state.travel_km||0) * 2 * (f.amort_per_km||0.35)
    const totalTransport = fuelCost + amortCost

    return (
      <div>
        <div style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:900,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #FFD3DD'}}>
            🚗 Локация и транспорт
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Адрес / Локация</div>
            <input style={inp} placeholder="напр. Зала Кристал, Казанлък..." value={state.location||''} onChange={e=>set('location',e.target.value)} />
            <div style={{fontSize:11,color:'#81BFB7',marginTop:4}}>💡 Въведи адреса ръчно и после попълни км и мин</div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Разстояние (км)</div>
              <input style={inp} type="number" min={0} step={0.5} value={state.travel_km||0} onChange={e=>set('travel_km',+e.target.value)} />
              <div style={{fontSize:11,color:'#81BFB7',marginTop:4}}>Само отиване — връщането се изчислява автоматично (×2)</div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Пътуване (мин)</div>
              <input style={inp} type="number" min={0} step={1} value={state.travel_min||0} onChange={e=>set('travel_min',+e.target.value)} />
              <div style={{fontSize:11,color:'#81BFB7',marginTop:4}}>Само отиване</div>
            </div>
          </div>
        </div>

        {/* РАЗХОДИ */}
        <div style={{background:'#fff',border:'2px solid #C6E6E3',borderRadius:16,padding:20}}>
          <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #C6E6E3'}}>
            💰 Транспортни разходи
          </div>

          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8,marginBottom:8}}>
            {['Разход','Сума'].map(h=>(
              <div key={h} style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,textAlign:h==='Сума'?'right':'left'}}>{h}</div>
            ))}
          </div>

          {[
            [`⛽ Гориво (${(state.travel_km||0)*2} км × €${((f.fuel_per_100km||8)/100*f.fuel_price_per_liter||0).toFixed(3)}/км)`, fuelCost],
            [`🔧 Амортизация (${(state.travel_km||0)*2} км × €${f.amort_per_km||0.35}/км)`, amortCost],
          ].map(([label, value], i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8,padding:'8px 0',borderBottom:'1px solid #F0F9F8',fontSize:13}}>
              <div style={{color:'#3a2a35'}}>{label}</div>
              <div style={{fontWeight:700,color:'#F3A2BE',textAlign:'right'}}>€{value.toFixed(2)}</div>
            </div>
          ))}

          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8,padding:'12px 16px',background:'linear-gradient(135deg,#C6E6E3,#81BFB7)',borderRadius:10,marginTop:10}}>
            <div style={{fontWeight:700,color:'#fff',fontSize:14}}>ОБЩО ТРАНСПОРТ</div>
            <div style={{fontWeight:900,color:'#fff',fontSize:18,textAlign:'right'}}>€{totalTransport.toFixed(2)}</div>
          </div>

          <div style={{fontSize:11,color:'#81BFB7',marginTop:10,textAlign:'center'}}>
            От Настройки: гориво €{f.fuel_per_100km||8}/100км · цена €{f.fuel_price_per_liter||2.65}/л · амортизация €{f.amort_per_km||0.35}/км
          </div>
        </div>
      </div>
    )
  }
  const Tab8 = () => {
    const addRental = () => {
      set('rentals', [...(state.rentals||[]), {
        id: Date.now(),
        name: '',
        supplier: '',
        price_per_day: 0,
        days: 1,
      }])
    }

    const updateRental = (id, field, value) => {
      set('rentals', (state.rentals||[]).map(r => r.id===id ? {...r,[field]:value} : r))
    }

    const removeRental = (id) => {
      set('rentals', (state.rentals||[]).filter(r => r.id!==id))
    }

    const totalRental = (state.rentals||[]).reduce((s,r) => s + (+r.price_per_day||0) * (+r.days||1), 0)

    return (
      <div>
        {(state.rentals||[]).length === 0 && (
          <div style={{textAlign:'center',padding:40,color:'#81BFB7',background:'rgba(255,255,255,0.7)',borderRadius:20,marginBottom:16}}>
            Няма наети артикули — добави ако имаш
          </div>
        )}

        {(state.rentals||[]).map((r,i) => (
          <div key={r.id} style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:'#F3A2BE'}}>📦 Артикул под наем {i+1}</div>
              <button onClick={()=>removeRental(r.id)} style={{background:'#FFD3DD',border:'none',borderRadius:8,color:'#c0392b',cursor:'pointer',fontWeight:700,padding:'6px 12px'}}>🗑️</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Артикул</div>
                <input style={inp} placeholder="напр. Арка голяма, Неон надпис..." value={r.name||''} onChange={e=>updateRental(r.id,'name',e.target.value)} />
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Доставчик</div>
                <input style={inp} placeholder="От кого наемаш..." value={r.supplier||''} onChange={e=>updateRental(r.id,'supplier',e.target.value)} />
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Цена (€/ден)</div>
                <input style={inp} type="number" min={0} step={0.5} value={r.price_per_day||0} onChange={e=>updateRental(r.id,'price_per_day',+e.target.value)} />
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Дни</div>
                <input style={inp} type="number" min={1} step={1} value={r.days||1} onChange={e=>updateRental(r.id,'days',+e.target.value)} />
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Общо</div>
                <div style={{padding:'10px 13px',background:'#FFD3DD',borderRadius:8,fontWeight:700,color:'#3a2a35',fontSize:14}}>
                  €{((r.price_per_day||0)*(r.days||1)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button onClick={addRental} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',border:'none',borderRadius:12,color:'#fff',fontWeight:800,cursor:'pointer',fontSize:14,marginBottom:16}}>
          + Добави артикул под наем
        </button>

        {(state.rentals||[]).length > 0 && (
          <div style={{background:'linear-gradient(135deg,#C6E6E3,#81BFB7)',borderRadius:16,padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:14,fontWeight:900,color:'#fff'}}>ОБЩО НАЕМ</div>
              <div style={{fontSize:20,fontWeight:900,color:'#fff'}}>€{totalRental.toFixed(2)}</div>
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',marginTop:4}}>
              {(state.rentals||[]).length} артикула под наем · скрито в крайната цена
            </div>
          </div>
        )}
      </div>
    )
  }
  const Tab9 = () => {
    const f = settings.finances || {}

    return (
      <div>
        <div style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:900,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #FFD3DD'}}>
            📈 Марж
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button onClick={()=>set('margin_type','percent')} style={{flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:state.margin_type==='percent'?'#F3A2BE':'#f0f0f0',color:state.margin_type==='percent'?'#fff':'#81BFB7'}}>
              % Процент
            </button>
            <button onClick={()=>set('margin_type','amount')} style={{flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:state.margin_type==='amount'?'#F3A2BE':'#f0f0f0',color:state.margin_type==='amount'?'#fff':'#81BFB7'}}>
              € Сума
            </button>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
            <input style={{...inp,flex:1}} type="number" min={0} step={state.margin_type==='percent'?1:0.5} value={state.margin||0} onChange={e=>set('margin',+e.target.value)} />
            <span style={{fontSize:16,fontWeight:700,color:'#F3A2BE'}}>{state.margin_type==='percent'?'%':'€'}</span>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[10,20,25,30,35,40,50].map(m=>(
              <button key={m} onClick={()=>{set('margin',m);set('margin_type','percent')}} style={{padding:'6px 14px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:state.margin===m&&state.margin_type==='percent'?'#F3A2BE':'#f0f0f0',color:state.margin===m&&state.margin_type==='percent'?'#fff':'#81BFB7'}}>
                {m}%
              </button>
            ))}
          </div>
        </div>

        <div style={{background:'#fff',border:'2px solid #C6E6E3',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #C6E6E3'}}>
            🎁 Отстъпка
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button onClick={()=>set('discount_type','none')} style={{flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:state.discount_type==='none'?'#81BFB7':'#f0f0f0',color:state.discount_type==='none'?'#fff':'#81BFB7'}}>
              Без отстъпка
            </button>
            <button onClick={()=>set('discount_type','percent')} style={{flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:state.discount_type==='percent'?'#81BFB7':'#f0f0f0',color:state.discount_type==='percent'?'#fff':'#81BFB7'}}>
              % Процент
            </button>
            <button onClick={()=>set('discount_type','amount')} style={{flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:state.discount_type==='amount'?'#81BFB7':'#f0f0f0',color:state.discount_type==='amount'?'#fff':'#81BFB7'}}>
              € Сума
            </button>
          </div>
          {state.discount_type !== 'none' && (
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <input style={{...inp,flex:1}} type="number" min={0} step={state.discount_type==='percent'?1:0.5} value={state.discount||0} onChange={e=>set('discount',+e.target.value)} />
              <span style={{fontSize:16,fontWeight:700,color:'#81BFB7'}}>{state.discount_type==='percent'?'%':'€'}</span>
            </div>
          )}
        </div>

        <div style={{background:'#fff',border:'2px solid #C6E6E3',borderRadius:16,padding:20}}>
          <div style={{fontSize:12,fontWeight:900,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #C6E6E3'}}>
            📦 Допълнителни разходи
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Консумативи (€)</div>
              <div style={{padding:'10px 13px',background:'#F0F9F8',borderRadius:8,fontSize:13,color:'#3a2a35',fontWeight:600}}>
                €{(f.consumables_per_event||2).toFixed(2)}
                <span style={{fontSize:10,color:'#81BFB7',marginLeft:8}}>от Настройки</span>
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Режийни (€)</div>
              <div style={{padding:'10px 13px',background:'#F0F9F8',borderRadius:8,fontSize:13,color:'#3a2a35',fontWeight:600}}>
                €{(f.overhead_per_event||5).toFixed(2)}
                <span style={{fontSize:10,color:'#81BFB7',marginLeft:8}}>от Настройки</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  // ГЛАВНА ФУНКЦИЯ ЗА ИЗЧИСЛЕНИЕ
  const buildCalc = () => {
    const t = settings.times || {}
    const f = settings.finances || {}
    const INFLATE_SEC = { 5:8, 10:22, 11:24, 12:26, 16:35, 18:40, 24:55, 36:80 }

    const calcClusters = (lengthCm, sizeInch, perCluster) => {
      const price = balloonPrices.find(p => p.size_inch === sizeInch)
      const diamCm = price?.size_cm || (sizeInch * 2.54)
      const factor = perCluster <= 4 ? 4.8 : 6.3
      return Math.ceil((lengthCm / diamCm) * factor / perCluster)
    }

    // МАТЕРИАЛИ
    let matBalloons = 0
    let totalClusters = 0
    let totalInflateMin = 0
    let totalStuffingMin = 0
    let totalClusterAssemblyMin = 0
    let balloonList = {}

    state.garlands.forEach(g => {
      g.templates.forEach(t2 => {
        const clusters = t2.cluster_count || calcClusters(g.length_cm, t2.main_size_inch, t2.main_per_cluster)
        totalClusters += clusters
        const mainCount = clusters * t2.main_per_cluster
        const smallCount = t2.has_small ? clusters * t2.small_per_cluster : 0
        const largeCount = t2.has_large ? clusters * t2.large_per_cluster : 0

        // Цена на балоните
        const mainPrice = balloonPrices.find(p => p.size_inch === t2.main_size_inch)?.price_per_unit || 0
        const smallPrice = balloonPrices.find(p => p.size_inch === 5)?.price_per_unit || 0
        const largePrice = balloonPrices.find(p => p.size_inch === 18)?.price_per_unit || 0
        matBalloons += mainCount * mainPrice + smallCount * smallPrice + largeCount * largePrice

        // Списък балони
        const mkKey = (size, stuffing=false) => `${size}"${stuffing?' (вътрешен)':''}`
        balloonList[mkKey(t2.main_size_inch)] = (balloonList[mkKey(t2.main_size_inch)]||0) + mainCount
        if (t2.has_small) balloonList[mkKey(5)] = (balloonList[mkKey(5)]||0) + smallCount
        if (t2.has_large) balloonList[mkKey(18)] = (balloonList[mkKey(18)]||0) + largeCount

        // Stuffing
        if (t2.stuffing_percent > 0) {
          const stuffCount = Math.ceil((mainCount + smallCount) * t2.stuffing_percent / 100)
          totalStuffingMin += Math.ceil(stuffCount * (t.stuffing_sec_per_balloon||20) / 60)
          balloonList[mkKey(t2.main_size_inch, true)] = (balloonList[mkKey(t2.main_size_inch, true)]||0) + stuffCount
          matBalloons += stuffCount * mainPrice
        }

        // Времена
        totalInflateMin += Math.ceil((mainCount * (INFLATE_SEC[t2.main_size_inch]||22) + smallCount * 8 + largeCount * 40) / 60)
        totalClusterAssemblyMin += Math.ceil(clusters * (t.cluster_assembly_sec||45) / 60)
      })
    })

    // Буфер за дефекти
    const bufferCost = matBalloons * ((f.defect_buffer_medium||7) / 100)
    const matBalloonsFinal = matBalloons * (1 + (f.defect_buffer_medium||7) / 100)

    // Допълнения
    const matExtras = (state.extras||[]).reduce((s,e) => s + (+e.material_cost||0) + (+e.rental_cost||0), 0)
    const extrasHomeMin = (state.extras||[]).reduce((s,e) => s + (e.prep_at_home ? (+e.prep_home_min||0) : 0), 0)
    const extrasLocationMin = (state.extras||[]).reduce((s,e) => {
      let total = e.prep_at_location ? (+e.prep_location_min||0) : 0
      total += (+e.placement_min||0)
      return s + total
    }, 0)

    // Наем
    const matRentals = (state.rentals||[]).reduce((s,r) => s + (+r.price_per_day||0) * (+r.days||1), 0)

    // Оборудване амортизация — от Настройки (ще добавим)
    const matConsumables = f.consumables_per_event || 2
    const matOverhead = f.overhead_per_event || 5

    const totalMaterials = matBalloonsFinal + matExtras + matRentals + matConsumables + matOverhead

    // ТРУД
    const clusterAttachMin = Math.ceil(totalClusters * (t.cluster_attachment_sec||45) / 60)
    const locationTotalMin = (t.unpacking_min||15) + (t.space_prep_min||10) + (t.arch_assembly_min||15) + (t.cover_placement_min||5) + clusterAttachMin + extrasLocationMin + (t.final_corrections_min||10) + (t.photo_time_min||10)
    const dismantleMin = Math.ceil(locationTotalMin * ((t.dismantling_percent||50) / 100))

    const homeMin = (+(t.consultation_min||0)) + (+(t.followup_min||0)) + (+(t.stock_check_min||0)) + (+(t.order_min||0)) + (+(t.sorting_min||0)) + extrasHomeMin + totalStuffingMin + totalInflateMin + totalClusterAssemblyMin + (+(t.car_loading_min||0))
    const locationMin = locationTotalMin
    const totalLaborMin = homeMin + locationMin + dismantleMin

    const laborHome = (homeMin / 60) * (f.rate_inflation||10)
    const laborLocation = (locationMin / 60) * (f.rate_installation||12)
    const laborDismantle = (dismantleMin / 60) * (f.rate_dismantling||10)
    const totalLabor = laborHome + laborLocation + laborDismantle

    // ТРАНСПОРТ
    const fuelCost = (state.travel_km||0) * 2 * ((f.fuel_per_100km||8) / 100) * (f.fuel_price_per_liter||2.65)
    const amortCost = (state.travel_km||0) * 2 * (f.amort_per_km||0.35)
    const totalTransport = fuelCost + amortCost

    // СЕБЕСТОЙНОСТ
    const costTotal = totalMaterials + totalLabor + totalTransport

    // МАРЖ
    let price = costTotal
    if (state.margin_type === 'percent' && state.margin > 0) {
      price = costTotal / (1 - state.margin / 100)
    } else if (state.margin_type === 'amount') {
      price = costTotal + (+state.margin||0)
    }

    // ОТСТЪПКА
    let discountAmount = 0
    if (state.discount_type === 'percent' && state.discount > 0) {
      discountAmount = price * (state.discount / 100)
    } else if (state.discount_type === 'amount') {
      discountAmount = +state.discount || 0
    }
    const finalPrice = Math.max(0, price - discountAmount)

    return {
      matBalloons: matBalloonsFinal,
      matExtras,
      matRentals,
      matConsumables,
      matOverhead,
      totalMaterials,
      laborHome,
      laborLocation,
      laborDismantle,
      totalLabor,
      fuelCost,
      amortCost,
      totalTransport,
      costTotal,
      price,
      discountAmount,
      finalPrice,
      totalLaborMin,
      homeMin,
      locationMin,
      dismantleMin,
      totalClusters,
      balloonList,
    }
  }

  const Tab10 = () => {
    const calc = buildCalc()
    const f = settings.finances || {}

    const SummaryRow = ({label, value, sub, color='#3a2a35', bold=false}) => (
      <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #F0F9F8',fontSize:13}}>
        <div>
          <span style={{color, fontWeight: bold?700:400}}>{label}</span>
          {sub && <div style={{fontSize:10,color:'#81BFB7'}}>{sub}</div>}
        </div>
        <span style={{fontWeight:bold?900:600,color}}>{value}</span>
      </div>
    )

    return (
      <div>
        {/* SUMMARY */}
        <div style={{background:'#fff',border:'2px solid #FFD3DD',borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:900,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #FFD3DD'}}>
            📊 Ценова калкулация
          </div>

          <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>🎈 Материали</div>
          <SummaryRow label="Балони (с буфер)" value={`€${calc.matBalloons.toFixed(2)}`} />
          <SummaryRow label="Допълнения" value={`€${calc.matExtras.toFixed(2)}`} />
          <SummaryRow label="Наем оборудване" value={`€${calc.matRentals.toFixed(2)}`} />
          <SummaryRow label="Консумативи" value={`€${calc.matConsumables.toFixed(2)}`} sub="от Настройки" />
          <SummaryRow label="Режийни" value={`€${calc.matOverhead.toFixed(2)}`} sub="от Настройки" />
          <SummaryRow label="Общо материали" value={`€${calc.totalMaterials.toFixed(2)}`} bold color='#F3A2BE' />

          <div style={{height:1,background:'#FFD3DD',margin:'12px 0'}}/>

          <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>⏱️ Труд</div>
          <SummaryRow label="Подготовка вкъщи" value={`€${calc.laborHome.toFixed(2)}`} sub={`${calc.homeMin} мин`} />
          <SummaryRow label="Монтаж на локация" value={`€${calc.laborLocation.toFixed(2)}`} sub={`${calc.locationMin} мин`} />
          <SummaryRow label="Демонтаж" value={`€${calc.laborDismantle.toFixed(2)}`} sub={`${calc.dismantleMin} мин`} />
          <SummaryRow label="Общо труд" value={`€${calc.totalLabor.toFixed(2)}`} bold color='#F3A2BE' />

          <div style={{height:1,background:'#FFD3DD',margin:'12px 0'}}/>

          <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>🚗 Транспорт</div>
          <SummaryRow label="Гориво + Амортизация" value={`€${calc.totalTransport.toFixed(2)}`} sub={`${(state.travel_km||0)*2} км`} />

          <div style={{height:1,background:'#FFD3DD',margin:'12px 0'}}/>

          <SummaryRow label="СЕБЕСТОЙНОСТ" value={`€${calc.costTotal.toFixed(2)}`} bold color='#3a2a35' />
          <SummaryRow label={`Марж (${state.margin}${state.margin_type==='percent'?'%':'€'})`} value={`€${(calc.price-calc.costTotal).toFixed(2)}`} color='#81BFB7' />

          {calc.discountAmount > 0 && (
            <SummaryRow label={`Отстъпка (${state.discount}${state.discount_type==='percent'?'%':'€'})`} value={`-€${calc.discountAmount.toFixed(2)}`} color='#F3A2BE' />
          )}

          <div style={{background:'linear-gradient(135deg,#F3A2BE,#81BFB7)',borderRadius:12,padding:'14px 16px',marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:900,color:'#fff',fontSize:16}}>ЦЕНА ЗА КЛИЕНТ</span>
            <span style={{fontWeight:900,color:'#fff',fontSize:24}}>€{calc.finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* БУТОНИ */}
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button onClick={()=>{
            // TODO: PDF калкулация
            alert('PDF калкулация — скоро!')
          }} style={{flex:1,padding:'14px',background:'linear-gradient(135deg,#C6E6E3,#81BFB7)',border:'none',borderRadius:12,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13}}>
            📄 Свали PDF калкулация
          </button>
          <button onClick={()=>{
            const calc = buildCalc()
            const t = settings.times || {}
            const INFLATE_SEC = { 5:8, 10:22, 11:24, 12:26, 16:35, 18:40, 24:55, 36:80 }

            const calcClusters = (lengthCm, sizeInch, perCluster) => {
              const price = balloonPrices.find(p => p.size_inch === sizeInch)
              const diamCm = price?.size_cm || (sizeInch * 2.54)
              const factor = perCluster <= 4 ? 4.8 : 6.3
              return Math.ceil((lengthCm / diamCm) * factor / perCluster)
            }

            const subMins = (time, m) => {
              if (!time) return ''
              const [h, min] = time.split(':').map(Number)
              let total = h * 60 + min - m
              total = ((total % 1440) + 1440) % 1440
              return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
            }

            // Генерираме работния лист
            let garlandsHTML = ''

            state.garlands.forEach((g, gi) => {
              // Събираме всички балони за сортиране
              let sortList = {}
              let stuffingList = []
              let clusterSteps = []
              let schemeLetters = []

              g.templates.forEach((tmpl, ti) => {
                const clusters = tmpl.cluster_count || calcClusters(g.length_cm, tmpl.main_size_inch, tmpl.main_per_cluster)
                const letter = String.fromCharCode(65 + ti) // А, Б, В...
                const colors = tmpl.colors || []

                // Схема
                for (let i = 0; i < clusters; i++) schemeLetters.push(letter)

                // Сортиране
                colors.forEach((c, ci) => {
                  const usedByPrev = colors.slice(0,ci).reduce((s,x)=>s+(x.clusters||0),0)
                  const remaining = clusters - colors.slice(0,ci).reduce((s,x)=>s+(x.clusters||0),0)
                  const clCount = c.clusters || (ci===colors.length-1 ? remaining : 0)
                  if (!clCount || !c.name) return

                  const mainKey = `${c.name} ${tmpl.main_size_inch}"`
                  sortList[mainKey] = (sortList[mainKey]||0) + clCount * tmpl.main_per_cluster
                  if (tmpl.has_small) {
                    const smallKey = `${c.name} 5"`
                    sortList[smallKey] = (sortList[smallKey]||0) + clCount * tmpl.small_per_cluster
                  }
                  if (tmpl.has_large) {
                    const largeKey = `${c.name} 18"`
                    sortList[largeKey] = (sortList[largeKey]||0) + clCount * tmpl.large_per_cluster
                  }

                  // Stuffing
                  if (tmpl.stuffing_percent > 0) {
                    const stuffCount = Math.ceil(clCount * tmpl.main_per_cluster * tmpl.stuffing_percent / 100)
                    stuffingList.push(`${c.name} ${tmpl.main_size_inch}" → пъхни вътре ${stuffCount} бр ${c.stuffing_color||c.name} ${tmpl.main_size_inch}"`)
                  }
                })

                // Кластри
                let clusterDesc = `${clusters} кластра × ${tmpl.main_per_cluster} бр ${tmpl.main_size_inch}"`
                if (tmpl.has_small) clusterDesc += ` + ${tmpl.small_per_cluster} бр 5"`
                if (tmpl.has_large) clusterDesc += ` + ${tmpl.large_per_cluster} бр 18"`
                if (tmpl.stuffing_percent > 0) clusterDesc += ` · ${tmpl.stuffing_percent}% балон в балон`

                let colorsDesc = colors.filter(c=>c.name).map((c,ci) => {
                  const usedByPrev = colors.slice(0,ci).reduce((s,x)=>s+(x.clusters||0),0)
                  const remaining = clusters - usedByPrev
                  const clCount = c.clusters || (ci===colors.length-1?remaining:0)
                  return `<div style="margin:4px 0;padding:6px 10px;background:#fff;border-radius:6px;border-left:3px solid #F3A2BE">
                    <strong>${clCount} кластра ${c.name}:</strong>
                    ${tmpl.main_per_cluster} бр ${c.name} ${tmpl.main_size_inch}"
                    ${tmpl.has_small ? `+ ${tmpl.small_per_cluster} бр ${c.name} 5"` : ''}
                    ${tmpl.has_large ? `+ ${tmpl.large_per_cluster} бр ${c.name} 18"` : ''}
                    ${tmpl.stuffing_percent > 0 ? `<br><span style="color:#F3A2BE;font-size:11px">→ ${Math.ceil(clCount*tmpl.main_per_cluster*tmpl.stuffing_percent/100)} бр stuffing с ${c.stuffing_color||c.name}</span>` : ''}
                  </div>`
                }).join('')

                clusterSteps.push(`
                  <div style="margin-bottom:10px">
                    <div style="font-weight:700;color:#3a2a35;margin-bottom:6px">Шаблон ${letter}: ${clusterDesc}</div>
                    ${colorsDesc}
                  </div>
                `)
              })

              // Автоматична схема
              const autoScheme = schemeLetters.join(' · ')

              // Надуване
              let inflateHTML = ''
              Object.entries(sortList).forEach(([key, count], i) => {
                const size = parseInt(key.match(/\d+/)?.[0]||10)
                const mins = Math.ceil(count * (INFLATE_SEC[size]||22) / 60)
                inflateHTML += `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:13px">
                  <span>Купчина ${i+1}: ${key}</span>
                  <span><strong>${count} бр</strong> · ~${mins} мин</span>
                </div>`
              })

              garlandsHTML += `
                <div style="margin-bottom:24px;padding:16px;border:2px solid #FFD3DD;border-radius:12px">
                  <div style="font-size:16px;font-weight:900;color:#F3A2BE;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #FFD3DD">
                    🎈 ${g.name} — ${g.length_cm} см
                  </div>

                  <div style="margin-bottom:14px">
                    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#81BFB7;margin-bottom:8px">📦 Стъпка 1 — Сортирай балоните</div>
                    ${Object.entries(sortList).map(([key, count], i) => `
                      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:13px">
                        <span>${key}</span>
                        <span><strong>${count} бр</strong> → Купчина ${i+1}</span>
                      </div>`).join('')}
                  </div>

                  ${stuffingList.length > 0 ? `
                  <div style="margin-bottom:14px">
                    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#81BFB7;margin-bottom:8px">🎈 Стъпка 2 — Stuffing (балон в балон)</div>
                    ${stuffingList.map(s => `<div style="padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:13px">${s}</div>`).join('')}
                  </div>` : ''}

                  <div style="margin-bottom:14px">
                    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#81BFB7;margin-bottom:8px">💨 Стъпка 3 — Надуй</div>
                    ${inflateHTML}
                  </div>

                  <div style="margin-bottom:14px">
                    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#81BFB7;margin-bottom:8px">🔗 Стъпка 4 — Направи кластри</div>
                    ${clusterSteps.join('')}
                  </div>

                  <div style="margin-bottom:14px">
                    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#81BFB7;margin-bottom:8px">📍 Стъпка 5 — Схема на наредба</div>
                    <div style="padding:10px;background:#F0F9F8;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:2px;color:#3a2a35">${autoScheme}</div>
                  </div>
                </div>
              `
            })

            // Timeline монтаж
            const buildTLHTML = (rows, title, color) => {
              if (!rows || rows.length === 0) return ''
              return `
                <div style="margin-bottom:16px;padding:16px;border:2px solid ${color};border-radius:12px">
                  <div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:${color};margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid ${color}">${title}</div>
                  ${rows.map(r => `
                    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:8px">
                      <div style="min-width:54px;padding:4px 8px;background:${r.isEvent?color:'#fff'};color:${r.isEvent?'#fff':color};border:1.5px solid ${color};font-size:13px;font-weight:700;text-align:center;border-radius:6px">${r.time||''}</div>
                      <div>
                        <div style="font-weight:700;font-size:13px;color:${r.isEvent?color:'#3a2a35'}">${r.label}</div>
                        ${r.note?`<div style="font-size:11px;color:#81BFB7">${r.note}</div>`:''}
                      </div>
                    </div>`).join('')}
                </div>`
            }

            // Вземаме TL от Tab6
            const t6Data = (() => {
              const tSettings = settings.times || {}
              const calcC = (lengthCm, sizeInch, perCluster) => {
                const price = balloonPrices.find(p => p.size_inch === sizeInch)
                const diamCm = price?.size_cm || (sizeInch * 2.54)
                const factor = perCluster <= 4 ? 4.8 : 6.3
                return Math.ceil((lengthCm / diamCm) * factor / perCluster)
              }
              let tc = 0, tim = 0, tsm = 0, tcam = 0
              const INF = { 5:8, 10:22, 11:24, 12:26, 16:35, 18:40, 24:55, 36:80 }
              state.garlands.forEach(g => {
                g.templates.forEach(t2 => {
                  const cl = t2.cluster_count || calcC(g.length_cm, t2.main_size_inch, t2.main_per_cluster)
                  tc += cl
                  const mc = cl * t2.main_per_cluster
                  const sc = t2.has_small ? cl * t2.small_per_cluster : 0
                  const lc = t2.has_large ? cl * t2.large_per_cluster : 0
                  tim += Math.ceil((mc*(INF[t2.main_size_inch]||22)+sc*8+lc*40)/60)
                  if (t2.stuffing_percent>0) tsm += Math.ceil((mc+sc)*t2.stuffing_percent/100*(tSettings.stuffing_sec_per_balloon||20)/60)
                  tcam += Math.ceil(cl*(tSettings.cluster_assembly_sec||45)/60)
                })
              })
              const extHome = (state.extras||[]).reduce((s,e)=>s+(e.prep_at_home?(+e.prep_home_min||0):0),0)
              const extLoc = (state.extras||[]).reduce((s,e)=>{let tot=e.prep_at_location?(+e.prep_location_min||0):0;tot+=(+e.placement_min||0);return s+tot},0)
              const cam = Math.ceil(tc*(tSettings.cluster_attachment_sec||45)/60)
              const locMin = (tSettings.unpacking_min||15)+(tSettings.space_prep_min||10)+(tSettings.arch_assembly_min||15)+(tSettings.cover_placement_min||5)+cam+extLoc+(tSettings.final_corrections_min||10)+(tSettings.photo_time_min||10)
              const dismMin = Math.ceil(locMin*((tSettings.dismantling_percent||50)/100))
              const bf = tSettings.buffer_finish_min||10
              const bb = tSettings.buffer_before_min||15

              const buildSL = () => {
                if (!state.event_start) return []
                const et = state.event_start.slice(0,5)
                const rt = subMins(et, bf)
                const steps = []
                if (tSettings.photo_time_min>0) steps.push({label:'📸 Снимки',mins:tSettings.photo_time_min||10,note:`${tSettings.photo_time_min||10} мин`})
                if (extLoc>0) steps.push({label:'✨ Допълнения',mins:extLoc,note:`${extLoc} мин`})
                steps.push({label:'🔧 Финални корекции',mins:tSettings.final_corrections_min||10,note:`${tSettings.final_corrections_min||10} мин`})
                steps.push({label:'📍 Закачане кластри',mins:cam,note:`${tc} кластра · ${cam} мин`})
                steps.push({label:'🏗️ Сглобяване арка',mins:tSettings.arch_assembly_min||15,note:`${tSettings.arch_assembly_min||15} мин`})
                steps.push({label:'📦 Разопаковане',mins:(tSettings.unpacking_min||15)+(tSettings.space_prep_min||10),note:`${(tSettings.unpacking_min||15)+(tSettings.space_prep_min||10)} мин`})
                if (state.travel_min>0) steps.push({label:'🚗 Пристигане',mins:+state.travel_min,note:`${state.travel_km||0} км`})
                if (tim>0) steps.push({label:'🎈 Надуване',mins:tim+tsm+tcam,note:`надуване ${tim} мин · сглобяване ${tcam} мин`})
                if (extHome>0) steps.push({label:'✍️ Изработка вкъщи',mins:extHome,note:`${extHome} мин`})
                if (state.travel_min>0||bb>0) steps.push({label:'🚗 Тръгни',mins:(+state.travel_min||0)+bb,note:`пътуване + ${bb} мин резерв`})
                const rows=[]
                let cur=rt
                for(let i=0;i<steps.length;i++){if(steps[i].mins>0)cur=subMins(cur,steps[i].mins);rows.push({time:cur,label:steps[i].label,note:steps[i].note})}
                rows.reverse()
                if(bf>0)rows.push({time:rt,label:`✅ Готово (${bf} мин резерв)`,note:''})
                rows.push({time:et,label:'🎉 Събитието започва',note:'',isEvent:true})
                return rows
              }

              const buildDL = () => {
                const dt = state.dismantle_same_day ? state.event_end?.slice(0,5) : state.dismantle_time?.slice(0,5)
                if (!dt) return []
                const dismSteps = []
                dismSteps.push({label:'📍 Демонтаж',mins:dismMin,note:`${tSettings.dismantling_percent||50}% от монтажа · ${dismMin} мин`})
                if (state.travel_min>0) dismSteps.push({label:'🚗 Пристигане',mins:+state.travel_min,note:`${state.travel_km||0} км`})
                if (state.travel_min>0||bb>0) dismSteps.push({label:'🚗 Тръгни',mins:(+state.travel_min||0)+bb,note:`+ ${bb} мин резерв`})
                const rows=[]
                let cur=dt
                for(let i=0;i<dismSteps.length;i++){if(dismSteps[i].mins>0)cur=subMins(cur,dismSteps[i].mins);rows.push({time:cur,label:dismSteps[i].label,note:dismSteps[i].note})}
                rows.reverse()
                rows.push({time:dt,label:'✅ Демонтаж завършен',note:'',isEvent:true})
                return rows
              }

              return { setupTL: buildSL(), dismTL: buildDL() }
            })()

            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
              <style>
                body{font-family:'Segoe UI',Arial,sans-serif;color:#3a2a35;margin:0;padding:24px;font-size:13px;background:#fff;}
                h1{color:#F3A2BE;font-size:22px;margin-bottom:4px;}
                .subtitle{color:#81BFB7;font-size:13px;margin-bottom:20px;}
                .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#81BFB7;margin:14px 0 8px;}
                @media print{body{padding:12px;} button{display:none!important;}}
              </style>
            </head><body>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
                <div>
                  <h1>🎈 Работен лист</h1>
                  <div class="subtitle">
                    ${state.event_type||'Събитие'} · ${state.event_date||'—'} · ${state.event_start||'—'}
                    ${state.location ? `· ${state.location}` : ''}
                    ${state.client_name ? `<br>Клиент: ${state.client_name}` : ''}
                  </div>
                </div>
                <button onclick="window.print()" style="padding:8px 16px;background:#F3A2BE;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700">🖨️ Принтирай</button>
              </div>

              ${garlandsHTML}

              ${buildTLHTML(t6Data.setupTL, '📅 Timeline — Монтаж', '#F3A2BE')}
              ${buildTLHTML(t6Data.dismTL, '📦 Timeline — Демонтаж', '#81BFB7')}

              <div style="margin-top:20px;padding:12px;background:#F0F9F8;border-radius:8px;font-size:11px;color:#81BFB7;text-align:center">
                Генерирано с BalloonPro · ${new Date().toLocaleDateString('bg-BG')}
              </div>
            </body></html>`

            const w = window.open('','_blank','width=900,height=1100')
            w.document.write(html)
            w.document.close()
          }} style={{flex:1,padding:'14px',background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',border:'none',borderRadius:12,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13}}>
            📋 Работен лист
          </button>
                     
          <button onClick={()=>setShowOfferPopup(true)} style={{flex:1,padding:'14px',background:'linear-gradient(135deg,#F3A2BE,#81BFB7)',border:'none',borderRadius:12,color:'#fff',fontWeight:800,cursor:'pointer',fontSize:13}}>
            🎯 Създай оферта
          </button>
                     
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
    if (step === 6) return Tab6()
    if (step === 7) return Tab7()
    if (step === 8) return Tab8()
    if (step === 9) return Tab9()
    if (step === 10) return Tab10()        
    return <div style={{textAlign:'center',padding:60,color:'#81BFB7'}}>🚧 Скоро...</div>
  }
  const OfferPopup = () => {
    const calc = buildCalc()
    const setOF = (k,v) => setOfferForm(p=>({...p,[k]:v}))
    const selectedClient = clients.find(c=>c.id===offerForm.client_id)

    const handleVisual = (e, index) => {
      const file = e.target.files[0]
      if (!file) return
      const newFiles = [...offerForm.visual_files]
      newFiles[index] = file
      const newPreviews = [...offerForm.visual_previews]
      newPreviews[index] = URL.createObjectURL(file)
      setOfferForm(p=>({...p, visual_files: newFiles, visual_previews: newPreviews}))
    }

    const uploadVisual = async (file) => {
      const ext = file.name.split('.').pop()
      const path = `visuals/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('inquiries').upload(path, file)
      if (error) return null
      const { data } = supabase.storage.from('inquiries').getPublicUrl(path)
      return data.publicUrl
    }

    const dateToISO = (d) => {
      if (!d) return null
      return d
    }

    const handleSave = async () => {
      if (!offerForm.client_id && !offerForm.client_name_manual.trim()) {
        alert('Избери клиент или въведи ime!')
        return
      }
      setSavingOffer(true)

      // Качваме визуализации
      const visualUrls = [null, null, null]
      for (let i=0; i<3; i++) {
        if (offerForm.visual_files[i]) {
          const url = await uploadVisual(offerForm.visual_files[i])
          if (url) visualUrls[i] = url
        }
      }

      // Ако е нов клиент — създаваме го
      let clientId = offerForm.client_id
      if (!clientId && offerForm.client_name_manual.trim()) {
        const { data: newClient } = await supabase.from('clients').insert([{
          name: offerForm.client_name_manual,
          phone: offerForm.client_phone_manual,
          status: 'regular',
        }]).select()
        clientId = newClient?.[0]?.id
      }

      // Артикули от калкулатора
      const items = []
      state.garlands.forEach(g => {
        items.push({ description: `${g.name} — ${g.length_cm} см`, category: 'Декорация', quantity: 1, unit_price: 0, total: 0 })
        g.templates.forEach(t => {
          const colors = (t.colors||[]).filter(c=>c.name)
          if (colors.length > 0) {
            colors.forEach(c => {
              items.push({ description: `Балони ${c.name} ${t.main_size_inch}"`, category: 'Балони', quantity: 0, unit_price: 0, total: 0 })
            })
          }
        })
      });
      (state.extras||[]).forEach(e => {
        items.push({ description: e.description || e.type, category: 'Допълнение', quantity: 1, unit_price: 0, total: 0 })
      })
      if (state.travel_km > 0) items.push({ description: 'Транспорт', category: 'Услуга', quantity: 1, unit_price: 0, total: 0 })

      const eventDateISO = (() => {
        if (!state.event_date) return null
        if (state.event_date.includes('-')) return state.event_date
        const p = state.event_date.split('.')
        if (p.length===3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
        return null
      })()

      const history = [{
        date: new Date().toISOString(),
        action: 'Създадена',
        note: 'Оферта създадена от калкулатора'
      }]

      const payload = {
        client_id: clientId,
        event_date: eventDateISO,
        event_time: state.event_start || null,
        event_type: state.event_type || null,
        location: state.location || null,
        guest_count: state.guest_count ? +state.guest_count : null,
        items,
        subtotal: calc.finalPrice,
        total: calc.finalPrice,
        discount: calc.discountAmount,
        deposit: +offerForm.deposit || 0,
        deposit_due_date: dateToISO(offerForm.deposit_due_date),
        valid_until: dateToISO(offerForm.valid_until),
        notes: offerForm.notes || null,
        visual_url_1: visualUrls[0],
        visual_url_2: visualUrls[1],
        visual_url_3: visualUrls[2],
        status: 'draft',
        show_prices: false,
        calc_data: calc,
        garlands_data: state.garlands,
        extras_data: state.extras,
        inquiry_id: state.inquiry_id || null,
        history,
      }

      const { error } = await supabase.from('offers').insert([payload])
      setSavingOffer(false)

      if (error) {
        alert('Грешка: ' + error.message)
        return
      }

      setShowOfferPopup(false)
      alert('✅ Офертата е създадена! Можеш да я намериш в Оферти.')
    }

    return (
      <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(58,42,53,0.6)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:2000,padding:20}}>
        <div style={{background:'#F0F9F8',borderRadius:32,width:'90%',maxWidth:700,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 30px 60px rgba(0,0,0,0.3)'}}>

          {/* ХЕДЪР */}
          <div style={{padding:'20px 32px',borderBottom:'1px solid #FFD3DD',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.9)',borderTopLeftRadius:32,borderTopRightRadius:32}}>
            <h2 style={{color:'#3a2a35',fontWeight:900,margin:0,fontSize:18}}>📄 Създай оферта</h2>
            <button onClick={()=>setShowOfferPopup(false)} style={{border:'none',background:'#FFD3DD',borderRadius:'50%',width:36,height:36,cursor:'pointer',fontSize:18}}>✕</button>
          </div>

          <div style={{padding:'20px 32px 32px'}}>

            {/* РЕЗЮМЕ ОТ КАЛКУЛАТОРА */}
            <div style={{background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',borderRadius:12,padding:'12px 16px',marginBottom:16,color:'#fff'}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>От калкулатора</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:13}}>
                  {state.event_type||'Събитие'} · {state.event_date||'—'} · {state.location||'—'}
                </div>
                <div style={{fontSize:22,fontWeight:900}}>€{calc.finalPrice.toFixed(2)}</div>
              </div>
            </div>

            {/* КЛИЕНТ */}
            <div style={{background:'#fff',border:'1px solid #C6E6E3',borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>👤 Клиент</div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:'#81BFB7',marginBottom:4}}>Избери от списъка:</div>
                <select style={{...inp}} value={offerForm.client_id} onChange={e=>setOF('client_id',e.target.value)}>
                  <option value="">-- Нов клиент --</option>
                  {clients.map(c=>(
                    <option key={c.id} value={c.id}>{c.name}{c.phone?` · ${c.phone}`:''}</option>
                  ))}
                </select>
              </div>
              {!offerForm.client_id && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div>
                    <div style={{fontSize:11,color:'#81BFB7',marginBottom:4}}>Ime на клиента *</div>
                    <input style={inp} placeholder="Мария Иванова" value={offerForm.client_name_manual} onChange={e=>setOF('client_name_manual',e.target.value)} />
                  </div>
                  <div>
                    <div style={{fontSize:11,color:'#81BFB7',marginBottom:4}}>Телефон</div>
                    <input style={inp} placeholder="+359 88..." value={offerForm.client_phone_manual} onChange={e=>setOF('client_phone_manual',e.target.value)} />
                  </div>
                </div>
              )}
              {selectedClient && (
                <div style={{padding:'8px 12px',background:'#F0F9F8',borderRadius:8,fontSize:13,color:'#3a2a35'}}>
                  ✅ {selectedClient.name} {selectedClient.phone?`· ${selectedClient.phone}`:''}
                </div>
              )}
            </div>

            {/* ФИНАНСИ */}
            <div style={{background:'#fff',border:'1px solid #C6E6E3',borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>💰 Финанси</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                <div>
                  <div style={{fontSize:11,color:'#81BFB7',marginBottom:4}}>Депозит (€)</div>
                  <input style={inp} type="number" min={0} step={0.5} value={offerForm.deposit} onChange={e=>setOF('deposit',+e.target.value)} />
                </div>
                <div>
                  <div style={{fontSize:11,color:'#81BFB7',marginBottom:4}}>Краен срок депозит</div>
                  <input style={inp} type="date" lang="bg" value={offerForm.deposit_due_date} onChange={e=>setOF('deposit_due_date',e.target.value)} />                 </div>
                <div>
                  <div style={{fontSize:11,color:'#81BFB7',marginBottom:4}}>Валидна до</div>
                  <input style={inp} type="date" lang="bg" value={offerForm.valid_until} onChange={e=>setOF('valid_until',e.target.value)} />
                </div>
              </div>
            </div>

            {/* ВИЗУАЛИЗАЦИИ */}
            <div style={{background:'#fff',border:'1px solid #C6E6E3',borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>🎨 Визуализации (до 3)</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{background:'#F0F9F8',borderRadius:10,padding:10,border:'1px solid #C6E6E3'}}>
                    <div style={{fontSize:11,color:'#81BFB7',fontWeight:700,marginBottom:6}}>Визуализация {i+1}</div>
                    <input type="file" accept="image/*" onChange={e=>handleVisual(e,i)} style={{fontSize:11,width:'100%',marginBottom:6}} />
                    {offerForm.visual_previews[i] && (
                      <img src={offerForm.visual_previews[i]} alt="" style={{width:'100%',height:80,objectFit:'cover',borderRadius:8}} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* БЕЛЕЖКИ */}
            <div style={{background:'#fff',border:'1px solid #C6E6E3',borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>📝 Бележки към клиента</div>
              <textarea style={{...inp,height:80,resize:'vertical'}} placeholder="Специални условия, забележки..." value={offerForm.notes} onChange={e=>setOF('notes',e.target.value)} />
            </div>

            {/* БУТОНИ */}
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowOfferPopup(false)} style={{flex:1,padding:14,background:'#fff',border:'1px solid #C6E6E3',color:'#81BFB7',fontWeight:700,cursor:'pointer',borderRadius:12,fontSize:13}}>
                Отказ
              </button>
              <button onClick={handleSave} disabled={savingOffer} style={{flex:2,padding:14,background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',color:'#fff',border:'none',fontWeight:800,cursor:'pointer',borderRadius:12,fontSize:13}}>
                {savingOffer?'⏳ Записва...':'💾 Запази офертата'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div style={{padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif'}}>
      {showOfferPopup && <OfferPopup />}

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