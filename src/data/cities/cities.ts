import type { City } from '../../game/models/types';

export const CITIES: City[] = [
  {
    id: 'millbrook',
    name: 'Millbrook',
    costTier: 'low',
    rentMultiplier: 0.7,
    wageMultiplier: 0.85,
    homeValueMultiplier: 0.6,
    taxRate: 0.04,
  },
  {
    id: 'riverside',
    name: 'Riverside',
    costTier: 'low',
    rentMultiplier: 0.75,
    wageMultiplier: 0.88,
    homeValueMultiplier: 0.65,
    taxRate: 0.045,
  },
  {
    id: 'lakewood',
    name: 'Lakewood',
    costTier: 'average',
    rentMultiplier: 1.0,
    wageMultiplier: 1.0,
    homeValueMultiplier: 1.0,
    taxRate: 0.05,
  },
  {
    id: 'fairview',
    name: 'Fairview',
    costTier: 'average',
    rentMultiplier: 1.05,
    wageMultiplier: 1.02,
    homeValueMultiplier: 1.05,
    taxRate: 0.052,
  },
  {
    id: 'springdale',
    name: 'Springdale',
    costTier: 'average',
    rentMultiplier: 0.95,
    wageMultiplier: 0.98,
    homeValueMultiplier: 0.95,
    taxRate: 0.048,
  },
  {
    id: 'metro_heights',
    name: 'Metro Heights',
    costTier: 'high',
    rentMultiplier: 1.4,
    wageMultiplier: 1.2,
    homeValueMultiplier: 1.5,
    taxRate: 0.06,
  },
  {
    id: 'harbor_city',
    name: 'Harbor City',
    costTier: 'high',
    rentMultiplier: 1.5,
    wageMultiplier: 1.25,
    homeValueMultiplier: 1.6,
    taxRate: 0.065,
  },
  {
    id: 'coastal_bay',
    name: 'Coastal Bay',
    costTier: 'very_high',
    rentMultiplier: 2.0,
    wageMultiplier: 1.4,
    homeValueMultiplier: 2.2,
    taxRate: 0.075,
  },
  {
    id: 'tech_valley',
    name: 'Tech Valley',
    costTier: 'very_high',
    rentMultiplier: 2.2,
    wageMultiplier: 1.5,
    homeValueMultiplier: 2.5,
    taxRate: 0.08,
  },
];

export function getCityById(id: string): City | undefined {
  return CITIES.find(c => c.id === id);
}

export function getDefaultCity(): City {
  return CITIES.find(c => c.id === 'lakewood')!;
}
