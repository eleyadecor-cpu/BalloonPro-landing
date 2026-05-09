import React from 'react'

export const FONT_SCRIPT = "'TT Lovelies Script','Monotype Corsiva',cursive"
export const FONT_SERIF  = "'Playfair Display',Georgia,serif"
export const FONT_SANS   = "'DM Sans',system-ui,sans-serif"

export const C = {
  // Cotton Candy палитра
  l50:  '#F0F9F8',   // Candy Floss — фон
  l100: '#FFD3DD',   // Cotton Candy — светли елементи
  l200: '#FFD3DD',
  l300: '#F3A2BE',   // Bubble Gum — акцент
  l400: '#F3A2BE',
  l500: '#F3A2BE',
  l600: '#C6E6E3',   // Mint — вторичен акцент
  l700: '#81BFB7',   // Wintergreen — тъмен акцент
  l800: '#3a2a35',   // Тъмен текст
  l900: '#2a1a25',
  blush: '#FFD3DD', blushD: '#F3A2BE',
  gray: '#81BFB7', ink: '#3a2a35', white: '#ffffff',
  // Удобни имена
  pink:  '#F3A2BE',
  mint:  '#81BFB7',
  mintL: '#C6E6E3',
  candy: '#FFD3DD',
  floss: '#F0F9F8',
  dark:  '#3a2a35',
}

export const card = {
  background: 'rgba(255,255,255,0.75)',
  border: '1px solid rgba(243,162,190,0.3)',
  padding: '20px 22px',
  marginBottom: 14,
  backdropFilter: 'blur(4px)',
}

export const inp = {
  width: '100%', padding: '10px 13px',
  border: '1px solid #C6E6E3', borderRadius: 0,
  fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500,
  color: '#3a2a35', background: '#F0F9F8', outline: 'none',
  boxSizing: 'border-box',
}

export const lbl = {
  display: 'block', fontSize: 10, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '.8px',
  color: '#81BFB7', marginBottom: 6,
}

export function pill(active, color='#F3A2BE') {
  return {
    padding: '7px 15px', border: `1px solid ${active ? color : '#C6E6E3'}`,
    background: active ? color : '#fff',
    color: active ? '#fff' : '#81BFB7',
    fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', borderRadius: 0,
  }
}

export function pillLight(active, color='#F3A2BE') {
  return {
    padding: '7px 15px', border: `1px solid ${active ? color : '#C6E6E3'}`,
    background: active ? color : '#fff',
    color: active ? '#fff' : '#81BFB7',
    fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', borderRadius: 0,
  }
}

export function Lbl({children}) {
  return <label style={lbl}>{children}</label>
}

export function CardTitle({children}) {
  return (
    <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',color:'#F3A2BE',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
      {children}
      <span style={{flex:1,height:1,background:'#C6E6E3',display:'block'}} />
    </div>
  )
}

export function ScriptH({text, sub}) {
  return (
    <div style={{marginBottom:22}}>
      <div style={{fontFamily:FONT_SCRIPT,fontSize:36,color:'#3a2a35',lineHeight:1.1}}>{text}</div>
      {sub && <div style={{fontSize:11,color:'#81BFB7',marginTop:4}}>{sub}</div>}
    </div>
  )
}

export function Card({children, style}) {
  return <div style={{...card,...style}}>{children}</div>
}

export function InfoBand({children, color='#F3A2BE', bg}) {
  return (
    <div style={{background:bg||'#FFD3DD',padding:'10px 16px',fontSize:11,color,marginBottom:14}}>
      {children}
    </div>
  )
}

export function SzBtn({inch, cm, active, onClick}) {
  return (
    <button style={pillLight(active)} onClick={onClick}>
      {inch}" <span style={{fontSize:10,opacity:.7}}>({cm}см)</span>
    </button>
  )
}

export const BALLOON_SIZES = [
  {inch:5,cm:13},{inch:6,cm:15},{inch:9,cm:23},{inch:10,cm:26},
  {inch:11,cm:28},{inch:12,cm:30},{inch:16,cm:41},{inch:18,cm:46},
  {inch:24,cm:61},{inch:36,cm:91},
]

export const MANUFACTURERS = {
  gemar:    {name:'Gemar',flag:'🇮🇹',series:{pastello:'Pastello (Пастел)',metal:'Metal (Металик)',crystal:'Crystal (Хром)',perl:'Pearl (Перлен)'}},
  sempertex:{name:'Sempertex',flag:'🇨🇴',series:{deluxe:'Deluxe (Пастел)',reflex:'Reflex (Металик)',chrome:'Chrome (Хром)'}},
  qualatex: {name:'Qualatex',flag:'🇺🇸',series:{standard:'Standard (Пастел)',jewel:'Jewel (Наситен)',chrome:'Chrome (Огледален)'}},
  belbal:   {name:'Belbal',flag:'🇧🇪',series:{pastel:'Pastel (Пастел)',pearl:'Pearl (Перлен)',crystal:'Crystal (Хром)',metal:'Metal (Металик)'}},
  amscan:   {name:'Amscan',flag:'🌍',series:{fashion:'Fashion (Пастел)',metallic:'Metallic (Металик)'}},
  manual:   {name:'Въведи ръчно',flag:'✏️',series:{}},
}

