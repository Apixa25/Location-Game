// Hunt Types for Black Bart's Gold

import { HuntTypeId } from './coin';

/**
 * Map marker visibility options
 */
export type MapMarkerType = 'exact' | 'general_area' | 'zone_only' | 'hidden';

/**
 * Vibration pattern options
 */
export type VibrationMode = 'all' | 'last_100m' | 'off';

/**
 * Hunt configuration defining how a treasure hunt works
 */
export interface HuntConfig {
  /** Unique identifier for this hunt type */
  id: HuntTypeId;
  /** Display name */
  name: string;
  /** Description of this hunt type */
  description: string;

  // Discovery Tools
  /** Whether distance meter is shown */
  show_distance: boolean;
  /** Whether compass is enabled */
  enable_compass: boolean;
  /** How the map marker appears */
  map_marker: MapMarkerType;
  /** Vibration feedback mode */
  vibration: VibrationMode;

  // Multi-find settings
  /** Whether multiple people can find this coin */
  multi_find_enabled: boolean;
  /** Maximum number of finders (for multi-find) */
  max_finders: number;

  // Timed release settings
  /** Whether coins are released over time */
  timed_release: boolean;
  /** Interval between coin releases (minutes) */
  release_interval_minutes: number;

  // Hunt duration
  /** Duration of hunt in hours (null = indefinite) */
  duration_hours: number | null;
}

/**
 * Default hunt configurations
 */
export const HUNT_CONFIGS: Record<HuntTypeId, HuntConfig> = {
  direct_navigation: {
    id: 'direct_navigation',
    name: 'Direct Navigation',
    description: 'Full guidance to the coin - perfect for beginners',
    show_distance: true,
    enable_compass: true,
    map_marker: 'exact',
    vibration: 'all',
    multi_find_enabled: false,
    max_finders: 1,
    timed_release: false,
    release_interval_minutes: 0,
    duration_hours: null,
  },
  compass_only: {
    id: 'compass_only',
    name: 'Compass Only',
    description: 'Direction without distance - more challenging',
    show_distance: false,
    enable_compass: true,
    map_marker: 'general_area',
    vibration: 'last_100m',
    multi_find_enabled: false,
    max_finders: 1,
    timed_release: false,
    release_interval_minutes: 0,
    duration_hours: null,
  },
  pure_ar: {
    id: 'pure_ar',
    name: 'Pure AR Hunt',
    description: 'See it to find it - explore and discover',
    show_distance: false,
    enable_compass: false,
    map_marker: 'hidden',
    vibration: 'all',
    multi_find_enabled: false,
    max_finders: 1,
    timed_release: false,
    release_interval_minutes: 0,
    duration_hours: null,
  },
  radar_only: {
    id: 'radar_only',
    name: 'Radar Hunt',
    description: 'Hot-cold vibration guides you',
    show_distance: false,
    enable_compass: false,
    map_marker: 'general_area',
    vibration: 'all',
    multi_find_enabled: false,
    max_finders: 1,
    timed_release: false,
    release_interval_minutes: 0,
    duration_hours: null,
  },
  timed_release: {
    id: 'timed_release',
    name: 'Timed Release',
    description: 'Coins appear over time - race to collect!',
    show_distance: true,
    enable_compass: true,
    map_marker: 'zone_only',
    vibration: 'all',
    multi_find_enabled: false,
    max_finders: 1,
    timed_release: true,
    release_interval_minutes: 1,
    duration_hours: 1,
  },
  multi_find_race: {
    id: 'multi_find_race',
    name: 'Multi-Find Race',
    description: 'Gold, Silver, Bronze - first come, best served!',
    show_distance: true,
    enable_compass: true,
    map_marker: 'exact',
    vibration: 'all',
    multi_find_enabled: true,
    max_finders: 3,
    timed_release: false,
    release_interval_minutes: 0,
    duration_hours: null,
  },
  single_find_sequential: {
    id: 'single_find_sequential',
    name: 'Sequential Find',
    description: 'Multiple coins at one spot - one per person',
    show_distance: true,
    enable_compass: true,
    map_marker: 'exact',
    vibration: 'all',
    multi_find_enabled: false,
    max_finders: 1,
    timed_release: false,
    release_interval_minutes: 0,
    duration_hours: null,
  },
};
