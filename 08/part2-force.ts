import { readFile } from "../utils/file";

const DIRECTIONS = ["L", "R"];

(async () => {
    const file = await readFile("08/input.txt");

    const directions = parseDirections(file.shift());
    const map = parseMap(file);

    const allNodes = [...map.keys()];
    const positions = allNodes.filter((node) => node.endsWith("A"));

    console.log({ positions });

    let steps = 0;
    let dirIndex = 0;
    while (positions.some((node) => !node.endsWith("Z"))) {
        const dir = directions[dirIndex];

        for (const [i, pos] of positions.entries()) {
            const nodes = map.get(pos);

            positions[i] = nodes[dir];
        }

        dirIndex = (dirIndex + 1) % directions.length;
        steps++;

        if (steps % 10000 === 0) console.log({ steps, positions });
    }

    console.log({
        directions,
        map,
        steps,
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