export const DENSITY = {
  sparse:   {label:'Рядко',     factor:0.85},
  standard: {label:'Стандартно',factor:1.0},
  dense:    {label:'Плътно',    factor:1.2},
  organic:  {label:'Органик',   factor:1.5},
}

export const TEMPO_PRESETS = {
  beginner: {label:'Начинаещ', pair10:28,pair5:32,b18:38,asm:28},
  medium:   {label:'Средно',   pair10:22,pair5:26,b18:30,asm:22},
  advanced: {label:'Напреднал',pair10:15,pair5:19,b18:22,asm:15},
}

export const FOIL_SIZES = [
  {label:'9" мини',        inch:9, cm:23,timeMin:1},
  {label:'18" стандартен', inch:18,cm:46,timeMin:2},
  {label:'24" голям',      inch:24,cm:61,timeMin:3},
  {label:'32" джъмбо',     inch:32,cm:81,timeMin:4},
  {label:'36" гигант',     inch:36,cm:91,timeMin:5},
  {label:'Цифра/Буква',    inch:34,cm:86,timeMin:3},
]

export function fmt(secs) {
  if (!secs||secs<=0) return '0мин'
  const h=Math.floor(secs/3600), m=Math.ceil((secs%3600)/60)
  if (h===0) return `${m}мин`
  if (m===0) return `${h}ч`
  return `${h}ч ${m}мин`
}

export function addMins(dateStr, timeStr, addMinutes) {
  if (!timeStr) return '—'
  const [h,m] = timeStr.split(':').map(Number)
  let total = h*60 + m + addMinutes
  const dayOffset = Math.floor(((total%1440)+1440)/1440)-1+(total<0?-1:0)
  total = ((total%1440)+1440)%1440
  const nh=Math.floor(total/60), nm=total%60
  const ts=`${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`
  if (dayOffset!==0 && dateStr) {
    try {
      const d=new Date(dateStr); d.setDate(d.getDate()+dayOffset)
      return `${d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})} ${ts}`
    } catch(e) { return ts }
  }
  return ts
}

export function calcClusters(lengthCm, diamCm, perCluster, densityFactor) {
  if (!diamCm||diamCm<=0) return 0
  return Math.ceil((lengthCm/diamCm)*4.8*densityFactor/perCluster)
}

export function calcArchPerimeter(arch) {
  const {type,width:w,height:h,coverage} = arch
  if (type==='round') {
    const r={full:1,'1h':0.5,'1/2h':0.25,'1/3h':0.17}
    return Math.PI*w*(r[coverage]||0.5)
  }
  if (type==='rect') {
    const fn={full:(h,w)=>2*h+w,'2h':(h)=>2*h,'1h':(h)=>h,'1/2h':(h)=>h/2,'1/3h':(h)=>h/3,'1w':(_,w)=>w,'1/2w':(_,w)=>w/2,'1/3w':(_,w)=>w/3}
    return (fn[coverage]||fn.full)(h,w)
  }
  const a=w/2,b=h/2
  const full=Math.PI*(3*(a+b)-Math.sqrt((3*a+b)*(a+3*b)))
  const r={full:1,'2h':0.5,'1h':0.35,'1/2h':0.25,'1/3h':0.17,'1w':0.25,'1/2w':0.15,'1/3w':0.1}
  return full*(r[coverage]||0.5)
}

export function DateInput({value,onChange,style}) {
  const toDisp = v => v?v.split('-').reverse().join('.'):'';
  const [raw,setRaw] = React.useState(toDisp(value))
  React.useEffect(()=>{setRaw(toDisp(value))},[value])
  const handle = e => {
    let v=e.target.value.replace(/[^0-9.]/g,'')
    if (v.length===2&&!v.includes('.')&&raw.length<v.length) v+='.'
    if (v.length===5&&v.split('.').length===2&&raw.length<v.length) v+='.'
    setRaw(v)
    const p=v.split('.')
    if (p.length===3&&p[2].length===4) {
      const iso=`${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
      if (!isNaN(new Date(iso).getTime())) onChange(iso)
    }
  }
  return <input style={style} value={raw} onChange={handle} placeholder="дд.мм.гггг" maxLength={10} inputMode="numeric" />
}

export function TimeInput({value,onChange,style}) {
  const [raw,setRaw] = React.useState(value||'')
  React.useEffect(()=>{setRaw(value||'')},[value])
  const handle = e => {
    let v=e.target.value.replace(/[^0-9:]/g,'')
    if (v.length===2&&!v.includes(':')&&raw.length<v.length) v+=':'
    setRaw(v)
    if (/^\d{2}:\d{2}$/.test(v)) {
      const [h,m]=v.split(':').map(Number)
      if (h<=23&&m<=59) onChange(v)
    }
  }
  return <input style={style} value={raw} onChange={handle} placeholder="чч:мм" maxLength={5} inputMode="numeric" />
}