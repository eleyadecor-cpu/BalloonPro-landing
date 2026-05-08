import React, { useEffect, useRef } from 'react'

export default function MapComponent({ address, onDistanceCalc }) {
  const autoCompleteRef = useRef()
  const inputRef = useRef()

  // Тук поставяш твоя Google API Key, ако имаш такъв. 
  // Ако нямаш, ще работи в ограничен режим.
  const GOOGLE_API_KEY = "ТВОЯТ_GOOGLE_KEY_ТУК" 

  useEffect(() => {
    // Зареждаме скрипта на Google Maps динамично
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`
      script.async = true
      document.body.appendChild(script)
      script.onload = () => initAutocomplete()
    } else {
      initAutocomplete()
    }
  }, [])

  function initAutocomplete() {
    autoCompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { types: ['address'], componentRestrictions: { country: 'bg' } }
    )

    autoCompleteRef.current.addListener('place_changed', () => {
      const place = autoCompleteRef.current.getPlace()
      if (!place.geometry) return

      // Тук изчисляваме разстоянието (примерна логика)
      // В реална ситуация Google Distance Matrix API е най-добро
      console.log("Избрана локация:", place.formatted_address)
      
      // За момента подаваме фиктивни км, докато не се свърже Distance Matrix
      // Но адресът ще се попълва автоматично и точно
      onDistanceCalc(place.formatted_address)
    })
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--mauve-dark)', marginBottom: '8px' }}>
        📍 ЛОКАЦИЯ (Google Maps Търсене)
      </label>
      <input
        ref={inputRef}
        className="nav-link"
        style={{ 
          width: '100%', 
          background: 'white', 
          border: '1px solid var(--border)', 
          color: 'var(--text)',
          padding: '12px' 
        }}
        placeholder="Започни да пишеш адрес в София/България..."
        defaultValue={address}
      />
    </div>
  )
}