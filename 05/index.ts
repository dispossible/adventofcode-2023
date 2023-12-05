import { readFile, parseNumberList } from "../utils/file";
import { type Range, doMapping, parseMappings } from "./mapping";

(async () => {
    const input = await readFile("05/input.txt", "\n\n");

    const seedStr = input.shift();
    const seeds = parseNumberList(seedStr.replace("seeds: ", ""), " ");
    const mappings = parseMappings(input);

    let minLocations: number[] = [];

    for (let i = 0; i < seeds.length; i += 2) {
        const start = seeds[i];
        const amount = seeds[i + 1] - 1;
        const end = start + amount;
        const seed: Range[] = [
            {
                start,
                end,
            },
        ];

        const soil = doMapping(mappings["seed-to-soil"], seed);
        const fertilizer = doMapping(mappings["soil-to-fertilizer"], soil);
        const water = doMapping(mappings["fertilizer-to-water"], fertilizer);
        const light = doMapping(mappings["water-to-light"], water);
        const temperature = doMapping(mappings["light-to-temperature"], light);
        const humidity = doMapping(mappings["temperature-to-humidity"], temperature);
        const location = doMapping(mappings["humidity-to-location"], humidity);

        minLocations.push(...location.map((l) => l.start));
    }

    console.log({
        minLocations,
        minLocation: Math.min(...minLocations),
    });
})();
