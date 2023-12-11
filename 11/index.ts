import { range, sum, unique } from "../utils/array";
import { readFile } from "../utils/file";

type Coords = {
    x: number;
    y: number;
};

type Galaxy = Coords & {
    id: number;
};

type Distance = Coords & {
    galaxies: number[];
    distance: number;
};

const isGalaxy = (str: string) => str === "#";

(async () => {
    const galaxyMap = (await readFile("11/input.txt")).map((l) => l.split(""));
    const expandedMap = expandGalaxy(galaxyMap);

    visualize(galaxyMap);
    console.log(" ");
    visualize(expandedMap);

    const galaxies = getGalaxyCoords(expandedMap, 1_000_000 - 1);
    const distances = calculateDistanceMap(galaxies);

    const allDistances = sum(distances.map((d) => d.distance));

    console.log({
        galaxies,
        allDistances,
    });
})();

function calculateDistanceMap(galaxies: Galaxy[]) {
    const distances: Distance[] = [];

    for (const [i, galaxyA] of galaxies.entries()) {
        for (let ii = i + 1; ii < galaxies.length; ii++) {
            const galaxyB = galaxies[ii];
            const x = Math.abs(galaxyA.x - galaxyB.x);
            const y = Math.abs(galaxyA.y - galaxyB.y);
            distances.push({
                galaxies: [galaxyA.id, galaxyB.id],
                x,
                y,
                distance: x + y,
            });
        }
    }

    return distances;
}

function expandGalaxy(galaxyMap: string[][]) {
    const expandedMap: string[][] = [];
    const columnsToDuplicate = new Array(galaxyMap[0].length).fill(true);

    for (const row of galaxyMap) {
        if (unique(row).length === 1) {
            expandedMap.push(
                [...row],
                range(0, row.length).map(() => "*")
            );
        } else {
            expandedMap.push([...row]);
        }
        for (const [x, cell] of row.entries()) {
            if (isGalaxy(cell)) {
                columnsToDuplicate[x] = false;
            }
        }
    }

    let offset = 0;
    for (const [x, shouldDuplicate] of columnsToDuplicate.entries()) {
        if (shouldDuplicate) {
            for (const row of expandedMap) {
                row.splice(x + offset, 0, "*");
            }
            offset++;
        }
    }

    return expandedMap;
}

function visualize(map: string[][]) {
    console.log(map.map((r) => r.join(" ")).join("\n"));
}

function getGalaxyCoords(galaxyMap: string[][], expandedAmount = 1) {
    const galaxies: Galaxy[] = [];
    let yExtends = 0;
    for (const [y, row] of galaxyMap.entries()) {
        if (unique(row).length === 1 && row[0] === "*") {
            yExtends++;
            continue;
        }
        let xExtends = 0;
        for (const [x, cell] of row.entries()) {
            if (cell === "*") {
                xExtends++;
                continue;
            }
            if (isGalaxy(cell)) {
                const id = y * galaxyMap[0].length + x;
                galaxies.push({
                    x: x - xExtends + expandedAmount * xExtends,
                    y: y - yExtends + expandedAmount * yExtends,
                    id,
                });
            }
        }
    }
    return galaxies;
}
