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
const runtime = () => new Date(Date.now() - start).toISOString().split("T")[1].split(".")[0];

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

    //return generateSequences(unfolded[8], 8); // 45

    const sequences = unfolded.map((input, line) => {
        return generateSequences(input, line);
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
    let finds = 0;
    while ((found = reg.exec(str))) {
        matches.push({ text: found[0], index: found.index });
        reg.lastIndex = found.index + 1;
        finds++;
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

function generateSequences(input: Input, lineNumber: number) {
    lineNumber++;

    console.log({ ...input, lineNumber });

    const matches: Match[][] = [];
    for (const [index, group] of input.groups.entries()) {
        const precedingSets = input.groups
            .slice(0, index)
            .map((size) => `[\\?#]{${size}}`)
            .join("[\\.\\?]+?");
        const precedingLookup = new RegExp(precedingSets ? `^[\\.\\?]*?${precedingSets}[\\.\\?]+?` : "^[\\.\\?]*?");
        const preceding = input.towers.match(precedingLookup);
        const minIndex = (preceding.index ?? 0) + (preceding[0]?.length ?? 0);

        const followingSets = input.groups
            .slice(index + 1, input.groups.length)
            .map((size) => `[\\?#]{${size}}`)
            .join("[\\.\\?]+?");
        const followingLookup = new RegExp(
            followingSets ? `(.*)[\\.\\?]+?${followingSets}[\\.\\?]*?$` : `(.*)[\\.\\?]*?$`
        );
        const following = input.towers.match(followingLookup);
        const maxIndex = following[1]?.length ?? input.towers.length;

        const searchSpace = input.towers.substring(minIndex, maxIndex);

        const search = `(?<!#)[\\?#]{${group}}(?!#)`;
        const groupMatches = findAllMatches(new RegExp(search), searchSpace);
        const alignedMatches = groupMatches.map((m) => ({ ...m, index: m.index + minIndex }));

        matches.push(alignedMatches);
    }

    let sequences = 0;
    const counters = matches.map((match) => ({
        state: 0,
        max: match.length - 1,
    }));

    let ticking = true;

    const visualizeSequence = () => {
        // Generate the sequence
        let sequence = input.towers;
        for (const [i, counter] of counters.entries()) {
            const match = matches[i][counter.state];
            sequence = replaceAt(sequence, match.index, match.text.replace(/\?/g, "#"));
        }
        return sequence.replace(/\?/g, ".");
    };

    const incrementCounter = (counterIndex: number) => {
        const counter = counters[counterIndex];
        if (!counter) {
            ticking = false;
            return;
        }

        if (counter.state >= counter.max) {
            incrementCounter(counterIndex - 1);
            const previousCounter = counters[counterIndex - 1];
            if (!previousCounter) {
                counter.state = 0;
                return;
            }
            const previousMatch = matches[counterIndex - 1][previousCounter.state];
            const resetPoint = matches[counterIndex].findIndex(
                (m) => m.index > previousMatch.index + previousMatch.text.length
            );
            counter.state = resetPoint ?? 0;
        } else {
            counter.state++;
        }
    };

    const validateCountersSkip = () => {
        const hashes = /#+/g;
        let found: RegExpExecArray;
        while ((found = hashes.exec(input.towers))) {
            const counterHasHash = counters.some((counter, i) => {
                const match = matches[i][counter.state];
                return found.index >= match?.index && found.index < match?.index + match?.text?.length;
            });
            if (!counterHasHash) {
                //Is it before counter 0
                if (matches[0][counters[0].state]?.index > found.index + found[0].length) {
                    // Then we're done, nothing else will match
                    counters.forEach((c) => (c.state = 9999));
                }

                // Ok so find the offender
                const counterIBeforeHash = counters.findLastIndex(
                    (counter, i) =>
                        matches[i][counter.state]?.index + matches[i][counter.state]?.text?.length < found.index
                );
                if (counterIBeforeHash < 0) {
                    ticking = false;
                    return;
                }

                // Tick it on
                incrementCounter(counterIBeforeHash);

                // If that hasn't fixed it we need to reset the following counters
                const counterBeforeHash = counters[counterIBeforeHash];
                const matchBeforeHash = matches[counterIBeforeHash][counterBeforeHash.state];
                if (matchBeforeHash.index + matchBeforeHash.text.length < found.index) {
                    const counterAfterHash = counters[counterIBeforeHash + 1];
                    // If there isn't a counter ahead, we need to jump to be valid
                    if (!counterAfterHash) {
                        const matchesBeforeHash = matches[counterIBeforeHash];
                        const nextValidState = matchesBeforeHash.findIndex(
                            (match) => match.index + match.text.length >= found.index
                        );
                        counterBeforeHash.state = nextValidState;
                    } else {
                        // Reset the following counters to their lowest positions that are valid
                        for (let i = counterIBeforeHash + 1; i < counters.length; i++) {
                            const counter = counters[i];
                            const previousCounter = counters[i - 1];
                            const previousMatch = matches[i - 1][previousCounter.state];
                            const resetPoint = matches[i].findIndex(
                                (m) => m.index > previousMatch.index + previousMatch.text.length
                            );
                            counter.state = resetPoint ?? 0;
                        }
                    }
                }

                validateCountersSkip();
            }
        }
    };

    validateCountersSkip();
    while (ticking) {
        if (sequences % 1_000_000 === 0)
            console.log(
                lineNumber,
                counters.map((counter) => `${counter.state.toFixed(0).padStart(2, "0")}`).join("-"),
                visualizeSequence(),
                runtime(),

                sequences
            );

        sequences++;
        incrementCounter(counters.length - 1);
        validateCountersSkip();
    }

    console.log({
        permutations: sequences,
    });
    return sequences;
}

function unfold(input: Input): Input {
    // Part 1
    //return input;

    // Part 2
    return {
        towers: `${input.towers}?${input.towers}?${input.towers}?${input.towers}?${input.towers}`,
        groups: [...input.groups, ...input.groups, ...input.groups, ...input.groups, ...input.groups],
    };
}
