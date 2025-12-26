import type { ClashRoyaleCard } from '@/types/clash-royale';

/**
 * Generates a Clash Royale deck link URL that can be opened to copy the deck.
 * 
 * Format: https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=ID1;ID2;ID3;ID4;ID5;ID6;ID7;ID8&l=Royals&tt=159000000
 * 
 * Note: The tt parameter appears to be a fixed identifier used by Clash Royale's link system,
 * not an expiration timestamp. All official deck links use the value 159000000.
 * 
 * @param cards - Array of 8 Clash Royale cards
 * @returns The deck link URL, or null if invalid
 */
export function generateDeckLink(cards: ClashRoyaleCard[]): string | null {
    // Validate that we have exactly 8 cards
    if (!cards || cards.length !== 8) {
        return null;
    }

    // Extract card IDs and join with semicolons
    const cardIds = cards.map((card) => card.id).join(';');

    // Generate the Clash Royale deck link
    // The &l=Royals parameter is required for the link to work
    // The &tt parameter uses the fixed value 159000000 (used by all official deck links)
    const baseUrl = 'https://link.clashroyale.com/en/';
    const deckParam = `clashroyale://copyDeck?deck=${cardIds}&l=Royals&tt=159000000`;

    return `${baseUrl}?${deckParam}`;
}

