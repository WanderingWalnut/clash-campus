/**
 * Type definitions for the ClashCampus landing page components.
 */

/**
 * Represents a feature card displayed in the Features section.
 */
export interface FeatureCard {
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
    /** GIF sticker path to display in the card */
    gif: string;
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
