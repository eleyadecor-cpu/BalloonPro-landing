// Това са цветовете и стиловете (C)
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

export const BALLOON_SIZES = [
  { inch: 5, cm: 13, timeMin: 0.1 },
  { inch: 10, cm: 26, timeMin: 0.2 },
  { inch: 12, cm: 30, timeMin: 0.25 },
  { inch: 18, cm: 45, timeMin: 0.6 },
  { inch: 36, cm: 90, timeMin: 1.5 }
]; // <-- ТАЗИ СКОБА Е КРИТИЧНО ВАЖНА ДА Е ТУК

export const MANUFACTURERS = ['Kalisan', 'Gemar', 'Qualatex', 'Sempertex', 'Tuftex', 'Друг'];

// Функции за дизайн
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