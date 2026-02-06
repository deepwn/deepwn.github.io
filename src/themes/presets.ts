/**
 * Theme Presets Configuration
 * Pre-defined visual themes to simplify customization
 */

export type ThemePreset =
  | 'default'   // GitHub-style dark theme
  | 'minimal'  // Clean, minimal dark theme
  | 'hacker'   // Terminal/console style
  | 'cyber';   // Neon cyberpunk style

export interface ThemeConfig {
  // Accent colors
  accent: {
    primary: string;      // Main accent color class
    secondary: string;    // Secondary accent
    gradient: string;     // Gradient from-to classes
  };

  // Typography colors
  colors: {
    heading: string;      // H1, H2, H3 colors
    body: string;         // Body text color
    muted: string;        // Muted/text-gray colors
  };

  // UI elements
  ui: {
    cardBg: string;       // Card background
    cardBorder: string;   // Card border
    badgeBg: string;      // Badge background
    glowColor: string;    // Glow effect color
  };

  // Background
  background: {
    main: string;        // Main background class
    gradient: string;    // Background gradient
  };
}

export const themes: Record<ThemePreset, ThemeConfig> = {
  default: {
    accent: {
      primary: 'text-emerald-400',
      secondary: 'text-green-400',
      gradient: 'from-green-400 via-emerald-400 to-blue-400',
    },
    colors: {
      heading: 'text-white',
      body: 'text-gray-300',
      muted: 'text-gray-500',
    },
    ui: {
      cardBg: 'bg-white/5',
      cardBorder: 'border-white/10',
      badgeBg: 'bg-emerald-500/20',
      glowColor: 'rgba(52, 211, 153, 0.2)',
    },
    background: {
      main: 'bg-[#0d1117]',
      gradient: '',
    },
  },

  minimal: {
    accent: {
      primary: 'text-zinc-300',
      secondary: 'text-zinc-400',
      gradient: 'from-zinc-300 to-zinc-500',
    },
    colors: {
      heading: 'text-white',
      body: 'text-gray-400',
      muted: 'text-gray-600',
    },
    ui: {
      cardBg: 'bg-transparent',
      cardBorder: 'border-white/5',
      badgeBg: 'bg-zinc-500/20',
      glowColor: 'rgba(255, 255, 255, 0.1)',
    },
    background: {
      main: 'bg-black',
      gradient: '',
    },
  },

  hacker: {
    accent: {
      primary: 'text-green-400',
      secondary: 'text-green-500',
      gradient: 'from-green-400 to-green-600',
    },
    colors: {
      heading: 'text-green-400',
      body: 'text-green-300',
      muted: 'text-green-600',
    },
    ui: {
      cardBg: 'bg-green-950/20',
      cardBorder: 'border-green-500/20',
      badgeBg: 'bg-green-500/20',
      glowColor: 'rgba(74, 222, 128, 0.3)',
    },
    background: {
      main: 'bg-[#0a0f0a]',
      gradient: '',
    },
  },

  cyber: {
    accent: {
      primary: 'text-cyan-400',
      secondary: 'text-purple-400',
      gradient: 'from-cyan-400 via-purple-400 to-pink-400',
    },
    colors: {
      heading: 'text-white',
      body: 'text-gray-300',
      muted: 'text-gray-500',
    },
    ui: {
      cardBg: 'bg-white/5',
      cardBorder: 'border-cyan-500/30',
      badgeBg: 'bg-cyan-500/20',
      glowColor: 'rgba(34, 211, 238, 0.3)',
    },
    background: {
      main: 'bg-[#0f0f1a]',
      gradient: 'bg-gradient-to-b from-purple-900/20 via-[#0f0f1a] to-cyan-900/20',
    },
  },
};

/**
 * Get theme configuration by name
 */
export function getTheme(preset: ThemePreset): ThemeConfig {
  return themes[preset] || themes.default;
}

/**
 * Get accent color class for gradient text
 */
export function getAccentGradient(preset: ThemePreset): string {
  return themes[preset].accent.gradient;
}

/**
 * Merge theme preset with overrides
 * @param preset Theme preset name
 * @param overrides Partial theme configuration to override
 * @returns Complete merged ThemeConfig
 */
export function getThemeWithOverrides(
  preset: ThemePreset,
  overrides?: Partial<ThemeConfig>
): ThemeConfig {
  const base = themes[preset] || themes.default;
  
  if (!overrides) {
    return base;
  }

  return {
    accent: {
      ...base.accent,
      ...overrides.accent,
    },
    colors: {
      ...base.colors,
      ...overrides.colors,
    },
    ui: {
      ...base.ui,
      ...overrides.ui,
    },
    background: {
      ...base.background,
      ...overrides.background,
    },
  };
}

/**
 * Get effective colors (merged with theme preset)
 */
export function getEffectiveColors(
  preset: ThemePreset,
  colorOverrides?: { accent?: string; heading?: string; body?: string; muted?: string }
): ThemeConfig['colors'] {
  const baseColors = themes[preset]?.colors || themes.default.colors;
  
  if (!colorOverrides) {
    return baseColors;
  }

  return {
    ...baseColors,
    ...colorOverrides,
  };
}

/**
 * Get effective background (merged with theme preset)
 */
export function getEffectiveBackground(
  preset: ThemePreset,
  bgOverrides?: { main?: string; gradient?: string }
): ThemeConfig['background'] {
  const baseBg = themes[preset]?.background || themes.default.background;
  
  if (!bgOverrides) {
    return baseBg;
  }

  return {
    ...baseBg,
    ...bgOverrides,
  };
}
