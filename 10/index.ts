import { readFile } from "../utils/file";

const canConnectN = (char: string) => ["|", "└", "┘", "S"].includes(char);
const canConnectS = (char: string) => ["|", "┐", "┌", "S"].includes(char);
const canConnectE = (char: string) => ["-", "└", "┌", "S"].includes(char);
const canConnectW = (char: string) => ["-", "┐", "┘", "S"].includes(char);

type Position = {
    x: number;
    y: number;
};

type Walker = Position & {
    active: boolean;
    steps: number;
};

type Pedometer = Map<string, Position & { steps: number }>;

(async () => {
    const input = await readFile("10/input.txt");
    const network = betterSymbols(input.map((line) => line.split("")));

    const pedometer = calculatePedometer(network);
    visualize(replaceVisited(network, pedometer), 2);

    const farthestPosition = [...pedometer.values()].sort((a, b) => b.steps - a.steps)[0];

    const expandedNetwork = expandNetwork(network);
    visualize(expandedNetwork);

    const expandedPedometer = calculatePedometer(expandedNetwork);
    const visitedExpandedNetwork = replaceVisited(expandedNetwork, expandedPedometer);

    const replacedNetwork = floodReplace(visitedExpandedNetwork, [",", ".", "|", "-", "┐", "┌", "└", "┘"], "o");
    visualize(replacedNetwork, 3);

    const retractedNetwork = retractNetwork(replacedNetwork);
    visualize(retractedNetwork, 3);

    const encircled = retractedNetwork
        .flat(2)
        .reduce((count, piece) => (piece !== "o" && !/\d/.test(piece) ? count + 1 : count), 0);

    console.log({
        farthestPosition,
        encircled,
    });
})();

function calculatePedometer(network: string[][]) {
    const pedometer: Pedometer = new Map();
    const startPosition = findStartPosition(network);

    const walkers: Walker[] = [
        { ...startPosition, active: true, steps: 0 },
        { ...startPosition, active: true, steps: 0 },
    ];
    recordSteps(pedometer, walkers[0]);

    search: while (walkers.find((w) => w.active)) {
        walk: for (const walker of walkers.filter((w) => w.active)) {
            const currentPipe = getPipePiece(network, walker);

            if (canConnectN(currentPipe)) {
                const next = getN(walker);
                const nextPipe = getPipePiece(network, next);
                if (canConnectS(nextPipe) && !hasBeenVisited(pedometer, next)) {
                    takeStep(walker, next);
                    recordSteps(pedometer, walker);
                    continue walk;
                }
            }
            if (canConnectS(currentPipe)) {
                const next = getS(walker);
                const nextPipe = getPipePiece(network, next);
                if (canConnectN(nextPipe) && !hasBeenVisited(pedometer, next)) {
                    takeStep(walker, next);
                    recordSteps(pedometer, walker);
                    continue walk;
                }
            }
            if (canConnectE(currentPipe)) {
                const next = getE(walker);
                const nextPipe = getPipePiece(network, next);
                if (canConnectW(nextPipe) && !hasBeenVisited(pedometer, next)) {
                    takeStep(walker, next);
                    recordSteps(pedometer, walker);
                    continue walk;
                }
            }
            if (canConnectW(currentPipe)) {
                const next = getW(walker);
                const nextPipe = getPipePiece(network, next);
                if (canConnectE(nextPipe) && !hasBeenVisited(pedometer, next)) {
                    takeStep(walker, next);
                    recordSteps(pedometer, walker);
                    continue walk;
                }
            }
            // Can't walk anywhere, must have reach the farthest point
            walker.active = false;
        }
    }

    return pedometer;
}

function findStartPosition(network: string[][]): Position {
    for (const [y, row] of network.entries()) {
        for (const [x, char] of row.entries()) {
            if (char === "S") {
                return { x, y };
            }
        }
    }
    throw new Error("No start position found");
}

function getPipePiece(network: string[][], position: Position) {
    if (isOOB(network, position)) {
        return ".";
    }
    return network[position.y][position.x];
}

function getN(position: Position): Position {
    return { y: position.y - 1, x: position.x };
}

function getS(position: Position): Position {
    return { y: position.y + 1, x: position.x };
}

function getE(position: Position): Position {
    return { y: position.y, x: position.x + 1 };
}

function getW(position: Position): Position {
    return { y: position.y, x: position.x - 1 };
}

function hasBeenVisited(pedometer: Pedometer, position: Position) {
    const id = `${position.y}-${position.x}`;
    return pedometer.has(id);
}

