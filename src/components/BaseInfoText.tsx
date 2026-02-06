import { Skeleton } from '@/components/ui/skeleton';
import type { GithubProfile } from '@/services/github';
import { DecryptingText } from './DecryptingText';

interface BaseInfoTextProps {
  loading: boolean;
  profile: GithubProfile | null;
  /** Custom name font family class */
  nameFontFamily?: string;
  /** Custom name font size preset */
  nameSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  /** Custom name text (overrides GitHub profile) */
  nameText?: string;
  /** Disable name display */
  disableName?: boolean;
  /** Custom description font family class */
  descriptionFontFamily?: string;
  /** Custom description font size preset */
  descriptionSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  /** Custom description text (overrides GitHub profile) */
  descriptionText?: string;
  /** Disable description display */
  disableDescription?: boolean;
}

// Map size presets to Tailwind classes for name
const nameSizeClasses: Record<string, string> = {
  sm: 'text-3xl md:text-4xl',
  base: 'text-4xl md:text-5xl lg:text-6xl',
  lg: 'text-5xl md:text-6xl lg:text-7xl',
  xl: 'text-5xl md:text-7xl lg:text-8xl',
  '2xl': 'text-6xl md:text-7xl lg:text-8xl',
  '3xl': 'text-6xl md:text-8xl lg:text-9xl',
  '4xl': 'text-7xl md:text-8xl lg:text-9xl',
  '5xl': 'text-7xl md:text-9xl lg:text-[10rem]',
  '6xl': 'text-8xl md:text-9xl lg:text-[12rem]',
  '7xl': 'text-9xl md:text-[10rem] lg:text-[14rem]',
};

// Map size presets to Tailwind classes for description
const descriptionSizeClasses: Record<string, string> = {
  sm: 'text-sm md:text-base',
  base: 'text-base md:text-lg',
  lg: 'text-lg md:text-xl',
  xl: 'text-xl md:text-2xl',
  '2xl': 'text-2xl md:text-3xl',
};

export function BaseInfoText({
  loading,
  profile,
  nameFontFamily,
  nameSize = 'xl',
  nameText,
  disableName = false,
  descriptionFontFamily,
  descriptionSize = 'lg',
  descriptionText,
  disableDescription = false,
}: BaseInfoTextProps) {
  // DecryptingText component handles encrypted state initialization internally
  // No need for separate startDecrypt state - it shows random chars first, then reveals

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {!disableName && (
          <Skeleton className="h-14 md:h-20 w-72 md:w-96 mx-auto bg-green-900/20 rounded-lg" />
        )}
        {!disableDescription && (
          <Skeleton className="h-6 w-full max-w-xl mx-auto bg-green-900/20 rounded" />
        )}
      </div>
    );
  }

  const name = nameText || profile?.name || profile?.login || '';
  const description = descriptionText || profile?.bio || 'Developer & Creator';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Name with gradient */}
      {!disableName && (
        <h1
          className={`font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${nameFontFamily || ''} ${nameSizeClasses[nameSize] || nameSizeClasses.xl}`}
        >
          {name}
        </h1>
      )}

      {/* Bio with gradient - always show DecryptingText (shows encrypted state first, then reveals) */}
      {!disableDescription && (
        <div className={`${descriptionFontFamily || ''}`}>
          <DecryptingText
            targetText={description}
            speed={30}
            className={`font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${descriptionSizeClasses[descriptionSize] || descriptionSizeClasses.lg} text-gray-300`}
          />
        </div>
      )}
    </div>
  );
}
