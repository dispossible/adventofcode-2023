import { range } from "../utils/array";
import { readFile, parseNumberList } from "../utils/file";
import { Worker } from "worker_threads";

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

    let minLocation = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < seeds.length; i += 2) {
        const start = seeds[i];
        const amount = seeds[i + 1];
        const lastSeed = start + amount;
        let seed = start;
        while (seed < lastSeed) {
            const soil = doMapping(mappings["seed-to-soil"], seed);
            const fertilizer = doMapping(mappings["soil-to-fertilizer"], soil);
            const water = doMapping(mappings["fertilizer-to-water"], fertilizer);
            const light = doMapping(mappings["water-to-light"], water);
            const temperature = doMapping(mappings["light-to-temperature"], light);
            const humidity = doMapping(mappings["temperature-to-humidity"], temperature);
            const location = doMapping(mappings["humidity-to-location"], humidity);
            if (location < minLocation) {
                minLocation = location;
            }
            console.log(`${i + 1}/${seeds.length} - ${seed - start}/${amount} - ${seed} at ${location}`);
            seed++;
        }
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

function runService<R, T>(workerData: R): Promise<T> {
    return new Promise((resolve, reject) => {
        const worker = new Worker("./worker.ts", { workerData });
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}
