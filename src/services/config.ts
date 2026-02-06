/**
 * Simplified App Configuration
 * 
 * Structure:
 * 1. SiteConfig - Site data control (account, website info)
 * 2. ThemeConfig - Theme selection and overrides
 * 3. SectionTitleConfig - Common title/description configuration
 * 4. SectionsConfig - Section customization (titles, descriptions, labels)
 * 5. AppConfig - Main config type combining all sections
 */

import type { ThemePreset } from '@/themes/presets';

// ============================================================================
// 1. Site Configuration - Core site data
// ============================================================================

export interface SiteConfig {
  /** GitHub username or organization name (required) */
  baseAccount: string;
  /** Account type: 'user' or 'org' */
  type?: 'user' | 'org';
  /** Website metadata */
  website?: {
    /** Browser tab title */
    title?: string;
    /** Favicon path (relative to public folder) */
    favicon?: string;
  };
}

// ============================================================================
// 2. Theme Configuration - Visual theme control
// ============================================================================

export interface ThemeConfig {
  /** Theme preset name */
  preset?: ThemePreset;
  /** Override theme colors */
  colors?: {
    accent?: string;
    heading?: string;
    body?: string;
    muted?: string;
  };
  /** Override background */
  background?: {
    main?: string;
    gradient?: string;
  };
}

// ============================================================================
// Repository Filter Configuration
// ============================================================================

export interface RepoFilterConfig {
  /** Repository names to hide */
  hidden_repos?: string[];
  /** Repository names to list instead of all */
  listing_repos?: string[];
}

// ============================================================================
// 3. Section Title Configuration
// ============================================================================

export interface SectionTitleConfig {
  /** Section title text */
  title?: string;
  /** Section subtitle/description text */
  description?: string;
  /** Custom accent color class for gradient */
  accentColor?: string;
}

// ============================================================================
// 4. Individual Section Configurations
// ============================================================================

export interface BaseSectionConfig {
  /** Enable/disable the base/hero section */
  enabled?: boolean;
  /** Custom scroll tip label */
  scrollTipLabel?: string;
  /** Custom logo image URL */
  logoSrc?: string;
  /** Logo scale/zoom level (default: 1, e.g., 0.5-2) */
  logoScale?: number;
  /** Disable logo display */
  disableLogo?: boolean;
  /** Name font family class (e.g., 'font-sans', 'font-mono', 'font-serif') */
  nameFontFamily?: string;
  /** Name font size preset (sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl) */
  nameSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  /** Custom name text (overrides GitHub profile name) */
  nameText?: string;
  /** Disable name display */
  disableName?: boolean;
  /** Description font family class */
  descriptionFontFamily?: string;
  /** Description font size preset */
  descriptionSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  /** Custom description text (overrides GitHub profile bio) */
  descriptionText?: string;
  /** Disable description display */
  disableDescription?: boolean;
}

export interface MembersSectionConfig {
  /** Enable/disable the members section */
  enabled?: boolean;
  /** Section title and description */
  title?: SectionTitleConfig;
  /** Custom member count label suffix */
  countLabel?: string;
  /** Number of hidden/secret user placeholders */
  hiddenUsers?: number;
  /** Organization owner username (for special badge) */
  owner?: string;
  /** Extra GitHub usernames to add to member list */
  appendUsers?: string[];
  /** Custom separator color class */
  separatorColor?: string;
}

export interface ProjectsSectionConfig {
  /** Enable/disable the projects section */
  enabled?: boolean;
  /** Section title and description */
  title?: SectionTitleConfig;
  /** Text shown when no projects found */
  emptyText?: string;
  /** Hide the "View All Repositories" link */
  hideViewAll?: boolean;
  /** Repository names to hide */
  hiddenRepos?: string[];
  /** Custom view all link text */
  viewAllText?: string;
}

export interface FooterSectionConfig {
  /** Enable/disable the footer */
  enabled?: boolean;
  /** Custom footer text */
  customText?: string;
  /** Hide the "Built with" attribution */
  hideBuiltWith?: boolean;
}

// ============================================================================
// 5. Main App Configuration
// ============================================================================

export interface AppConfig {
  /** Site configuration (required) */
  site: SiteConfig;
  /** Theme configuration */
  theme?: ThemeConfig;
  /** Sections configuration */
  sections?: {
    /** Base/Hero section configuration */
    base?: BaseSectionConfig;
    /** Members section configuration */
    members?: MembersSectionConfig;
    /** Projects section configuration */
    projects?: ProjectsSectionConfig;
    /** Footer section configuration */
    footer?: FooterSectionConfig;
  };
  /** Legacy configuration format for backward compatibility */
  [key: string]: unknown;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const defaultConfig: Required<AppConfig> = {
  site: {
    baseAccount: '',
    type: 'user',
    website: {
      title: 'GitHub Profile',
      favicon: '/favicon.svg',
    },
  },
  theme: {
    preset: 'default',
    colors: undefined,
    background: undefined,
  },
  sections: {
    base: {
      enabled: true,
      scrollTipLabel: 'More Info',
      logoSrc: undefined,
      logoScale: 1,
      disableLogo: false,
      nameFontFamily: undefined,
      nameSize: undefined,
      nameText: undefined,
      disableName: false,
      descriptionFontFamily: undefined,
      descriptionSize: undefined,
      descriptionText: undefined,
      disableDescription: false,
    },
    members: {
      enabled: true,
      title: {
        title: 'Group Members',
        description: 'A young, active and innovative team',
      },
      countLabel: 'members',
      hiddenUsers: 0,
      appendUsers: [],
    },
    projects: {
      enabled: true,
      title: {
        title: 'Featured Projects',
        description: 'A collection of open source work and experiments',
      },
      emptyText: 'No projects found',
      hideViewAll: false,
      hiddenRepos: [],
    },
    footer: {
      enabled: true,
      customText: '',
      hideBuiltWith: false,
    },
  },
};

// ============================================================================
// Theme Exports
// ============================================================================

export type { ThemePreset };
export { themes, getTheme, getAccentGradient } from '@/themes/presets';
