---
name: Clash Royale Re-theme
overview: Re-theme the entire website from purple/black/gold to Clash Royale's blue/grey/gold color scheme, replace fonts with Clash Royale fonts, and integrate assets from the Supercell fankit. All functionality remains unchanged - only visual styling updates.
todos: []
---

# Clash Royale Re-theme Implementation Plan

## Overview

Transform the visual theme from purple/black/gold to Clash Royale's signature blue/grey/gold palette while maintaining all existing functionality. Replace Plus Jakarta Sans with Clash Royale fonts and integrate fankit assets.

## Phase 1: Asset Integration & Font Setup

### 1.1 Available Assets (Already in `public/assets/`)

**Images:**

- `images/backgrounds/bg.png` - Blue diamond pattern (tileable background)
- `images/buttons/button.png` - Button asset for CTAs
- `images/header_icon/image.png` - Not used in this re-theme
- `images/Blue_Crown/image.png` - Blue crown icon (rankings, achievements)
- `images/Red_crown/image.png` - Red crown icon (alternate rankings)
- `images/XP/image.png` - XP/experience icon
- `images/player_cards/image.png` - Player card asset
- `images/default_profile/image.png` - Default profile picture (295KB)
- `images/hog_rider_think/image.png` - Character image (decorative)

**Animated GIFs (Stickers):**

- `stickers/swipe up.gif` - Swipe up indicator
- `stickers/Clash Royale Sticker Sticker by Clash Stars ES.gif` (and variants 1-4) - Celebration stickers
- `stickers/Clash Royale Win Sticker by Clash Stars ES.gif` - Win celebration

**Fonts:**

- `fonts/Clash_Bold.otf` - Bold weight
- `fonts/Clash_Regular.otf` - Regular weight

### 1.2 Asset Usage Strategy

**Background Image:**

- Apply `bg.png` to hero sections, page backgrounds, and card backgrounds
- Use as tileable pattern with appropriate opacity/overlay
- Replace current gradient backgrounds in Hero, RankingsHero, CallToAction

**Default Profile Picture:**

- Replace dicebear.com avatar fallbacks with `/assets/images/default_profile/image.png`
- Update `ProfileCard.tsx` and `PlayersTable.tsx` to use default profile
- Update `RoyaleRankings.tsx` leaderboard preview

**Crown Icons:**

