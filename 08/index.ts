import { readFile } from "../utils/file";

const DIRECTIONS = ["L", "R"];

(async () => {
    const file = await readFile("08/input.txt");

    const directions = parseDirections(file.shift());
    const map = parseMap(file);

    const allNodes = [...map.keys()];
    const positions = allNodes.filter((node) => node.endsWith("A"));

    console.log({ positions });

    const pathLengths = positions.map((startPos) => findPath(startPos, directions, map));

    console.log({
        directions,
        map,
        pathLengths,
        steps: lowestCommonMultipleSet(pathLengths),
    });
})();

function parseDirections(dirStr: string): number[] {
    return dirStr.split("").map((dir) => DIRECTIONS.indexOf(dir));
}

function parseMap(mapLines: string[]) {
    const map = new Map<string, [string, string]>();

    for (const line of mapLines) {
        const [key, linkStr] = line.split(" = ");

        const links = linkStr
            .replace(/[\(\)]/g, "")
            .split(",")
            .map((s) => s.trim());

        map.set(key, links as [string, string]);
    }

    return map;
}

function findPath(startPos: string, directions: number[], map: Map<string, [string, string]>): number {
    let pos = startPos;
    let dirIndex = 0;
    const path = [];
    while (!pos.endsWith("Z")) {
        const nodes = map.get(pos);
        const dir = directions[dirIndex];

        pos = nodes[dir];
        path.push(pos);

        dirIndex = (dirIndex + 1) % directions.length;
    }
    return path.length;
}

function greatestCommonDivisor(a: number, b: number): number {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

function lowestCommonMultiple(a: number, b: number): number {
    return (a * b) / greatestCommonDivisor(a, b);
}

function lowestCommonMultipleSet(numbers: number[]): number {
    return numbers.reduce((lcm, num) => lowestCommonMultiple(lcm, num), numbers[0] ?? 0);
}
