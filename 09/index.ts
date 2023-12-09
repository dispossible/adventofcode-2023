import { sum, unique } from "../utils/array";
import { parseNumberList, readFile } from "../utils/file";

(async () => {
    const sequences = (await readFile("09/input.txt")).map((line) => parseNumberList(line, " "));

    const newSequencesP1 = sequences.map((s) => addToSequence(s, 1));
    const newNumbersP1 = newSequencesP1.map((s) => s[s.length - 1]);

    const newSequencesP2 = sequences.map((s) => addToSequence(s, -1));
    const newNumbersP2 = newSequencesP2.map((s) => s[0]);

    console.log({
        newNumbers: newNumbersP1.join(","),
        sum1: sum(newNumbersP1),
        newNumbers2: newNumbersP2.join(","),
        sum2: sum(newNumbersP2),
    });
})();

function addToSequence(sequence: number[], direction = 1): number[] {
    const diffs = getDiffs(sequence);

    let diff = 0;

    if (unique(diffs).length === 1) {
        diff = getInDirection(diffs, direction);
    } else {
        const lowerDiffs = addToSequence(diffs, direction);
        diff = getInDirection(lowerDiffs, direction);
    }

    const prev = getInDirection(sequence, direction);

    if (direction === 1) {
        return [...sequence, prev + diff];
    } else {
        return [prev - diff, ...sequence];
    }
}

function getDiffs(sequence: number[]): number[] {
    const diffs = [];
    for (let i = 1; i < sequence.length; i++) {
        diffs.push(sequence[i] - sequence[i - 1]);
    }
    return diffs;
}

function getInDirection<T>(arr: T[], direction = 1) {
    return arr[direction === 1 ? arr.length - 1 : 0];
}
