# Shareable Player Cards - Options & Considerations

## Overview
Create "Spotify Wrapped"-style shareable player cards that showcase Clash Royale performance stats. Players can generate and share these on Instagram, Snapchat, Twitter, etc.

---

## Available Player Data

Based on our current data structure, we have access to:

### Core Stats
- **Trophies**: Current trophies, best trophies
- **Win Rate**: Calculated from wins/losses
- **Three Crown Rate**: Percentage of wins that were 3-crowns
- **Ranking Score**: Composite score (55% trophies, 30% PoL current, 5% PoL best, 5% win rate, 5% three crown rate)
- **Campus Rank**: Player's rank within their university
- **Path of Legends**: Current league, best league (with names like "Ultimate Champion", "Grand Champion", etc.)

### Battle Stats
- Total wins, losses, battle count
- Three crown wins
- Tournament stats (cards won, max wins, battle count)
- Challenge stats

### Player Profile
- Player name, tag
- Experience level
- Current deck (8 cards with icons)
- Favorite card (with icon)
- Arena name
- Badges (with icons)
- Achievements
- Clan information

### Campus Context
- University name
- Campus ranking position
- University short code

---

## Technical Implementation Options

### Option 1: Client-Side Canvas Generation (Recommended for MVP)
**Technology**: HTML5 Canvas API + `html2canvas` or native Canvas

**Pros:**
- Fast generation (no server load)
- Real-time preview
- No additional infrastructure
- Works with existing React components

**Cons:**
- Limited font/asset loading control
- Browser compatibility considerations
- May not work well with external images (CORS)
- Larger bundle size

**Implementation:**
```typescript
// Client component that renders card, then converts to image
'use client'
import html2canvas from 'html2canvas'

function ShareableCard({ playerData }) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const generateImage = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#1A2332',
      scale: 2, // For high-res social media
    })
    const blob = await canvas.toBlob()
    // Download or share
  }
}
```

**Best For**: Quick MVP, when card design is simple

---

### Option 2: Server-Side Image Generation
**Technology**: 
- **@vercel/og** (Next.js Image Generation) - Recommended
- **sharp** + **canvas** (Node.js)
- **Puppeteer** (headless browser)
- **Satori** (SVG to PNG)

**Pros:**
- Consistent output across devices
- Better control over fonts/assets
- Can cache generated images
- SEO-friendly (can serve as actual images)
- No client-side bundle bloat

**Cons:**
- Server compute cost
- Requires API route
- More complex setup
- Slower generation (network round-trip)

**Implementation with @vercel/og:**
```typescript
// app/api/shareable-card/[playerTag]/route.ts
import { ImageResponse } from '@vercel/og'

export async function GET(request: Request, { params }: { params: { playerTag: string } }) {
  const playerData = await fetchPlayerData(params.playerTag)
  
  return new ImageResponse(
    (
      <div style={{ /* JSX styling */ }}>
        {/* Card design */}
      </div>
    ),
    {
      width: 1200,
      height: 630, // Instagram/Twitter optimal
    }
  )
}
```

**Best For**: Production-ready, scalable solution

---

### Option 3: SVG + Convert to PNG
**Technology**: SVG rendering + `sharp` or `puppeteer` for conversion

**Pros:**
- Vector-based (scalable)
- Small file size
- Easy to style with CSS
- Can be cached as SVG or PNG

**Cons:**
- Text rendering can be tricky
- Image embedding requires base64 or URLs
- Conversion step needed for social media

**Best For**: When design is primarily vector-based

---

### Option 4: Pre-rendered Template System
**Technology**: Template engine + image manipulation library

**Pros:**
- Highly customizable
- Can use Photoshop templates
- Professional output

**Cons:**
- Most complex
- Requires design assets
- Slower generation

**Best For**: When you have dedicated design resources

---

## Clash Royale Art Assets

### Available from API
✅ **Card Icons**: Available via `card.iconUrls.medium` (and `evolutionMedium`, `heroMedium`)
- Example: `https://cdn.clashroyale.com/cards/300/...`
- Already whitelisted in `next.config.ts` for `*.clashroyale.com`

✅ **Badge Icons**: Available via `badge.iconUrls.large`
- Example: `https://cdn.clashroyale.com/badges/...`

✅ **Arena Names**: Text-based, can style ourselves

### Not Available from API
❌ **Character Art**: No official API for character illustrations
❌ **Background Images**: No official arena backgrounds
❌ **UI Elements**: No official UI component images

### Legal Considerations
⚠️ **Supercell Brand Guidelines**: 
- Must review Supercell's Fan Content Policy
- Likely need to include attribution/disclaimer
- Cannot use official art in ways that imply partnership
- Should use "Unofficial" or "Fan-made" disclaimers

**Recommendation**: 
- Use card/badge icons from API (likely acceptable)
- Create custom backgrounds/designs inspired by Clash Royale aesthetic
- Avoid using character art without explicit permission
- Include "Unofficial" disclaimer on cards

