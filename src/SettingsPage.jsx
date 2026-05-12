import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const inp = { width:'100%', padding:'10px 13px', border:'1px solid #C6E6E3', borderRadius:8, fontSize:14, color:'#3a2a35', background:'#F0F9F8', outline:'none', boxSizing:'border-box' }
const card = { background:'rgba(255,255,255,0.85)', borderRadius:20, border:'1px solid rgba(243,162,190,0.2)', padding:20, marginBottom:16 }
const Lbl = ({children}) => <div style={{fontSize:11,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>{children}</div>
const Sec = ({title, children}) => (
  <div style={card}>
    <div style={{fontSize:12,fontWeight:900,color:'#F3A2BE',textTransform:'uppercase',letterSpacing:1.5,marginBottom:16,paddingBottom:8,borderBottom:'2px solid #FFD3DD'}}>{title}</div>
    {children}
  </div>
)
const Row = ({children}) => <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:12}}>{children}</div>
const Field = ({label, value, onChange, type='number', min=0, step=1}) => (
  <div>
    <Lbl>{label}</Lbl>
    <input style={inp} type={type} min={min} step={step} value={value||0} onChange={e=>onChange(type==='number'?+e.target.value:e.target.value)} />
  </div>
)

export default function SettingsPage({ onBack }) {
  const [tab, setTab] = useState('company')
  const [company, setCompany] = useState({})
  const [times, setTimes] = useState({})
  const [finances, setFinances] = useState({})
  const [equipment, setEquipment] = useState([])
  const [clusterTemplates, setClusterTemplates] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [series, setSeries] = useState([])
  const [prices, setPrices] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selMfr, setSelMfr] = useState(null)
  const [selSeries, setSelSeries] = useState(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [s, t, f, eq, mfr, ct] = await Promise.all([
      supabase.from('settings').select('*').limit(1).single(),
      supabase.from('time_settings').select('*').limit(1).single(),
      supabase.from('financial_settings').select('*').limit(1).single(),
      supabase.from('equipment').select('*').order('name'),
      supabase.from('manufacturers').select('*').order('name'),
      supabase.from('cluster_templates').select('*').order('name'),
    ])
    setClusterTemplates(ct.data || [])
    
    if (s.data) setCompany(s.data)
    if (t.data) setTimes(t.data)
    if (f.data) setFinances(f.data)
    setEquipment(eq.data || [])
    setManufacturers(mfr.data || [])
    if (mfr.data?.[0]) {
      setSelMfr(mfr.data[0].id)
      loadSeries(mfr.data[0].id)
    }
  }

  const loadSeries = async (mfrId) => {
    const { data } = await supabase.from('balloon_series').select('*').eq('manufacturer_id', mfrId).order('name')
    setSeries(data || [])
    if (data?.[0]) { setSelSeries(data[0].id); loadPrices(data[0].id) }
    else { setSeries([]); setPrices([]) }
  }

  const loadPrices = async (seriesId) => {
    const { data } = await supabase.from('balloon_prices').select('*').eq('series_id', seriesId).order('size_inch')
    setPrices(data || [])
  }

  const saveCompany = async () => {
    setSaving(true)
    await supabase.from('settings').update(company).eq('id', company.id)
    setSaving(false); showSaved()
  }

  const saveTimes = async () => {
    setSaving(true)
    await supabase.from('time_settings').update(times).eq('id', times.id)
    setSaving(false); showSaved()
  }

  const saveFinances = async () => {
    setSaving(true)
    await supabase.from('financial_settings').update(finances).eq('id', finances.id)
    setSaving(false); showSaved()
  }

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const setT = (k,v) => setTimes(p=>({...p,[k]:v}))
  const setF = (k,v) => setFinances(p=>({...p,[k]:v}))

  // ПРОИЗВОДИТЕЛИ
  const addMfr = async () => {
    const name = prompt('Име на производител:')
    if (!name) return
    const { data } = await supabase.from('manufacturers').insert([{name}]).select()
    if (data?.[0]) { setManufacturers(p=>[...p,data[0]]); setSelMfr(data[0].id); setSeries([]); setPrices([]) }
  }

  const deleteMfr = async (id) => {
    if (!window.confirm('Изтрий производителя и всички серии?')) return
    await supabase.from('manufacturers').delete().eq('id', id)
    setManufacturers(p=>p.filter(m=>m.id!==id))
    if (selMfr===id) { setSelMfr(null); setSeries([]); setPrices([]) }
  }

  // СЕРИИ
  const addSeries = async () => {
    if (!selMfr) return
    const name = prompt('Ime на серия:')
    if (!name) return
    const { data } = await supabase.from('balloon_series').insert([{manufacturer_id:selMfr, name}]).select()
    if (data?.[0]) { setSeries(p=>[...p,data[0]]); setSelSeries(data[0].id); setPrices([]) }
  }

  const deleteSeries = async (id) => {
    if (!window.confirm('Изтрий серията и всички цени?')) return
    await supabase.from('balloon_series').delete().eq('id', id)
    setSeries(p=>p.filter(s=>s.id!==id))
    if (selSeries===id) { setSelSeries(null); setPrices([]) }
  }

  // ЦЕНИ
  const addPrice = async () => {
    if (!selSeries) return
    const { data } = await supabase.from('balloon_prices').insert([{series_id:selSeries, size_inch:10, size_cm:26, price_per_unit:0}]).select()
    if (data?.[0]) setPrices(p=>[...p,data[0]])
  }

  const SIZE_TO_CM = {5:13, 6:15, 10:26, 11:28, 12:30, 16:41, 18:46, 24:61, 36:91}

  const updatePrice = async (id, field, value) => {
    let updates = {[field]: value}
    if (field === 'size_inch' && SIZE_TO_CM[value]) {
      updates.size_cm = SIZE_TO_CM[value]
    }
    setPrices(p => p.map(x => x.id===id ? {...x, ...updates} : x))
    await supabase.from('balloon_prices').update(updates).eq('id', id)
  }

  const deletePrice = async (id) => {
    await supabase.from('balloon_prices').delete().eq('id', id)
    setPrices(p=>p.filter(x=>x.id!==id))
  }

  // ОБОРУДВАНЕ
  const addEquipment = async () => {
    const { data } = await supabase.from('equipment').insert([{name:'Ново оборудване', purchase_price:0, expected_uses:100, category:'own'}]).select()
    if (data?.[0]) setEquipment(p=>[...p,data[0]])
  }

  const updateEquipment = async (id, field, value) => {
    setEquipment(p=>p.map(x=>x.id===id?{...x,[field]:value}:x))
    await supabase.from('equipment').update({[field]:value}).eq('id', id)
  }

  const deleteEquipment = async (id) => {
    if (!window.confirm('Изтрий?')) return
    await supabase.from('equipment').delete().eq('id', id)
    setEquipment(p=>p.filter(x=>x.id!==id))
  }

  const TABS = [
    {id:'company', label:'👤 Фирма'},
    {id:'balloons', label:'🎈 Балони'},
    {id:'templates', label:'🔗 Шаблони кластри'},
    {id:'times', label:'⏱️ Времена'},
    {id:'finances', label:'💰 Финанси'},
    {id:'equipment', label:'📦 Оборудване'},
  ]

  return (
    <div style={{padding:24, background:'linear-gradient(135deg,#FFD3DD 0%,#F0F9F8 45%,#C6E6E3 100%)', minHeight:'100vh', fontFamily:'sans-serif'}}>

      {/* ХЕДЪР */}
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
        <button onClick={onBack} style={{padding:'8px 16px', background:'rgba(255,255,255,0.8)', border:'1px solid #C6E6E3', borderRadius:12, color:'#81BFB7', fontWeight:700, cursor:'pointer'}}>← Табло</button>
        <h1 style={{color:'#3a2a35', margin:0, fontSize:24, fontWeight:900}}>⚙️ Настройки</h1>
        {saved && <span style={{fontSize:12, color:'#81BFB7', background:'#C6E6E3', padding:'4px 12px', borderRadius:20, fontWeight:700}}>✅ Записано!</span>}
      </div>

      {/* ТАБОВЕ */}
      <div style={{display:'flex', gap:8, marginBottom:20, flexWrap:'wrap'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 18px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background:tab===t.id?'#F3A2BE':'rgba(255,255,255,0.8)', color:tab===t.id?'#fff':'#81BFB7'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ФИРМА */}
      {tab==='company' && (
        <div>
          <Sec title="👤 Данни на фирмата">
            <Row>
              <Field label="Ime на фирма" value={company.company_name} onChange={v=>setCompany(p=>({...p,company_name:v}))} type="text" />
              <Field label="Телефон" value={company.company_phone} onChange={v=>setCompany(p=>({...p,company_phone:v}))} type="text" />
            </Row>
            <Row>
              <Field label="Имейл" value={company.company_email} onChange={v=>setCompany(p=>({...p,company_email:v}))} type="text" />
              <Field label="Адрес" value={company.company_address} onChange={v=>setCompany(p=>({...p,company_address:v}))} type="text" />
            </Row>
            <div style={{marginBottom:12}}>
              <Lbl>Текст в оферта (footer)</Lbl>
              <textarea style={{...inp, height:70, resize:'vertical'}} value={company.offer_footer_text||''} onChange={e=>setCompany(p=>({...p,offer_footer_text:e.target.value}))} />
            </div>
          </Sec>
          <button onClick={saveCompany} disabled={saving} style={{padding:'12px 24px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14}}>
            {saving?'⏳ Записва...':'💾 Запази'}
          </button>
        </div>
      )}

      {/* БАЛОНИ */}
      {tab==='balloons' && (
        <div style={{display:'grid', gridTemplateColumns:'200px 200px 1fr', gap:16}}>

          {/* ПРОИЗВОДИТЕЛИ */}
          <div style={card}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <div style={{fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1}}>Производители</div>
              <button onClick={addMfr} style={{width:24, height:24, background:'#F3A2BE', border:'none', borderRadius:'50%', color:'#fff', fontWeight:900, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center'}}>+</button>
            </div>
            {manufacturers.map(m=>(
              <div key={m.id} onClick={()=>{setSelMfr(m.id); loadSeries(m.id)}} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', borderRadius:10, marginBottom:4, cursor:'pointer', background:selMfr===m.id?'#FFD3DD':'#F0F9F8', fontWeight:selMfr===m.id?700:400, color:'#3a2a35', fontSize:13}}>
                <span>{m.name}</span>
                <button onClick={e=>{e.stopPropagation(); deleteMfr(m.id)}} style={{background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:14}}>×</button>
              </div>
            ))}
            {manufacturers.length===0 && <div style={{fontSize:12, color:'#81BFB7', textAlign:'center', padding:16}}>Няма производители</div>}
          </div>

          {/* СЕРИИ */}
          <div style={card}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <div style={{fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1}}>Серии</div>
              {selMfr && <button onClick={addSeries} style={{width:24, height:24, background:'#F3A2BE', border:'none', borderRadius:'50%', color:'#fff', fontWeight:900, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center'}}>+</button>}
            </div>
            {!selMfr && <div style={{fontSize:12, color:'#81BFB7', textAlign:'center', padding:16}}>Избери производител</div>}
            {series.map(s=>(
              <div key={s.id} onClick={()=>{setSelSeries(s.id); loadPrices(s.id)}} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', borderRadius:10, marginBottom:4, cursor:'pointer', background:selSeries===s.id?'#FFD3DD':'#F0F9F8', fontWeight:selSeries===s.id?700:400, color:'#3a2a35', fontSize:13}}>
                <span>{s.name}</span>
                <button onClick={e=>{e.stopPropagation(); deleteSeries(s.id)}} style={{background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:14}}>×</button>
              </div>
            ))}
            {selMfr && series.length===0 && <div style={{fontSize:12, color:'#81BFB7', textAlign:'center', padding:16}}>Няма серии</div>}
          </div>

          {/* ЦЕНИ */}
          <div style={card}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <div style={{fontSize:11, fontWeight:700, color:'#F3A2BE', textTransform:'uppercase', letterSpacing:1}}>Размери и цени</div>
              {selSeries && <button onClick={addPrice} style={{padding:'6px 14px', background:'#F3A2BE', border:'none', borderRadius:8, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:12}}>+ Добави размер</button>}
            </div>
            {!selSeries && <div style={{fontSize:12, color:'#81BFB7', textAlign:'center', padding:24}}>Избери серия</div>}
            {prices.length>0 && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:8, marginBottom:8}}>
                {['Размер (")', 'Диаметър (см)', '€/бр', ''].map(h=>(
                  <div key={h} style={{fontSize:10, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1}}>{h}</div>
                ))}
              </div>
            )}
            {prices.map(p=>(
              <div key={p.id} style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:8, marginBottom:8, alignItems:'center'}}>
                <input style={inp} type="number" min={1} step={1} value={p.size_inch||0} onChange={e=>updatePrice(p.id,'size_inch',+e.target.value)} />
                <input style={inp} type="number" min={1} step={0.5} value={p.size_cm||0} onChange={e=>updatePrice(p.id,'size_cm',+e.target.value)} />
                <input style={inp} type="number" min={0} step={0.01} value={p.price_per_unit||0} onChange={e=>updatePrice(p.id,'price_per_unit',+e.target.value)} />
                <button onClick={()=>deletePrice(p.id)} style={{background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:20}}>×</button>
              </div>
            ))}
            {selSeries && prices.length===0 && <div style={{fontSize:12, color:'#81BFB7', textAlign:'center', padding:24}}>Няма размери — добави!</div>}
          </div>
        </div>
      )}

      {/* ВРЕМЕНА */}
      {tab==='times' && (
        <div>
          <Sec title="📞 1. Комуникация">
            <Row>
              <Field label="Консултация с клиент (мин)" value={times.consultation_min} onChange={v=>setT('consultation_min',v)} />
              <Field label="Изготвяне на оферта (мин)" value={times.offer_preparation_min} onChange={v=>setT('offer_preparation_min',v)} />
              <Field label="Последваща комуникация (мин)" value={times.followup_min} onChange={v=>setT('followup_min',v)} />
            </Row>
          </Sec>

          <Sec title="📋 2. Подготовка на поръчката">
            <Row>
              <Field label="Проверка на наличности (мин)" value={times.stock_check_min} onChange={v=>setT('stock_check_min',v)} />
              <Field label="Поръчка на материали (мин)" value={times.order_min} onChange={v=>setT('order_min',v)} />
              <Field label="Получаване на доставка (мин)" value={times.delivery_receive_min} onChange={v=>setT('delivery_receive_min',v)} />
            </Row>
          </Sec>

          <Sec title="🏠 3. Подготовка вкъщи/студио">
            <Row>
              <Field label="Сортиране балони (мин)" value={times.sorting_min} onChange={v=>setT('sorting_min',v)} />
              <Field label="Изработка на надписи (мин)" value={times.making_signs_min} onChange={v=>setT('making_signs_min',v)} />
              <Field label="Изработка букети/цветя (мин)" value={times.making_flowers_min} onChange={v=>setT('making_flowers_min',v)} />
            </Row>
            <Row>
              <Field label="Stuffing — балон в балон (сек/балон)" value={times.stuffing_sec_per_balloon} onChange={v=>setT('stuffing_sec_per_balloon',v)} />
              <Field label="Сглобяване на кластър (сек/кластър)" value={times.cluster_assembly_sec} onChange={v=>setT('cluster_assembly_sec',v)} />
              <Field label="Зареждане на кола (мин)" value={times.car_loading_min} onChange={v=>setT('car_loading_min',v)} />
            </Row>
          </Sec>

          <Sec title="📍 4. Монтаж на локация">
            <Row>
              <Field label="Разопаковане (мин)" value={times.unpacking_min} onChange={v=>setT('unpacking_min',v)} />
              <Field label="Подготовка на пространство (мин)" value={times.space_prep_min} onChange={v=>setT('space_prep_min',v)} />
              <Field label="Сглобяване на арка (мин)" value={times.arch_assembly_min} onChange={v=>setT('arch_assembly_min',v)} />
            </Row>
            <Row>
              <Field label="Поставяне на покривало (мин)" value={times.cover_placement_min} onChange={v=>setT('cover_placement_min',v)} />
              <Field label="Позициониране на арки (мин)" value={times.arch_positioning_min} onChange={v=>setT('arch_positioning_min',v)} />
              <Field label="Закачане кластър на арка (сек/кластър)" value={times.cluster_attachment_sec} onChange={v=>setT('cluster_attachment_sec',v)} />
            </Row>
            <Row>
              <Field label="Надписи и фигури (мин)" value={times.signs_figures_min} onChange={v=>setT('signs_figures_min',v)} />
              <Field label="Финални корекции (мин)" value={times.final_corrections_min} onChange={v=>setT('final_corrections_min',v)} />
              <Field label="Снимки (мин)" value={times.photo_time_min} onChange={v=>setT('photo_time_min',v)} />
            </Row>
          </Sec>

          <Sec title="📦 5. Демонтаж и буфери">
            <Row>
              <Field label="Демонтаж (% от монтажа)" value={times.dismantling_percent} onChange={v=>setT('dismantling_percent',v)} />
              <Field label="Буфер преди тръгване (мин)" value={times.buffer_before_min} onChange={v=>setT('buffer_before_min',v)} />
              <Field label="Буфер преди събитие (мин)" value={times.buffer_finish_min} onChange={v=>setT('buffer_finish_min',v)} />
            </Row>
          </Sec>

          <button onClick={saveTimes} disabled={saving} style={{padding:'12px 24px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14}}>
            {saving?'⏳ Записва...':'💾 Запази настройките'}
          </button>
        </div>
      )}

      {/* ФИНАНСИ */}
      {tab==='finances' && (
        <div>
          <Sec title="💼 Почасови ставки (€/ч)">
            <Row>
              <Field label="Надуване и сглобяване" value={finances.rate_inflation} onChange={v=>setF('rate_inflation',v)} step={0.5} />
              <Field label="Монтаж на локация" value={finances.rate_installation} onChange={v=>setF('rate_installation',v)} step={0.5} />
              <Field label="Демонтаж" value={finances.rate_dismantling} onChange={v=>setF('rate_dismantling',v)} step={0.5} />
            </Row>
            <Row>
              <Field label="Консултация и комуникация" value={finances.rate_consultation} onChange={v=>setF('rate_consultation',v)} step={0.5} />
              <Field label="Подготовка и поръчки" value={finances.rate_preparation} onChange={v=>setF('rate_preparation',v)} step={0.5} />
            </Row>
          </Sec>

          <Sec title="🚗 Транспорт">
            <Row>
              <Field label="Гориво (€/100км)" value={finances.fuel_per_100km} onChange={v=>setF('fuel_per_100km',v)} step={0.1} />
              <Field label="Цена гориво (€/л)" value={finances.fuel_price_per_liter} onChange={v=>setF('fuel_price_per_liter',v)} step={0.05} />
              <Field label="Амортизация кола (€/км)" value={finances.amort_per_km} onChange={v=>setF('amort_per_km',v)} step={0.05} />
            </Row>
          </Sec>

          <Sec title="📦 Консумативи и режийни">
            <Row>
              <Field label="Консумативи/събитие (€)" value={finances.consumables_per_event} onChange={v=>setF('consumables_per_event',v)} step={0.5} />
              <Field label="Режийни/събитие (€)" value={finances.overhead_per_event} onChange={v=>setF('overhead_per_event',v)} step={0.5} />
            </Row>
          </Sec>

          <Sec title="⚠️ Буфер за дефектни балони (%)">
            <Row>
              <Field label='Малки балони (5")' value={finances.defect_buffer_small} onChange={v=>setF('defect_buffer_small',v)} />
              <Field label='Средни балони (10"-12")' value={finances.defect_buffer_medium} onChange={v=>setF('defect_buffer_medium',v)} />
              <Field label='Големи балони (16"+)' value={finances.defect_buffer_large} onChange={v=>setF('defect_buffer_large',v)} />
            </Row>
          </Sec>

          <button onClick={saveFinances} disabled={saving} style={{padding:'12px 24px', background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)', border:'none', borderRadius:12, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14}}>
            {saving?'⏳ Записва...':'💾 Запази настройките'}
          </button>
        </div>
      )}
      {/* ШАБЛОНИ КЛАСТРИ */}
      {tab==='templates' && (
        <div>
          <Sec title="🔗 Шаблони на кластри">
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 1fr auto',gap:8,marginBottom:8}}>
              {['Ime','Размер "','Бр/кластър','5" балони','Бр 5"','18" балон','Stuffing %',''].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:700,color:'#81BFB7',textTransform:'uppercase',letterSpacing:1}}>{h}</div>
              ))}
            </div>
            {clusterTemplates.map(ct=>(
              <div key={ct.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 1fr auto',gap:8,marginBottom:8,alignItems:'center',padding:'8px',background:'#F0F9F8',borderRadius:10}}>
                <input style={inp} type="text" value={ct.name||''} onChange={e=>{
                  setClusterTemplates(p=>p.map(x=>x.id===ct.id?{...x,name:e.target.value}:x))
                  supabase.from('cluster_templates').update({name:e.target.value}).eq('id',ct.id)
                }} />
                <select style={inp} value={ct.main_size_inch||10} onChange={e=>{
                  const v = +e.target.value
                  setClusterTemplates(p=>p.map(x=>x.id===ct.id?{...x,main_size_inch:v}:x))
                  supabase.from('cluster_templates').update({main_size_inch:v}).eq('id',ct.id)
                }}>
                  {[5,10,11,12,16,18,24,36].map(s=><option key={s} value={s}>{s}"</option>)}
                </select>
                <select style={inp} value={ct.main_per_cluster||4} onChange={e=>{
                  const v = +e.target.value
                  setClusterTemplates(p=>p.map(x=>x.id===ct.id?{...x,main_per_cluster:v}:x))
                  supabase.from('cluster_templates').update({main_per_cluster:v}).eq('id',ct.id)
                }}>
                  {[2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <input type="checkbox" checked={ct.has_small||false} onChange={e=>{
                    const v = e.target.checked
                    setClusterTemplates(p=>p.map(x=>x.id===ct.id?{...x,has_small:v}:x))
                    supabase.from('cluster_templates').update({has_small:v}).eq('id',ct.id)
                  }} style={{width:18,height:18,accentColor:'#F3A2BE',cursor:'pointer'}} />
                </div>
                <input style={inp} type="number" min={0} disabled={!ct.has_small} value={ct.small_per_cluster||0} onChange={e=>{
                  const v = +e.target.value
                  setClusterTemplates(p=>p.map(x=>x.id===ct.id?{...x,small_per_cluster:v}:x))
                  supabase.from('cluster_templates').update({small_per_cluster:v}).eq('id',ct.id)
                }} />
                <div style={{display:'flex',justifyContent:'center'}}>
                  <input type="checkbox" checked={ct.has_large||false} onChange={e=>{
                    const v = e.target.checked
                    setClusterTemplates(p=>p.map(x=>x.id===ct.id?{...x,has_large:v}:x))
                    supabase.from('cluster_templates').update({has_large:v}).eq('id',ct.id)
                  }} style={{width:18,height:18,accentColor:'#F3A2BE',cursor:'pointer'}} />
                </div>
                <input style={inp} type="number" min={0} max={100} value={ct.stuffing_percent||0} onChange={e=>{
                  const v = +e.target.value
                  setClusterTemplates(p=>p.map(x=>x.id===ct.id?{...x,stuffing_percent:v}:x))
                  supabase.from('cluster_templates').update({stuffing_percent:v}).eq('id',ct.id)
                }} />
                <button onClick={async()=>{
                  if (!window.confirm('Изтрий шаблона?')) return
                  await supabase.from('cluster_templates').delete().eq('id',ct.id)
                  setClusterTemplates(p=>p.filter(x=>x.id!==ct.id))
                }} style={{background:'none',border:'none',color:'#F3A2BE',cursor:'pointer',fontSize:20}}>×</button>
              </div>
            ))}
            {clusterTemplates.length===0 && <div style={{fontSize:12,color:'#81BFB7',textAlign:'center',padding:24}}>Няма шаблони</div>}
            <button onClick={async()=>{
              const {data} = await supabase.from('cluster_templates').insert([{name:'Нов шаблон',main_size_inch:10,main_per_cluster:4,has_small:false,small_per_cluster:2,has_large:false,large_per_cluster:1,stuffing_percent:0}]).select()
              if (data?.[0]) setClusterTemplates(p=>[...p,data[0]])
            }} style={{padding:'10px 20px',background:'linear-gradient(135deg,#FFD3DD,#F3A2BE)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer',marginTop:8}}>
              + Добави шаблон
            </button>
          </Sec>
        </div>
      )}  
      {/* ОБОРУДВАНЕ */}
      {tab==='equipment' && (
        <div>
          <Sec title="📦 Собствено оборудване и амортизация">
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto', gap:8, marginBottom:8}}>
              {['Артикул','Цена (€)','Употреби','€/събитие','Категория',''].map(h=>(
                <div key={h} style={{fontSize:10, fontWeight:700, color:'#81BFB7', textTransform:'uppercase', letterSpacing:1}}>{h}</div>
              ))}
            </div>
            {equipment.map(eq=>(
              <div key={eq.id} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto', gap:8, marginBottom:8, alignItems:'center', padding:'8px', background:'#F0F9F8', borderRadius:10}}>
                <input style={inp} type="text" value={eq.name||''} onChange={e=>updateEquipment(eq.id,'name',e.target.value)} />
                <input style={inp} type="number" min={0} step={1} value={eq.purchase_price||0} onChange={e=>updateEquipment(eq.id,'purchase_price',+e.target.value)} />
                <input style={inp} type="number" min={1} step={1} value={eq.expected_uses||100} onChange={e=>updateEquipment(eq.id,'expected_uses',+e.target.value)} />
                <div style={{padding:'10px 13px', background:'#FFD3DD', borderRadius:8, fontWeight:700, color:'#3a2a35', fontSize:13, textAlign:'center'}}>
                  €{((eq.purchase_price||0)/(eq.expected_uses||100)).toFixed(2)}
                </div>
                <select style={inp} value={eq.category||'own'} onChange={e=>updateEquipment(eq.id,'category',e.target.value)}>
                  <option value="own">Собствено</option>
                  <option value="rental">Под наем</option>
                </select>
                <button onClick={()=>deleteEquipment(eq.id)} style={{background:'none', border:'none', color:'#F3A2BE', cursor:'pointer', fontSize:20}}>×</button>
              </div>
            ))}
            {equipment.length===0 && <div style={{fontSize:12, color:'#81BFB7', textAlign:'center', padding:24}}>Няма оборудване — добави!</div>}
            <button onClick={addEquipment} style={{padding:'10px 20px', background:'linear-gradient(135deg,#C6E6E3,#81BFB7)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer', marginTop:8}}>
              + Добави оборудване
            </button>
          </Sec>

          <Sec title="📊 Обща амортизация на събитие">
            <div style={{fontSize:20, fontWeight:900, color:'#F3A2BE'}}>
              €{equipment.filter(e=>e.category==='own').reduce((s,e)=>(s+(e.purchase_price||0)/(e.expected_uses||100)),0).toFixed(2)}
              <span style={{fontSize:12, color:'#81BFB7', fontWeight:400, marginLeft:8}}>на събитие (собствено оборудване)</span>
            </div>
          </Sec>
        </div>
      )}
    </div>
  )
}