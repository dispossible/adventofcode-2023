import { readFile } from "../utils/file";

const CARDS = ["A", "K", "Q", "_", "T", "9", "8", "7", "6", "5", "4", "3", "2", "_", "J"].reverse();

type Game = {
    cardNames: string[];
    cards: number[];
    bid: number;
};

(async () => {
    const gamesStr = await readFile("07/input.txt");
    const games = gamesStr.map(parseGame);

    const scoredGames = games.map(scoreGame);

    const sorted = scoredGames.sort((a, b) => a.score - b.score);

    const winnings = sorted.reduce((winnings, game, rank) => {
        return winnings + game.bid * (rank + 1);
    }, 0);

    console.log(sorted.map((g) => `${g.cardNames.join("")} - ${g.cards.join()} - ${g.score} - ${g.jokers}`).join("\n"));
    console.log({
        winnings,
    });
})();

function parseGame(gameStr: string): Game {
    const [cardsStr, bidStr] = gameStr.split(" ");
    const cardNames = cardsStr.split("");
    const cards = cardNames.map((card) => CARDS.indexOf(card));

    return {
        bid: parseInt(bidStr, 10),
        cardNames,
        cards,
    };
}

const MULTIPLIER = {
    five: 6,
    four: 5,
    fullHouse: 4,
    three: 3,
    twoPair: 2,
    pair: 1,
    highCard: 0,
};

function scoreGame(game: Game) {
    const hand = [...game.cardNames].sort().join("");

    const isFive = /^(.)\1{4}$/.test(hand);
    const isFour = !isFive && /^[^\1]?(.)\1{3}[^\1]?$/.test(hand);
    const isFullHouse = !isFour && (/^(.)\1(?!\1)(.)\2{2}$/.test(hand) || /^(.)\1{2}(?!\1)(.)\2$/.test(hand));
    const isThree = !isFullHouse && /^.*?(.)\1{2}.*?$/.test(hand);
    const isTwoPair = !isThree && /^.*?(.)\1(?!\1{2}).*?(.)\2.*?$/.test(hand);
    const isPair = !isTwoPair && /^.*?(.)\1(?!\1).*?$/.test(hand);

    const jokers = hand.match(/J/g)?.length ?? 0;

    let multiplier = MULTIPLIER.highCard;
    if (isFive) {
        multiplier = MULTIPLIER.five;
    } else if (isFour) {
        // jokers === 1 | 4
        if (jokers === 0) {
            multiplier = MULTIPLIER.four;
        } else {
            multiplier = MULTIPLIER.five;
        }
    } else if (isFullHouse) {
        // jokers === 2 | 3
        if (jokers === 0) {
            multiplier = MULTIPLIER.fullHouse;
        } else {
            multiplier = MULTIPLIER.five;
        }
    } else if (isThree) {
        // jokers === 3 | 2 | 1
        if (jokers === 0) {
            multiplier = MULTIPLIER.three;
        } else if (jokers === 1) {
            multiplier = MULTIPLIER.four;
        } else if (jokers === 2) {
            multiplier = MULTIPLIER.five;
        } else {
            multiplier = MULTIPLIER.four;
        }
    } else if (isTwoPair) {
        // jokers === 1 | 2
        if (jokers === 0) {
            multiplier = MULTIPLIER.twoPair;
        } else if (jokers === 1) {
            multiplier = MULTIPLIER.fullHouse;
        } else {
            multiplier = MULTIPLIER.four;
        }
    } else if (isPair) {
        // jokers === 1 | 2
        if (jokers === 0) {
            multiplier = MULTIPLIER.pair;
        } else {
            multiplier = MULTIPLIER.three;
        }
    } else if (jokers === 1) {
        multiplier = MULTIPLIER.pair;
    }

    let score = Math.pow(10, multiplier);

    const highCardStr = game.cards.map((c) => c.toString(16)).join("");
    const highCard = parseInt(highCardStr, 16) / 1_000_000;

    score += highCard;

    return {
        ...game,
        score,
        jokers,
    };
}
