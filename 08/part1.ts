import { readFile } from "../utils/file";

const DIRECTIONS = ["L", "R"];

(async () => {
    const file = await readFile("08/input.txt");

    const directions = parseDirections(file.shift());
    const map = parseMap(file);

    let pos = "AAA";
    let dirIndex = 0;
    const path = [];
    while (pos !== "ZZZ") {
        const nodes = map.get(pos);
        const dir = directions[dirIndex];

        pos = nodes[dir];
        path.push(pos);

        dirIndex = (dirIndex + 1) % directions.length;
    }

    console.log({
        directions,
        map,
        path: path.join(","),
        steps: path.length,
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