- Use `Blue_Crown/image.png` for top rankings (#1 positions)
- Use `Red_crown/image.png` for secondary highlights
- Replace Lucide Crown icons in rankings tables

**Button Asset:**

- Apply `buttons/button.png` as background for primary CTAs
- Maintain text overlay and hover states
- Use in Hero, CallToAction, Auth forms

**Sticker GIFs (Decorative):**

- Embed celebration stickers seamlessly as decorative elements throughout pages
- Use `swipe up.gif` on landing page hero section as scroll indicator (positioned at bottom of hero)
- Integrate sticker GIFs naturally into page layouts (Features, Roadmap, Rankings sections)
- Use appropriate sticker variants for different sections to add visual interest
- Ensure GIFs blend naturally with page design without disrupting content flow

**XP Icon:**

- Use for power level

### 1.3 Font Configuration

- Set up `@font-face` declarations in `app/globals.css` for Clash_Bold and Clash_Regular
- Configure font weights (400 for Regular, 700 for Bold)
- Add fallback fonts (sans-serif)
- Update font-family CSS variable

## Phase 2: Color Scheme Migration

### 2.1 Color Palette Definition

Official Clash Royale color scheme:

- **Primary Blue**: `#003DA5` (Royal Blue) - replaces `#4717F6` (purple)
- Used for primary actions, highlights, borders, and key UI elements
- **Secondary Blue**: `#2D85F3` (Supercell Blue) - replaces `#350ec9` (purple hover)
- Used for hover states, secondary actions, and accent elements
- **Gold**: `#FFD700` (keep existing)
- Used for rankings, achievements, and premium highlights
- **Background Dark**: `#0A1628` or `#0F1B2E` (blue-tinted dark) - replaces `#0D0D0D`
- Main page background with subtle blue tint
- **Card Background**: `#1A2332` (blue-tinted) - replaces `#121212`
- Card and container backgrounds
- **Grey Accents**: `#64748B` or `#475569` (slate greys) - for text/secondary elements
- Secondary text, borders, and subtle UI elements

### 2.2 Global Styles Update

Update `app/globals.css`:

- Replace purple in `.bg-hero-glow` with blue gradient
- Update `.text-gradient-gold` (keep as is)
- Update `.glass` background to blue-tinted dark
- Update `::selection` colors from purple to blue
- Update `.bg-card-gradient` to blue-tinted gradient

### 2.3 Component Color Replacements

Systematically replace purple colors with Clash Royale blues:

- `#4717F6` → `#003DA5` (Primary Blue - Royal Blue)
- `#350ec9` → `#2D85F3` (Secondary Blue - Supercell Blue for hovers)

Apply across:

- `components/landing/` - Hero, Navigation, Features, Roadmap, CallToAction, etc.
- `components/auth/` - LoginForm, SignUpForm, AuthLayout, verification components
- `components/rankings/` - RankingsHero, CampusesTable, PlayersTable, RankingsControls
- `components/profile/` - ProfileCard
- `app/` - page components, auth pages, profile page

### 2.4 Brand Guidelines Update

Update `.cursor/rules/components-ui/RULE.md`:

- Replace purple color references with Clash Royale blues
- Update primary color from `#4717F6` to `#003DA5` (Royal Blue)
- Update hover color from `#350ec9` to `#2D85F3` (Supercell Blue)
- Update canonical button styles with new blue colors:
- Primary CTA: `bg-[#003DA5] hover:bg-[#2D85F3]`
- Update shadow colors to match blue theme
- Update color documentation with official Clash Royale palette

## Phase 3: Typography Migration

### 3.1 Font Setup

- Add `@font-face` declarations in `app/globals.css` for Clash fonts
- Configure font variables and weights

### 3.2 Layout Update

Update `app/layout.tsx`:

- Remove Plus Jakarta Sans import
- Add Clash font family configuration
- Update body className to use Clash fonts

### 3.3 Component Font Updates

- All components will automatically inherit new font from layout
- Verify font rendering across all text elements

## Phase 4: Asset Integration (Detailed)

### 4.1 Background Integration

**Hero Section (`components/landing/Hero.tsx`):**

- Replace grid pattern with `bg.png` as background image
- Apply with appropriate opacity and overlay
- Maintain existing glow effects with blue colors

**Rankings Hero (`components/rankings/RankingsHero.tsx`):**

- Apply `bg.png` background pattern
- Update glow effect to blue

**Call to Action (`components/landing/CallToAction.tsx`):**

- Replace purple background glow with `bg.png` pattern
- Adjust opacity for readability

**Page Backgrounds:**

- Apply `bg.png` to main page containers where appropriate
- Use as subtle texture overlay

### 4.2 Profile Image Integration

**ProfileCard (`components/profile/ProfileCard.tsx`):**

- Update `getSafeAvatarUrl` fallback to use `/assets/images/default_profile/image.png`
- Replace gradient initial fallback with default profile image

**PlayersTable (`components/rankings/PlayersTable.tsx`):**

- Replace dicebear.com avatars with default profile when no avatar exists
- Update Image src fallback logic

**RoyaleRankings (`components/landing/RoyaleRankings.tsx`):**

- Update leaderboard preview avatars to use default profile fallback

### 4.3 Crown Icon Integration

**CampusesTable (`components/rankings/CampusesTable.tsx`):**

- Replace Lucide Crown with `Blue_Crown/image.png` for rank #1
- Use Image component with proper sizing

**PlayersTable (`components/rankings/PlayersTable.tsx`):**

- Use crown icons for top 3 rankings
- Apply blue crown for #1, red crown for #2-3 if desired

**Navigation (`components/landing/Navigation.tsx`):**

- Keep existing Crown icon (header_icon not used in this re-theme)

### 4.4 Button Asset Integration

**Primary CTAs:**

- Apply `buttons/button.png` as background-image for primary buttons
- Maintain text overlay and accessibility
- Update Hero, CallToAction, Auth forms
- Preserve hover states with CSS transforms/opacity

### 4.5 Sticker GIF Integration (Decorative)

**Landing Page Hero (`components/landing/Hero.tsx`):**

- Embed `swipe up.gif` at bottom of hero section as scroll indicator
- Position absolutely at bottom center with appropriate spacing
- Add smooth fade-in animation on page load
- Make it subtle and non-intrusive

**Decorative Sticker Placement:**

- Embed sticker GIFs naturally throughout landing page sections
- Use in Features section as subtle decorative elements
- Add to Roadmap section for visual interest
- Place in Rankings preview section
- Ensure stickers are positioned to complement content, not distract
- Use different sticker variants across sections for variety
- Apply appropriate opacity/blend modes for seamless integration

**Verification & Profile:**

- Consider adding celebration stickers to verification success states
- Use stickers in profile achievements section if applicable
- Ensure all GIFs are optimized and load efficiently

## Phase 5: Email Templates & Documentation

### 5.1 Email Templates

Update `supabase/email-templates/`:

- `confirm-signup.html` - Replace purple with blue
- `reset-password.html` - Replace purple with blue

## Implementation Strategy

1. **Start with global styles** (`app/globals.css`, `app/layout.tsx`) - establishes foundation

- Set up Clash fonts with @font-face
- Update color variables and gradients
- Replace purple with Royal Blue (#003DA5) and Supercell Blue (#2D85F3)

2. **Update component library** - Landing components first (most visible)

- Hero section with background pattern and swipe up GIF
- Navigation, Features, Roadmap with decorative stickers

3. **Update auth components** - Secondary priority

- Replace purple with blues in forms and buttons

4. **Update rankings/profile** - Tertiary priority

- Apply blue colors, crown icons, default profile images

5. **Update email templates** - Final polish

- Replace purple with Royal Blue in email HTML

6. **Update documentation** - Keep docs in sync

## Color Usage Reference

**Primary Blue (#003DA5 - Royal Blue):**

- Primary buttons and CTAs
- Text highlights and accents
- Borders and focus states
- Icon colors
- Brand elements

**Secondary Blue (#2D85F3 - Supercell Blue):**

- Hover states for primary elements
- Secondary buttons and actions
- Interactive element highlights
- Link hover states

**Gold (#FFD700):**

- Rankings and achievements
- Top player indicators
- Premium highlights
- Trophy displays

## Files to Modify

### Core Theme Files

- `app/globals.css` - Global styles, colors, gradients
- `app/layout.tsx` - Font configuration
- `.cursor/rules/components-ui/RULE.md` - Brand guidelines

### Component Files (66+ instances of purple)

- `components/landing/*.tsx` (Hero, Navigation, Features, Roadmap, CallToAction, etc.)
- `components/auth/*.tsx` (LoginForm, SignUpForm, AuthLayout, verify components)
- `components/rankings/*.tsx` (RankingsHero, CampusesTable, PlayersTable, RankingsControls)
- `components/profile/*.tsx` (ProfileCard)
- `app/page.tsx`, `app/profile/page.tsx`, `app/auth/**/*.tsx`

### Email Templates

- `supabase/email-templates/confirm-signup.html`
- `supabase/email-templates/reset-password.html`

### Documentation

- `docs/gemini-card-design-prompt.md`

## Asset Integration Details

### Profile Image Default

- **Path**: `/assets/images/default_profile/image.png`
- **Usage**: Fallback for all user avatars when no profile image exists
- **Components**: ProfileCard, PlayersTable, RoyaleRankings

### Background Pattern

- **Path**: `/assets/images/backgrounds/bg.png`
- **Usage**: Tileable blue diamond pattern for hero sections and backgrounds
- **Components**: Hero, RankingsHero, CallToAction, page backgrounds

### Crown Icons

- **Blue Crown**: `/assets/images/Blue_Crown/image.png` - Top rankings
- **Red Crown**: `/assets/images/Red_crown/image.png` - Secondary highlights
- **Components**: CampusesTable, PlayersTable

### Button Asset

- **Path**: `/assets/images/buttons/button.png`
- **Usage**: Primary CTA buttons
- **Components**: Hero, CallToAction, Auth forms

### Sticker GIFs

- **Path**: `/assets/stickers/*.gif`
- **Usage**: Success celebrations, achievements
- **Components**: Verification flows, profile achievements

### Sticker GIFs (Decorative)

- **Paths**: `/assets/stickers/*.gif`
- **Usage**: Decorative elements embedded seamlessly throughout pages
- **Primary Use**: `swipe up.gif` as scroll indicator on landing page hero
- **Components**: Hero, Features, Roadmap, Rankings sections

## Testing Checklist

### Color & Typography

- [ ] All purple colors replaced with blues (66+ instances)
- [ ] Fonts render correctly (Clash Bold/Regular)
- [ ] Font fallbacks work properly
- [ ] Text remains readable with new color scheme

### Asset Integration

- [ ] Background pattern displays correctly (tileable, proper opacity)
- [ ] Default profile images load for users without avatars
- [ ] Crown icons display for top rankings
- [ ] Button assets render with proper text overlay
- [ ] Sticker GIFs animate correctly in success states
- [ ] Header icon displays in navigation

### Functionality

- [ ] All buttons maintain functionality
- [ ] Hover states work with new colors
- [ ] Image loading handles errors gracefully
- [ ] Responsive design maintained across breakpoints

### Visual Consistency

- [ ] Dark theme consistency maintained
- [ ] Gold accents remain prominent
- [ ] Blue color scheme consistent across all pages
- [ ] Primary Blue (#003DA5) and Secondary Blue (#2D85F3) used correctly