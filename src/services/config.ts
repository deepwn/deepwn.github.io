/**
 * App Configuration Interfaces
 * These interfaces define the structure of the config.json file
 * and are used throughout the application for customization.
 */

// Typography configuration for name display
export interface TypographyConfig {
  enabled: boolean;
  fontSize: string;
  fontSizeMd?: string;
  fontSizeLg?: string;
  color: string;
  fontWeight?: string;
  /** Vertical spacing between name and bio (default: 4) */
  spacing?: number;
  gradient?: {
    enabled: boolean;
    from: string;
    via: string;
    to: string;
  };
  glow?: {
    enabled: boolean;
    intensity: 'low' | 'medium' | 'high';
  };
  animation?: {
    enabled: boolean;
    type: 'pulse' | 'text-glow' | 'float';
  };
}

// Typography configuration for bio text
export interface BioTypographyConfig {
  enabled: boolean;
  fontSize: string;
  fontSizeMd?: string;
  color: string;
  fontWeight: string;
  /** Optional gradient for bio text */
  gradient?: {
    enabled: boolean;
    from: string;
    via?: string;
    to: string;
  };
  glow?: {
    enabled: boolean;
    intensity: 'low' | 'medium' | 'high';
  };
  animation?: {
    enabled: boolean;
    type: 'pulse' | 'text-glow' | 'float';
  };
}

// Logo configuration
export interface LogoConfig {
  enabled: boolean;
  shape: 'circle' | 'square' | 'none';
  border: boolean;
  borderColor: string;
  borderWidth: string;
  /** Custom image URL to replace GitHub avatar - if set, this image is used instead of GitHub avatar */
  src?: string;
  /** Logo link URL - if set, logo becomes clickable link */
  href?: string;
  /** Logo size scale (default: 1) - multiplier for base size, e.g., 1.5 for 1.5x size */
  scale?: number;
  onlineIndicator: {
    enabled: boolean;
    color: string;
  };
}

// Team label typography configuration
export interface TeamTypographyConfig {
  enabled: boolean;
  label: string;
  fontSize: string;
  fontSizeMd?: string;
  fontWeight: string;
  textColor: string;
  background: string;
  borderColor: string;
  indicator?: {
    enabled: boolean;
    color: string;
    animate: boolean;
  };
}

// Complete typography settings
export interface TypographySettings {
  name: TypographyConfig;
  bio: BioTypographyConfig;
  logo: LogoConfig;
  team: TeamTypographyConfig;
}

// Repository filtering configuration
export interface RepoFilterConfig {
  /** Array of repository names to hide (blacklist) - takes priority over whitelist */
  hidden_repos?: string[];
  /** Array of repository names to show (whitelist) - ignored if hidden_repos is set */
  listing_repos?: string[];
}

// Custom link button configuration
export interface CustomLink {
  /** Button label text */
  label: string;
  /** Target URL to navigate to */
  url: string;
  /** Lucide icon name (optional, without 'Icon' suffix) */
  icon?: string;
  /** Button style variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Custom color class */
  color?: string;
}

// Custom links section configuration
export interface CustomLinksConfig {
  /** Whether to show custom links section */
  enabled: boolean;
  /** Array of custom link buttons */
  links: CustomLink[];
}

// Main application configuration
export interface AppConfig {
  baseAccount: string;
  type?: 'user' | 'org';
  /** Repository filtering configuration */
  repoFilter?: RepoFilterConfig;
  /** Custom links configuration */
  customLinks?: CustomLinksConfig;
  typography?: Partial<TypographySettings>;
}
