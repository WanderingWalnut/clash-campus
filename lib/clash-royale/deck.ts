import type { ClashRoyaleCard } from '@/types/clash-royale';

/**
 * Creates a verification deck from a list of cards.
 * @param cards - The list of cards to create the deck from.
 * @returns The verification deck.
 */

export function generateRandomDeck(
    availableCards: ClashRoyaleCard[],
    maxCards: number = 8,
): { cards: ClashRoyaleCard[], maxCards: number } {
    const shuffled = [...availableCards];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const deck = shuffled.slice(0, maxCards);
    return {
        cards: deck,
        maxCards: maxCards,
    };
}
