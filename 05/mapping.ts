import { parseNumberList } from "../utils/file";
export type Range = {
    start: number;
    end: number;
};
export type MapRange = {
    from: Range;
    to: Range;
};

export function doMapping(mapping: MapRange[], ranges: Range[]): Range[] {
    const results: Range[] = [];
    const rangesToResolve = [...ranges];

    rangeLoop: while (rangesToResolve.length) {
        const range = rangesToResolve.shift();
        mapLoop: for (const map of mapping) {
            if (range.start >= map.from.start && range.start <= map.from.end) {
                // Starts in this map

                if (range.end <= map.from.end) {
                    //Also ends in this map
                    const offset = range.start - map.from.start;
                    const rangeSize = range.end - range.start;
                    results.push({
                        start: map.to.start + offset,
                        end: map.to.start + offset + rangeSize,
                    });
                    continue rangeLoop;
                }

                // Must be a partial
                const offset = range.start - map.from.start;
                const rangeSize = map.from.end - range.start;
                rangesToResolve.push({
                    start: map.from.end + 1,
                    end: range.end,
                });
                results.push({
                    start: map.to.start + offset,
                    end: map.to.start + offset + rangeSize,
                });
                continue rangeLoop;
            }

            if (range.end >= map.from.start && range.end <= map.from.end) {
                // Ends within, but didn't start
                const rangeSize = range.end - map.from.start;
                rangesToResolve.push({
                    start: range.start,
                    end: map.from.start - 1,
                });
                results.push({
                    start: map.to.start,
                    end: map.to.start + rangeSize,
                });
                continue rangeLoop;
            }

            if (range.start < map.from.start && range.end > map.from.end) {
                // The map is within the range
                rangesToResolve.push(
                    {
                        start: range.start,
                        end: map.from.start - 1,
                    },
                    {
                        start: map.from.end + 1,
                        end: range.end,
                    }
                );
                results.push({
                    start: map.to.start,
                    end: map.to.end,
                });
                continue rangeLoop;
            }
        }
        results.push({
            start: range.start,
            end: range.end,
        });
    }

    return results;
}

export function parseMappings(mapStrings: string[]) {
    const mappings: Record<string, MapRange[]> = {};

    for (const mapString of mapStrings) {
        const [name, numberLists] = mapString.split(" map:\n");
        mappings[name] = [];

        const maps = numberLists.split("\n").map((s) => parseNumberList(s, " "));
        for (const map of maps) {
            mappings[name].push({
                from: {
                    start: map[1],
                    end: map[1] + map[2] - 1,
                },
                to: {
                    start: map[0],
                    end: map[0] + map[2] - 1,
                },
            });
        }
    }

    return mappings;
}
