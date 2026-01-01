import type { ClashRoyaleCard } from '@/types/clash-royale';

/**
 * Creates a verification deck from a list of cards.
 * Ensures at most 1 champion card, placed in the 3rd slot (index 2).
 * @param availableCards - The list of cards to create the deck from.
 * @param maxCards - Maximum number of cards in the deck (default: 8).
 * @returns The verification deck with cards and maxCards count.
 * @throws Error if there are not enough cards to fill the deck.
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

    // Select at most 1 champion (20% chance if available)
    const selectedChampion = shuffledChampions.length > 0 && Math.random() < 0.2
        ? shuffledChampions[0]
        : null;

    // Calculate how many non-champion cards we need
    const remainingSlots = maxCards - (selectedChampion ? 1 : 0);

    // Validate we have enough non-champions
    if (nonChampions.length < remainingSlots) {
        throw new Error(
            `Not enough non-champion cards. Required: ${remainingSlots}, Available: ${nonChampions.length}`
        );
    }

    const selectedNonChampions = shuffledNonChampions.slice(0, remainingSlots);

    // Shuffle non-champions to randomize their order
    const shuffledNonChampionsFinal = shuffle(selectedNonChampions);

    // Build the deck: if champion exists, place it in the 3rd slot (index 2)
    const deck: ClashRoyaleCard[] = new Array(maxCards);

    if (selectedChampion) {
        // Place champion in the 3rd slot (index 2)
        const championPosition = 2;
        deck[championPosition] = selectedChampion;

        // Fill remaining positions with non-champions
        let nonChampionIndex = 0;
        for (let i = 0; i < maxCards; i++) {
            if (i !== championPosition) {
                deck[i] = shuffledNonChampionsFinal[nonChampionIndex];
                nonChampionIndex++;
            }
        }
    } else {
        // No champion, fill all slots with non-champions
        for (let i = 0; i < maxCards; i++) {
            deck[i] = shuffledNonChampionsFinal[i];
        }
    }

    return {
        cards: deck,
        maxCards: maxCards,
    };
}