---

## Design Considerations

### Social Media Dimensions
- **Instagram Post**: 1080x1080 (square) or 1080x1350 (portrait)
- **Instagram Story**: 1080x1920 (9:16)
- **Twitter/X**: 1200x675 (16:9) or 1200x1200 (square)
- **Snapchat**: 1080x1920 (9:16)
- **Facebook**: 1200x630 (1.91:1)

**Recommendation**: Generate multiple formats or use 1200x1200 (square) as universal

### Design Elements

#### Must-Have Stats
1. **Player Name** + University
2. **Ranking Score** (prominent)
3. **Campus Rank** (e.g., "#1 at Stanford")
4. **Trophies** (current)
5. **Path of Legends League** (e.g., "Ultimate Champion")
6. **Win Rate** + **Three Crown Rate**

#### Nice-to-Have Stats
- Current deck (8 card icons)
- Favorite card
- Best achievement
- Season highlights (if we track time-based data)

#### Visual Hierarchy
- **Primary**: Ranking Score, Campus Rank
- **Secondary**: Trophies, League
- **Tertiary**: Win rates, deck preview

### Design Themes
1. **"Crown" Theme**: Emphasize king/queen of campus
2. **"Power Level" Theme**: Like Rise of Kingdoms - show progression/power
3. **"Season Recap" Theme**: Spotify Wrapped style with highlights
4. **"Battle Card" Theme**: Make it look like an in-game card

---

## Implementation Recommendations

### Phase 1: MVP (Client-Side Canvas)
1. Create a React component that renders the card design
2. Use `html2canvas` to convert to image
3. Allow download/share
4. Use card icons from API
5. Custom background (gradient/solid color)

**Timeline**: 1-2 days

### Phase 2: Server-Side Generation
1. Set up Next.js API route with `@vercel/og`
2. Create reusable card template
3. Cache generated images (optional)
4. Support multiple formats (square, story, etc.)

**Timeline**: 2-3 days

### Phase 3: Enhanced Features
1. Multiple card designs/themes
2. Seasonal/date-based stats
3. Comparison cards (vs. campus average)
4. Animated versions (GIF/WebP)

**Timeline**: 3-5 days

---

## Data Requirements

### Current Data Available ✅
- All core stats
- Card icons
- Badge icons
- Player profile info

### Missing Data (for enhanced cards)
- **Time-based stats**: Need to track historical data for "this month" or "this season" stats
- **Deck usage stats**: Which decks used most, win rates per deck
- **Battle log details**: Recent battles, opponents
- **Trends**: Rank changes over time, trophy progression

**Recommendation**: Start with current data, add time-based tracking later

---

## API Endpoint Design

### Option A: On-Demand Generation
```
GET /api/shareable-card?playerTag=#ABC123
→ Returns image directly (PNG/WebP)
```

### Option B: Generate + Cache
```
POST /api/shareable-card/generate
Body: { playerTag, format: 'square' | 'story' }
→ Returns { imageUrl, expiresAt }
→ Image cached at /api/shareable-card/[id]
```

### Option C: Pre-generate on Profile Update
- Generate card when player stats update
- Store in Supabase storage or CDN
- Serve from cache

**Recommendation**: Option A for MVP, Option B for production

---

## Security & Privacy

### Considerations
- Only allow players to generate their own cards (auth required)
- Or allow public generation (rate limit heavily)
- Don't expose sensitive data
- Respect privacy settings

### Rate Limiting
- Limit generation requests per user
- Cache generated images
- Use CDN for serving

---

## Next Steps

1. **Design Mockup**: Create 2-3 card design concepts
2. **Choose Implementation**: Start with client-side for MVP
3. **Legal Review**: Confirm art usage with Supercell guidelines
4. **Build MVP**: Simple card with core stats
5. **Test Sharing**: Verify on Instagram, Twitter, Snapchat
6. **Iterate**: Add more stats, better design, server-side generation

---

## Example Card Layout (Conceptual)

```
┌─────────────────────────────────┐
│  [Crown Icon]                    │
│                                  │
│  KingSlayer_99                   │
│  Stanford University            │
│                                  │
│  ┌─────────────────────────┐   │
│  │  CAMPUS #1              │   │
│  │  Ranking Score: 87.5    │   │
│  └─────────────────────────┘   │
│                                  │
│  Ultimate Champion               │
│  🏆 7,842 Trophies              │
│                                  │
│  Win Rate: 68%  |  3-Crown: 12% │
│                                  │
│  [8 Card Icons - Current Deck]  │
│                                  │
│  clashcampus.com                 │
└─────────────────────────────────┘
```

---

## Questions to Resolve

1. **Legal**: Can we use Clash Royale card icons in shareable images?
2. **Design**: Should we create custom backgrounds or use gradients?
3. **Format**: Single format or multiple (square, story, etc.)?
4. **Caching**: Cache generated images or generate on-demand?
5. **Time-based**: Do we want "this season" stats or just current stats?

