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
    const [ts, fs, bp] = await Promise.all([
      supabase.from('time_settings').select('*').limit(1).single(),
      supabase.from('financial_settings').select('*').limit(1).single(),
      supabase.from('balloon_prices').select('*, balloon_series(name, manufacturer_id, manufacturers(name))').order('size_inch'),
    ])
    setSettings({ times: ts.data || {}, finances: fs.data || {} })
    setBalloonPrices(bp.data || [])
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
      set('garlands', state.garlands.map(g => g.id!==gId ? g : {
        ...g,
        templates: [...g.templates, {
          id: Date.now(),
          main_size_inch: 10,
          main_per_cluster: 4,
          has_small: false,
          small_per_cluster: 2,
          has_large: false,
          large_per_cluster: 1,
          stuffing_percent: 0,
          cluster_count: 0,
        }]
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
                      <div style={{fontSize:12,fontWeight:700,color:'#81BFB7'}}>Шаблон {ti+1}</div>
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

  const Tab3 = React.useCallback(() => {
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
  }, [state, settings, balloonPrices])

  const PAGES = {

  const PAGES = {
    1: <Tab1 />,
    2: <Tab2 />,
    3: step === 3 ? <Tab3 /> : null,
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
        {PAGES[step] || (
          <div style={{textAlign:'center',padding:60,color:'#81BFB7'}}>
            🚧 Таб {step} — скоро...
          </div>
        )}
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