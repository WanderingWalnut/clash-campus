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
        ? shuffledChampions[0] 
        : null;

    // Calculate how many non-champion cards we need
    const remainingSlots = maxCards - (selectedChampion ? 1 : 0);
    const selectedNonChampions = shuffledNonChampions.slice(0, remainingSlots);
    
    // Shuffle non-champions to randomize their order
    const shuffledNonChampionsFinal = shuffle(selectedNonChampions);

    // Build the deck: if champion exists, place it in one of the first 3 slots
    const deck: ClashRoyaleCard[] = new Array(maxCards);
    
    if (selectedChampion) {
        // Randomly choose a position from 0, 1, or 2 (first 3 slots)
        const championPosition = Math.floor(Math.random() * 3);
        
        // Place champion in the chosen position
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
