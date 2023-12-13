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
    const input = await readFile("12/input.txt");

    const rows: Input[] = input.map((line) => {
        const [towers, groups] = line.split(" ");
        return {
            towers,
            groups: parseNumberList(groups, ","),
        };
    });

    const unfolded = rows.map(unfold);

    //const sequences = generateSequences(rows[6]);
    const sequences = unfolded.map(generateSequences);

    console.log(sequences.join(","));
    console.log({
        sum: sum(sequences),
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
    return matches;
}

function generateSequences(input: Input) {
    console.log(input);

    const matches: Match[][] = [];

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

    console.log(matches);

    // const getPossibleHigherMatches = (match: Match, matchIndex: number) => {
    //     const higherMatches = matches[matchIndex];
    //     const count = higherMatches.filter((hm) => hm.index > match.index + match.text.length);

    //     if (matchIndex + 1 === matches.length) {
    //         return count.length;
    //     } else {
    //         return count.reduce((sum, match) => sum + getPossibleHigherMatches(match, matchIndex + 1), 0);
    //     }
    // };
    // const count = matches[0].reduce((sum, match) => sum + getPossibleHigherMatches(match, 1), 0);

    const sequences = new Set<string>();

    const counters = matches.map((match) => ({
        state: 0,
        max: match.length - 1,
    }));

    let counterIndexToDecrement = counters.length - 1;
    while (counterIndexToDecrement >= 0) {
        // Generate the sequence
        let sequence = input.towers;
        const matchesToUse = counters.map((counter, index) => matches[index][counter.state]);
        for (const match of matchesToUse) {
            sequence = replaceAt(sequence, match.index, match.text.replaceAll("?", "#"));
        }
        sequence = sequence.replaceAll("?", ".");
        if (validate(sequence, input.groups)) {
            sequences.add(sequence);
        }

        // Advance this dumb loop
        counterIndexToDecrement = counters.length - 1;
        while (counterIndexToDecrement >= 0) {
            const counterToDecrement = counters[counterIndexToDecrement];
            if (counterToDecrement.state >= counterToDecrement.max) {
                counterToDecrement.state = 0;
                counterIndexToDecrement--;
            } else {
                counterToDecrement.state++;
                break;
            }
        }
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

    return setCounts.every((count, i) => count === groups[i]) && setCounts.length === groups.length;
}

function unfold(input: Input): Input {
    // Part 1
    return input;

    // Part 2
    return {
        towers: `${input.towers}${input.towers}${input.towers}${input.towers}${input.towers}`,
        groups: [...input.groups, ...input.groups, ...input.groups, ...input.groups, ...input.groups],
    };
}
