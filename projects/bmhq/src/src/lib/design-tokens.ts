export const colors = {
  bg: "#0A0A0A",
  surface: "#111111",
  border: "#1A1A1A",
  hover: "rgba(255, 255, 255, 0.04)",
  active: "rgba(255, 255, 255, 0.06)",
  text: {
    primary: "rgba(255, 255, 255, 0.9)",
    secondary: "rgba(255, 255, 255, 0.5)",
    tertiary: "rgba(255, 255, 255, 0.3)",
  },
} as const;

export const typography = {
  fontFamily: {
    body: "Inter, system-ui, -apple-system, sans-serif",
    heading: "Inter, system-ui, -apple-system, sans-serif",
    mono: "JetBrains Mono, Consolas, Monaco, monospace",
  },
  fontSize: {
    xs: "0.6875rem", // 11px
    sm: "0.8125rem", // 13px
    base: "0.875rem", // 14px
    lg: "1rem",
    xl: "1.125rem",
    "2xl": "1.25rem",
    "3xl": "1.5rem",
    stat: "1.5rem", // 24px for stat values
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  32: "128px",
  40: "160px",
} as const;