function takeStep(walker: Walker, position: Position) {
    walker.x = position.x;
    walker.y = position.y;
    walker.steps++;
}

function recordSteps(pedometer: Pedometer, walker: Walker) {
    const id = `${walker.y}-${walker.x}`;
    if (!pedometer.has(id)) {
        pedometer.set(id, {
            x: walker.x,
            y: walker.y,
            steps: walker.steps,
        });
    }
}

function visualize(network: string[][], padding = 1) {
    const map = [];
    for (const y in network) {
        const row = [];
        for (const x in network[y]) {
            row.push(getPipePiece(network, { x: parseInt(x), y: parseInt(y) }));
        }
        map.push(row.map((p) => `${p}`.padStart(padding, " ")).join(" "));
    }
    console.log(map);
}

function expandNetwork(network: string[][]) {
    const expandedNetwork: string[][] = [];

    for (const [y, row] of network.entries()) {
        const newAboveRow: string[] = [];
        const newRow: string[] = [];
        for (const [x, pipe] of row.entries()) {
            newAboveRow.push(",");

            if (canConnectN(pipe)) {
                const abovePipe = getPipePiece(network, getN({ x, y }));
                newAboveRow.push(canConnectS(abovePipe) ? "|" : ",");
            } else {
                newAboveRow.push(",");
            }
            if (canConnectW(pipe)) {
                const prevPipe = getPipePiece(network, getW({ x, y }));
                newRow.push(canConnectE(prevPipe) ? "-" : ",");
            } else {
                newRow.push(",");
            }
            newRow.push(pipe);
        }
        newRow.push(",");
        newAboveRow.push(",");
        expandedNetwork.push(newAboveRow, newRow);
    }
    expandedNetwork.push(new Array(expandedNetwork[0].length).fill(","));

    return expandedNetwork;
}

function floodReplace(network: string[][], find: string[], replace: string) {
    const replacedNetwork: string[][] = JSON.parse(JSON.stringify(network)); // DeepClone
    const replacers: Position[] = [{ x: 0, y: 0 }];

    while (replacers.length) {
        const replacer = replacers.shift();
        const piece = getPipePiece(replacedNetwork, replacer);

        if (find.includes(piece)) {
            replaceInNetwork(replacedNetwork, replacer, replace);
        } else {
            continue;
        }

        const above = getN(replacer);
        const abovePiece = getPipePiece(replacedNetwork, above);
        if (find.includes(abovePiece) && !isOOB(replacedNetwork, above)) {
            replacers.push(above);
        }

        const below = getS(replacer);
        const belowPiece = getPipePiece(replacedNetwork, below);
        if (find.includes(belowPiece) && !isOOB(replacedNetwork, below)) {
            replacers.push(below);
        }

        const right = getE(replacer);
        const rightPiece = getPipePiece(replacedNetwork, right);
        if (find.includes(rightPiece) && !isOOB(replacedNetwork, right)) {
            replacers.push(right);
        }

        const left = getW(replacer);
        const leftPiece = getPipePiece(replacedNetwork, left);
        if (find.includes(leftPiece) && !isOOB(replacedNetwork, left)) {
            replacers.push(left);
        }
    }

    return replacedNetwork;
}

function replaceInNetwork(network: string[][], position: Position, piece: string) {
    if (isOOB(network, position)) {
        return;
    }
    network[position.y][position.x] = piece;
}

function isOOB(network: string[][], position: Position) {
    return position.x < 0 || position.y < 0 || position.x >= network[0].length || position.y >= network.length;
}

function replaceVisited(network: string[][], pedometer: Pedometer) {
    const replacedNetwork: string[][] = JSON.parse(JSON.stringify(network)); // DeepClone

    for (const [_, position] of pedometer) {
        replaceInNetwork(replacedNetwork, position, `${position.steps}`);
    }

    return replacedNetwork;
}

function retractNetwork(network: string[][]) {
    const newNetwork: string[][] = [];
    for (let y = 1; y < network.length; y += 2) {
        const row = network[y];
        const newRow: string[] = [];
        for (let x = 1; x < row.length; x += 2) {
            newRow.push(network[y][x]);
        }
        newNetwork.push(newRow);
    }
    return newNetwork;
}

function betterSymbols(network: string[][]) {
    return network.map((l) =>
        l.map((char) => {
            if (char === "7") {
                return "┐";
            }
            if (char === "F") {
                return "┌";
            }
            if (char === "J") {
                return "┘";
            }
            if (char === "L") {
                return "└";
            }
            return char;
        })
    );
}
