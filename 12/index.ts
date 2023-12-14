import { range, sum } from "../utils/array";
import { parseNumberList, readFile } from "../utils/file";
import { replaceAt } from "../utils/string";

type Input = {
    towers: string;
    groups: number[];
};

type Match = {
    index: number;
    text: string;
};

const start = Date.now();
const runtime = () => Date.now() - start;

(async () => {
    const input = await readFile("12/input.txt");

    const rows: Input[] = input.map((line) => {
        const [towers, groups] = line.split(" ");
        return {
            towers,
            groups: parseNumberList(groups, ","),
        };
    });

    const unfolded = rows.map(unfold);

    // const sequences = generateSequences(unfolded[8]);
    const sequences = unfolded.map((input, line) => {
        console.log({
            line,
        });
        return generateSequences(input);
    });

    console.log(sequences.join(","));
    console.log({
        sum: sum(sequences),
        runtime: runtime(),
    });
})();
function findAllMatches(reg: RegExp, str: string) {
    reg = new RegExp(reg, "g");
    const matches: Match[] = [];
    let found: RegExpExecArray;
    while ((found = reg.exec(str))) {
        matches.push({ text: found[0], index: found.index });
        reg.lastIndex = found.index + 1;
    }
    if (matches.length < 1) {
        console.error({
            reg,
            str,
            found,
            matches,
        });
    }
    return matches;
}

function generateSequences(input: Input) {
    const matches: Match[][] = [];

    console.log(input);

    for (const [index, group] of input.groups.entries()) {
        const precedingSets = input.groups
            .slice(0, index)
            .map((size) => `[\\?#]{${size}}`)
            .join("[\\.\\?]+");
        const followingSets = input.groups
            .slice(index + 1, input.groups.length)
            .map((size) => `[\\?#]{${size}}`)
            .join("[\\.\\?]+");
        const search = `[\\?#]{${group}}`;

        let regex = "";
        regex += precedingSets ? `(?<=^[\\.\\?]*${precedingSets}[\\.\\?]+)` : "(?<=^[\\.\\?]*)";
        regex += search;
        regex += followingSets ? `(?=[\\.\\?]+${followingSets}[\\.\\?]*$)` : `(?=[\\.\\?]*$)`;

        const matcher = new RegExp(regex);

        matches.push(findAllMatches(matcher, input.towers));
    }

    let sequences = 0;
    const counters = matches.map((match) => ({
        state: 0,
        max: match.length - 1,
    }));

    let tick = 0;
    let ticking = true;
    const decrementCounter = (counterIndex: number) => {
        const counter = counters[counterIndex];
        if (!counter) {
            ticking = false;
            return;
        }

        if (counter.state >= counter.max) {
            decrementCounter(counterIndex - 1);
            const previousCounter = counters[counterIndex - 1];
            if (!previousCounter) {
                counter.state = 0;
                return;
            }
            const previousMatches = matches[counterIndex - 1];
            const previousMatch = previousMatches[previousCounter.state];
            const resetPoint = matches[counterIndex].findIndex(
                (m) => m.index > previousMatch.index + previousMatch.text.length
            );
            counter.state = resetPoint ?? 0;
        } else {
            counter.state++;
        }
    };

    const validateCounters = () => {
        const hashes = /#+/g;
        let found: RegExpExecArray;
        while ((found = hashes.exec(input.towers))) {
            const counterHasHash = counters.some((counter, i) => {
                const match = matches[i][counter.state];
                return found.index >= match.index && found.index < match.index + match.text.length;
            });
            if (!counterHasHash) {
                return false;
            }
        }
        return true;
    };

    while (ticking) {
        if (tick % 1_000_000 === 0)
            console.log(
                counters.map((counter) => `${counter.state.toFixed(0).padStart(2, "0")}`).join(" - "),
                tick,
                runtime()
            );

        if (validateCounters()) {
            sequences++;
        }

        decrementCounter(counters.length - 1);
        tick++;
    }

    console.log({ permutations: sequences });
    return sequences;
}

function unfold(input: Input): Input {
    // Part 1
    // return input;

    // Part 2
    return {
        towers: `${input.towers}?${input.towers}?${input.towers}?${input.towers}?${input.towers}`,
        groups: [...input.groups, ...input.groups, ...input.groups, ...input.groups, ...input.groups],
    };
}
