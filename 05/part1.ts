import { readFile, parseNumberList } from "../utils/file";

type Thing = "seed" | "soil" | "fertilizer" | "water" | "light" | "temperature" | "humidity" | "location";

type MapRange = {
    from: {
        start: number;
        end: number;
    };
    to: {
        start: number;
        end: number;
    };
};

(async () => {
    const input = await readFile("05/input.txt", "\n\n");

    const seedStr = input.shift();
    const seeds = parseNumberList(seedStr.replace("seeds: ", ""), " ");

    const mappings = parseMappings(input);

    const seedStats: Record<Thing, number>[] = [];

    for (const seed of seeds) {
        const soil = doMapping(mappings["seed-to-soil"], seed);
        const fertilizer = doMapping(mappings["soil-to-fertilizer"], soil);
        const water = doMapping(mappings["fertilizer-to-water"], fertilizer);
        const light = doMapping(mappings["water-to-light"], water);
        const temperature = doMapping(mappings["light-to-temperature"], light);
        const humidity = doMapping(mappings["temperature-to-humidity"], temperature);
        const location = doMapping(mappings["humidity-to-location"], humidity);
        seedStats.push({
            seed,
            soil,
            fertilizer,
            water,
            light,
            temperature,
            humidity,
            location,
        });
    }

    console.log({
        seeds,
        mappings,
        seedStats,
        minLocation: Math.min(...seedStats.map((s) => s.location)),
    });
})();

function parseMappings(mapStrings: string[]) {
    const mappings: Record<string, MapRange[]> = {};

    for (const mapString of mapStrings) {
        const [name, numberLists] = mapString.split(" map:\n");
        mappings[name] = [];

        const maps = numberLists.split("\n").map((s) => parseNumberList(s, " "));
        for (const map of maps) {
            mappings[name].push({
                from: {
                    start: map[1],
                    end: map[1] + map[2],
                },
                to: {
                    start: map[0],
                    end: map[0] + map[2],
                },
            });
        }
    }

    return mappings;
}

function doMapping(mapping: MapRange[], value: number): number {
    for (const map of mapping) {
        if (value >= map.from.start && value <= map.from.end) {
            const offset = value - map.from.start;
            return map.to.start + offset;
        }
    }
    return value;
}
