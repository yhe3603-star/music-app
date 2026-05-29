export const Colors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceMuted: '#171939',
  surfaceGlass: 'rgba(30, 41, 59, 0.85)',

  primary: '#7C3AED',
  secondary: '#6366F1',
  accent: '#22C55E',

  foreground: '#F8FAFC',
  textMuted: '#94A3B8',
  textDisabled: '#475569',

  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',

  destructive: '#EF4444',
  warning: '#F59E0B',

  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const Typography = {
  display: { fontSize: 28, fontWeight: 'bold' as const, color: Colors.foreground },
  title: { fontSize: 20, fontWeight: '600' as const, color: Colors.foreground },
  body: { fontSize: 16, fontWeight: 'normal' as const, color: Colors.foreground },
  caption: { fontSize: 13, fontWeight: 'normal' as const, color: Colors.textMuted },
  small: { fontSize: 12, fontWeight: 'normal' as const, color: Colors.textMuted },
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
} as const;

export const Radius = {
  sm: 8, md: 12, lg: 16, full: 9999,
} as const;
