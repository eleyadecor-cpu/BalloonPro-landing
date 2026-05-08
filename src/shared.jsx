import React from 'react';

// Помощна функция за форматиране на валута
export const fmt = (val) => {
  return new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(val || 0);
};

// Изчисления за клъстери балони
export const calcClusters = (garlandLen, density) => {
  const densities = { low: 8, medium: 12, high: 18 };
  const balloonsPerMeter = densities[density] || 12;
  return Math.ceil(garlandLen * balloonsPerMeter);
};

// Стилизирани компоненти или константи
export const C = {
  jubilee: '#735377',
  crocus: '#a989ab',
  border: '#eee',
  gray: '#888'
};