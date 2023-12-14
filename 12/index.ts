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

(async () => {
    const input = await readFile("12/test.txt");

    const rows: Input[] = input.map((line) => {
        const [towers, groups] = line.split(" ");
        return {
            towers,
            groups: parseNumberList(groups, ","),
        };
    });

    const unfolded = rows.map(unfold);

    const sequences = generateSequences(unfolded[6]);
    // const sequences = unfolded.map((input, line) => {
    //     console.log({
    //         line,
    //     });
    //     return generateSequences(input);
    // });

    // console.log(sequences.join(","));
    // console.log({
    //     sum: sum(sequences),
    // });
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

    const totalTowers = sum(input.groups);
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
        console.log(matcher);

        matches.push(findAllMatches(matcher, input.towers));
    }

    const sequences = new Set<string>();
    const counters = matches.map((match) => ({
        state: 0,
        max: match.length - 1,
    }));

    console.log(matches);

    let tick = 0;
    let counterIndexToDecrement = counters.length - 1;
    search: while (counterIndexToDecrement >= 0) {
        // Generate the sequence
        let sequence = input.towers;
        const matchesToUse = counters.map((counter, index) => matches[index][counter.state]);
        for (const match of matchesToUse) {
            sequence = replaceAt(sequence, match.index, match.text.replace(/\?/g, "#"));
        }
        sequence = sequence.replace(/\?/g, ".");

        if (validate(sequence, input.groups)) {
            sequences.add(sequence);

            //if (tick % 100_000 === 0)
            console.log(counters.map((counter) => counter.state).join("-"), sequence, "valid", tick);
        } else {
            //if (tick % 100_000 === 0)
            console.log(counters.map((counter) => counter.state).join("-"), sequence, "invalid", tick);
        }

        // Advance this dumb loop
        counterIndexToDecrement = counters.length - 1;
        tick: while (counterIndexToDecrement >= 0) {
            const counterToDecrement = counters[counterIndexToDecrement];
            if (counterToDecrement.state >= counterToDecrement.max) {
                const previousCounter = counters[counterIndexToDecrement - 1];
                if (previousCounter) {
                    const previousMatches = matches[counterIndexToDecrement - 1];
                    const previousIndex = previousMatches[previousCounter.state].index;
                    const resetPoint = matches[counterIndexToDecrement].findIndex((m) => m.index > previousIndex);
                    counterToDecrement.state = resetPoint ?? 0;
                } else {
                    counterToDecrement.state = 0;
                }
                counterIndexToDecrement--;
            } else {
                counterToDecrement.state++;
                break tick;
            }
        }
        tick++;
    }

    console.log(sequences.size);
    return sequences.size;
}

function validate(towers: string, groups: number[]) {
    if (towers.indexOf("?") >= 0) {
        return false;
    }
    const sets = towers
        .replace(/\.{2,}/g, ".")
        .split(".")
        .filter((s) => !!s);
    const setCounts = sets.reduce((lengths: number[], set) => [...lengths, set.length], []);

    const isValid = setCounts.every((count, i) => count === groups[i]) && setCounts.length === groups.length;
    return isValid;
}

function unfold(input: Input): Input {
    // Part 1
    return input;

    // Part 2
    return {
        towers: `${input.towers}?${input.towers}?${input.towers}?${input.towers}?${input.towers}`,
        groups: [...input.groups, ...input.groups, ...input.groups, ...input.groups, ...input.groups],
    };
}
