import React from 'react'

export const C = {
  l50:'#fdf9fd',   
  l100:'#f8ecff',  // Най-светло лилаво
  l200:'#cebedc',  
  l300:'#BD97C6',  // Crocus Petal
  l400:'#805C98',  // Jubilee (основен лилав)
  l500:'#735377',  // Тъмно лилаво за бутони
  l600:'#38246a',  
  l700:'#312A44',  // Твоят най-тъмен цвят
  gray:'#7a7490', ink:'#312A44', white:'#ffffff',
}

// Помощни стилове за инпути и бутони, за да изглеждат по-модерно
export const inp = { width:'100%', padding:'12px', borderRadius:'12px', border:`1px solid ${C.l200}`, outline:'none', fontSize:'14px' }
export const pill = (sel) => ({ padding:'10px 20px', borderRadius:'12px', border:'none', background:sel?C.l500:C.l100, color:sel?'#fff':C.l500, cursor:'pointer', fontWeight:'bold', transition:'0.2s' })
export const pillLight = (sel, col) => ({ padding:'8px 12px', borderRadius:'10px', border:`1px solid ${sel?col:C.l200}`, background:sel?col+'15':'transparent', color:sel?col:C.gray, cursor:'pointer', fontSize:'12px' })
export const Lbl = ({children}) => <label style={{display:'block', fontSize:'12px', fontWeight:'800', color:C.l500, marginBottom:'8px', textTransform:'uppercase'}}>{children}</label>

export const fmt = (val) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(val || 0);

export const BALLOON_SIZES = [
  { inch: 5, cm: 13, timeMin: 0.1 },
  { inch: 10, cm: 26, timeMin: 0.2 },
  { inch: 12, cm: 30, timeMin: 0.25 },
  { inch: 18, cm: 45, timeMin: 0.6 },
  { inch: 36, cm: 90, timeMin: 1.5 }
];

export const MANUFACTURERS = ['Kalisan', 'Gemar', 'Qualatex', 'Sempertex', 'Tuftex', 'Друг'];  
