export type ColorShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

export type ColorPalette = Record<ColorShade, string>

export interface ColorPalettes {
  primary: ColorPalette
  secondary: ColorPalette
  neutral: ColorPalette
}

export interface FontConfig {
  fontFamily: string
  weights: number[]
}

export type TypeScale = Record<string, string>

export interface Typography {
  heading: FontConfig
  body: FontConfig
  mono: FontConfig
  scale: TypeScale
}

export interface SpacingConfig {
  base: number
  scale: number[]
}

export type RadiusTokens = Record<string, string>

export type ShadowTokens = Record<string, string>

export interface NavigationItem {
  label: string
  icon: string
  route: string
}

export interface SidebarConfig {
  width: string
  collapsedWidth: string
  position: 'left' | 'right'
  collapsible: boolean
  background: string
  textColor: string
}

export interface MainContentConfig {
  background: string
  maxWidth: string
  padding: string
}

export interface AppShellConfig {
  layout: string
  sidebar: SidebarConfig
  mainContent: MainContentConfig
  navigation: NavigationItem[]
}

export interface DesignSystem {
  colors: ColorPalettes
  typography: Typography
  spacing: SpacingConfig
  borderRadius: RadiusTokens
  shadows: ShadowTokens
  applicationShell: AppShellConfig
}

export const COLOR_SHADES: ColorShade[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

export const FONT_OPTIONS: string[] = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Nunito',
  'Source Sans 3',
  'JetBrains Mono',
  'Fira Code',
  'IBM Plex Mono',
]

function emptyPalette(): ColorPalette {
  return {
    '50': '#f8fafc',
    '100': '#f1f5f9',
    '200': '#e2e8f0',
    '300': '#cbd5e1',
    '400': '#94a3b8',
    '500': '#64748b',
    '600': '#475569',
    '700': '#334155',
    '800': '#1e293b',
    '900': '#0f172a',
    '950': '#020617',
  }
}

export function createEmptyDesignSystem(): DesignSystem {
  return {
    colors: {
      primary: emptyPalette(),
      secondary: emptyPalette(),
      neutral: emptyPalette(),
    },
    typography: {
      heading: { fontFamily: 'Inter', weights: [600, 700] },
      body: { fontFamily: 'Inter', weights: [400, 500] },
      mono: { fontFamily: 'JetBrains Mono', weights: [400, 500] },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
    },
    spacing: {
      base: 4,
      scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64],
    },
    borderRadius: {
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    applicationShell: {
      layout: 'sidebar',
      sidebar: {
        width: '260px',
        collapsedWidth: '64px',
        position: 'left',
        collapsible: true,
        background: 'neutral.900',
        textColor: 'neutral.200',
      },
      mainContent: {
        background: 'neutral.50',
        maxWidth: 'none',
        padding: '24px',
      },
      navigation: [],
    },
  }
}
