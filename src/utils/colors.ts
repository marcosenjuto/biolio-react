/**
 * Theme colors utility
 * Central place for color definitions used in canvas and other contexts where Tailwind classes can't be used
 */

export const colors = {
  // Grays
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Primary (Purple/Lavender)
  primary: {
    50: '#fef6f8',
    100: '#fdedf1',
    200: '#fcdbe5',
    300: '#f9bad1',
    400: '#f58fb3',
    500: '#BA8DE4',
    600: '#a571cc',
    700: '#8f5bb4',
    800: '#7a4d9a',
    900: '#644080',
  },
  // Secondary (Sage Green)
  secondary: {
    50: '#f7faf4',
    100: '#eff5e8',
    200: '#dfebd1',
    300: '#cfe1ba',
    400: '#c1d7a9',
    500: '#B3CB98',
    600: '#9fb986',
    700: '#8ba774',
    800: '#778f62',
    900: '#637750',
  },
  // Semantic colors
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
} as const

export type ColorKey = keyof typeof colors
