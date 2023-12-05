import { intersection, sum } from "../utils/array";
import { readFile, parseNumberList } from "../utils/file";

type Card = {
    id: number;
    winners: number[];
    numbers: number[];
};
type ScoreCard = Card & {
    score: number;
    matches: number;
    duplicates?: number;
};

(async () => {
    const input = await readFile("04/input.txt");

    const cards: Card[] = input.map(parseCard);
    const scoredCards: ScoreCard[] = cards.map(scoreCard); // P1

    for (let i = scoredCards.length - 1; i >= 0; i--) {
        const card = scoredCards[i];
        card.duplicates = sum([...scoredCards].splice(card.id, card.matches).map((c) => c.duplicates ?? 1)) + 1;
    }

    console.log({
        scoredCards,
        sum: sum(scoredCards.map((c) => c.score)),
        duplicates: sum(scoredCards.map((c) => c.duplicates ?? 1)),
    });
})();

function parseCard(gameStr: string): Card {
    const [cardNameStr, numberSets] = gameStr.split(":");

    const id = parseInt(cardNameStr.replace("Card", "").trim(), 10);

    const [winnersStr, numbersStr] = numberSets.split("|");

    const winners = parseNumberList(winnersStr, " ");
    const numbers = parseNumberList(numbersStr, " ");

    return {
        id,
        winners,
        numbers,
    };
}

function scoreCard(card: Card): ScoreCard {
    return {
        ...card,
        score: score(card),
        matches: intersection(card.numbers, card.winners).length,
    };
}

function score(card: Card): number {
    const matched = intersection(card.numbers, card.winners);
    if (matched.length < 1) {
        return 0;
    }
    return Math.pow(2, matched.length - 1);
}
