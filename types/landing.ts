/**
 * Type definitions for the ClashCampus landing page components.
 */

/**
 * Represents a player entry displayed on the leaderboard preview.
 */
export interface LeaderboardPlayer {
    /** Position on the leaderboard */
    rank: number;
    /** Player's display name */
    name: string;
    /** Full university name */
    university: string;
    /** Abbreviated university name for mobile displays */
    universityShort: string;
    /** Player's favorite Clash Royale card */
    favoriteCard: string;
    /** Formatted trophy count string */
    trophies: string;
    /** Seed for generating avatar image */
    avatarSeed: string;
    /** Whether this player should be visually highlighted (e.g., rank 1) */
    isHighlighted: boolean;
}

/**
 * Represents a feature card displayed in the Features section.
 */
export interface FeatureCard {
    /** Lucide icon component to display */
    icon: React.ComponentType<{ className?: string; size?: number }>;
    /** Tailwind text color class for the icon */
    iconColor: string;
    /** Tailwind background color class for the icon container */
    iconBackground: string;
    /** Tailwind hover border color class */
    hoverBorder: string;
    /** Feature title */
    title: string;
    /** Feature description */
    description: string;
}

/**
 * Represents a phase in the roadmap timeline.
 */
export interface RoadmapPhase {
    /** Phase identifier (e.g., "Phase 1") */
    id: string;
    /** Current status of the phase */
    status: 'live' | 'coming-soon' | 'future';
    /** Phase title */
    title: string;
    /** Phase description */
    description: string;
}

/**
 * Navigation menu item.
 */
export interface NavItem {
    /** Display label */
    label: string;
    /** Target href (anchor or route) */
    href: string;
}

