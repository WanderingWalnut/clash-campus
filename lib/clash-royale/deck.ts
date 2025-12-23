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
    const deck = [];
    for (let i = 0; i < maxCards; i++) {
        // Math.random() returns a float in [0, 1), so multiplying by availableCards.length
        // scales it to [0, availableCards.length), ensuring every index from 0 to (length-1)
        // has an equal chance of being picked.
        const card = availableCards[Math.floor(Math.random() * availableCards.length)];
        deck.push(card);
    }
    return {
        cards: deck,
        maxCards: maxCards,
    };
}