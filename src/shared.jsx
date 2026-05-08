export const C = {
  l50: '#fdf7ff',
  l100: '#f3e8ff',
  l400: '#c084fc',
  l600: '#9333ea',
  l700: '#7e22ce',
  gray: '#6b7280'
};

export const inp = { width: '100%', padding: '10px', border: `1px solid ${C.l100}`, borderRadius: '6px', fontSize: '14px' };

export const Lbl = ({children}) => <label style={{display:'block', fontSize:11, fontWeight:700, color:C.l600, marginBottom:5, textTransform:'uppercase'}}>{children}</label>;

export const Card = ({children, style={}}) => <div style={{background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', ...style}}>{children}</div>;

export const CardTitle = ({children}) => <div style={{fontSize:13, fontWeight:700, color:C.l600, textTransform:'uppercase', marginBottom:12, letterSpacing:'0.05em'}}>{children}</div>;

export const ScriptH = ({children}) => <h2 style={{fontFamily:'serif', fontSize:28, color:C.l700, marginBottom:16}}>{children}</h2>;

export const BALLOON_SIZES = [
  { inch: 5, cm: 13, timeMin: 0.1 },
  { inch: 10, cm: 26, timeMin: 0.2 },
  { inch: 12, cm: 30, timeMin: 0.25 },
  { inch: 18, cm: 45, timeMin: 0.6 },
  { inch: 36, cm: 90, timeMin: 1.5 }
];

export const FOIL_SIZES = [
  { name: '18"', cm: 45, timeMin: 0.3 },
  { name: '36"', cm: 90, timeMin: 0.5 },
  { name: '40"', cm: 100, timeMin: 0.6 }
];

export const MANUFACTURERS = ['Kalisan', 'Gemar', 'Qualatex', 'Sempertex', 'Tuftex', 'Друг'];

export const DENSITY = {
  loose: { label: 'Рядко', value: 0.7 },
  normal: { label: 'Нормално', value: 1.0 },
  dense: { label: 'Плътно', value: 1.3 }
};

export const TEMPO_PRESETS = [
  { label: 'Бавно', bph: 40 },
  { label: 'Нормално', bph: 60 },
  { label: 'Бързо', bph: 80 }
];

export const pill = (active) => ({
  padding: '8px 15px',
  borderRadius: '20px',
  border: 'none',
  background: active ? C.l700 : C.l100,
  color: active ? '#fff' : C.l600,
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer'
});

export const pillLight = (active, color) => ({
  padding: '6px 12px',
  borderRadius: '20px',
  border: active ? `2px solid ${color}` : `1px solid #eee`,
  background: active ? `${color}15` : '#fff',
  color: active ? color : '#999',
  fontSize: '12px',
  fontWeight: active ? '700' : '400',
  cursor: 'pointer'
});