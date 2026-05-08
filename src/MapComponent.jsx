import React from 'react'
import { C, inp, Lbl } from './shared.jsx'

export default function MapComponent({ address, onDistanceCalc }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <Lbl>📍 Локация (адрес / зала / град)</Lbl>
      <input
        style={{ ...inp }}
        placeholder="напр. Зала Конгресна, Казанлък..."
        defaultValue={address}
        onChange={(e) => onDistanceCalc(e.target.value)}
      />
      <div style={{ fontSize: 10, color: C.gray, marginTop: 4 }}>
        Въведи адреса ръчно — км и минути попълни по-долу
      </div>
    </div>
  )
}