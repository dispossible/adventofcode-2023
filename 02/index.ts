import { readFile } from "../utils/file";
import { sum } from "../utils/array";

type Color = "red" | "green" | "blue";
type CubeSet = Record<Color, number>;
type Game = {
    id: number;
    rounds: CubeSet[];
    totals: CubeSet;
};

const BAG_OF_CUBES: CubeSet = {
    red: 12,
    green: 13,
    blue: 14,
};

(async () => {
    const input = await readFile("02/input.txt");

    const games = input.map(parseGame);
    const possibleGames: number[] = [];

    for (const game of games) {
        if (
            game.totals.red <= BAG_OF_CUBES.red &&
            game.totals.green <= BAG_OF_CUBES.green &&
            game.totals.blue <= BAG_OF_CUBES.blue
        ) {
            possibleGames.push(game.id);
        }
    }

    console.log({
        possibleGames,
        sum: sum(possibleGames),
        powers: sum(games.map((game) => game.totals.red * game.totals.blue * game.totals.green)),
    });
})();

function parseGame(gameStr: string): Game {
    const [idStr, cubes] = gameStr.split(":");
    const id = parseInt(idStr.replace("Game ", ""), 10);

    const totals: CubeSet = {
        red: 0,
        green: 0,
        blue: 0,
    };

    const rounds: CubeSet[] = cubes
        .split(";")
        .map((round) => round.split(",").map((r) => r.trim()))
        .map((round) => {
            const set: CubeSet = {
                red: 0,
                green: 0,
                blue: 0,
            };
            round.forEach((countStr) => {
                const [num, color] = countStr.split(" ") as [string, Color];
                const count = parseInt(num, 10);
                set[color] += count;
                totals[color] = Math.max(count, totals[color]);
            });
            return set;
        });

    return { id, rounds, totals };
}
