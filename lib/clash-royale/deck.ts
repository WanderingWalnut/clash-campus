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
    // Separate cards into champions and non-champions
    const champions = availableCards.filter(card => card.rarity === 'champion');
    const nonChampions = availableCards.filter(card => card.rarity !== 'champion');

    // Shuffle both arrays
    const shuffle = <T>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const shuffledChampions = shuffle(champions);
    const shuffledNonChampions = shuffle(nonChampions);

    // Select at most 1 champion (randomly decide whether to include one if available)
    const selectedChampion = shuffledChampions.length > 0 && Math.random() < 0.5 
        ? [shuffledChampions[0]] 
        : [];

    // Calculate how many non-champion cards we need
    const remainingSlots = maxCards - selectedChampion.length;
    const selectedNonChampions = shuffledNonChampions.slice(0, remainingSlots);

    // Combine and shuffle the final deck to randomize card order
    const deck = shuffle([...selectedChampion, ...selectedNonChampions]);

    return {
        cards: deck,
        maxCards: maxCards,
    };
}
