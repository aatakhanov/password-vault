export interface ThemeColors {
  id: 'slate' | 'oled' | 'navy';
  name: string;
  bgDark: string;
  cardBg: string;
  cardBorder: string;
  textMain: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
}

export const THEMES: Record<'slate' | 'oled' | 'navy', ThemeColors> = {
  slate: {
    id: 'slate',
    name: 'Dark Slate (Klassik)',
    bgDark: '#090D16',
    cardBg: '#0F172A',
    cardBorder: '#1E293B',
    textMain: '#F8FAFC',
    textMuted: '#94A3B8',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    accent: '#38BDF8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  oled: {
    id: 'oled',
    name: 'OLED Pure Black (Batareya tejamkor)',
    bgDark: '#000000',
    cardBg: '#0A0A0A',
    cardBorder: '#1F1F1F',
    textMain: '#FFFFFF',
    textMuted: '#A1A1AA',
    primary: '#10B981',
    primaryHover: '#059669',
    accent: '#34D399',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#F87171',
  },
  navy: {
    id: 'navy',
    name: 'Midnight Navy (To\'q Ko\'k)',
    bgDark: '#020617',
    cardBg: '#0B132B',
    cardBorder: '#1C2541',
    textMain: '#F0F9FF',
    textMuted: '#7DD3FC',
    primary: '#0284C7',
    primaryHover: '#0369A1',
    accent: '#38BDF8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
};
