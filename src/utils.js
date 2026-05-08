export const fmtDate = (d) => {
  if (!d) return '—'
  const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d
}
export const today = () => new Date().toISOString().slice(0, 10)
export const eur = (n) => '€' + (+n || 0).toFixed(2)
export const eur0 = (n) => '€' + (+n || 0).toFixed(0)
export const daysFrom = (d) => {
  if (!d) return null
  return Math.ceil((new Date(d + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 864e5)
}
export const QSTATUS = {
  draft:        { l: '📝 Чернова',        cls: 'gray' },
  sent:         { l: '📤 Изпратена',      cls: 'blue' },
  seen:         { l: '👁 Видяна',         cls: 'purple' },
  soft_hold:    { l: '🟡 Мека рез.',      cls: 'yellow' },
  accepted:     { l: '✅ Потвърдена',     cls: 'green' },
  deposit_paid: { l: '💰 Депозит',        cls: 'green' },
  completed:    { l: '🏆 Приключена',     cls: 'gray' },
  cancelled:    { l: '❌ Отказана',       cls: 'red' },
}
