import { unique } from "../utils/array";
import { parseNumberList, readFile } from "../utils/file";
import { replaceAt } from "../utils/string";

type Input = {
    towers: string[];
    groups: number[];
};

(async () => {
    const input = await readFile("12/input.txt");

    const rows: Input[] = input.map((line) => {
        const [towers, groups] = line.split(" ");
        return {
            towers: towers.split(""),
            groups: parseNumberList(groups, ","),
        };
    });

    const unfoldedRows = rows.map(unfold);

    console.log(JSON.stringify(unfoldedRows, null, 2));

    const validInsertMap: string[][] = [];

    for (const [i, row] of unfoldedRows.entries()) {
        console.log(`${i} / ${rows.length - 1}`);
        const possibleInserts = insertAllGroups([row.towers.join("")], row.groups);
        const validInserts = possibleInserts
            .map((s) => s.replaceAll("?", "."))
            .filter((i) => validateRow(i.split(""), row.groups));
        const uniqueInserts = unique(validInserts);
        validInsertMap.push(uniqueInserts);
    }

    // console.log({
    //     test: validateRow(["..##..#"], [2, 1]),
    // });
    // console.log({
    //     test: replaceAt("123", 1, "."),
    // });
    // console.log({
    //     test2: getAllPossibleInserts(".?.?#?.?", 1),
    // });
    // console.log({
    //     test3: insertAllGroups([".?.?#?.?"], [1, 1]),
    // });
    // console.log(
    //     JSON.stringify(
    //         validInsertMap.map((i) => i.map((ii) => ii.join(""))),
    //         null,
    //         2
    //     )
    // );
    console.log(JSON.stringify(validInsertMap, null, 2));
    console.log(validInsertMap.map((s) => s.length).join());
    console.log(validInsertMap.flat(1).length);
})();

function validateRow(towers: string[], groups: number[]) {
    if (towers.indexOf("?") >= 0) {
        return false;
    }
    const sets = towers
        .join("")
        .replace(/\.{2,}/g, ".")
        .split(".")
        .filter((s) => !!s);
    const setCounts = sets.reduce((lengths: number[], set) => [...lengths, set.length], []);

    return setCounts.every((count, i) => count === groups[i]) && setCounts.length === groups.length;
}

function insertCountIntoRow(row: string, count: number) {
    const matcher = new RegExp(`[\\?#]{${count}}`);
    const firstValidPos = row.match(matcher);
    if (firstValidPos?.index >= 0) {
        //return row.replace(matcher, "".padEnd(count, "#"));
        return replaceAt(row, firstValidPos.index, "".padEnd(count, "#"));
        //return row.toSpliced(firstValidPos.index, count, ...new Array(count).fill("#"));
    }
    return null;
}

function getAllPossibleInserts(row: string, count: number): string[] {
    const inserts = new Set<string>();
    let tempRow = row;

    while (tempRow.indexOf("?") >= 0) {
        const insert = insertCountIntoRow(tempRow, count);

        if (insert) {
            const newRow = [...row].map((c, i) => (c === "?" ? insert[i] : c));
            inserts.add(newRow.join(""));
        }

        const startIndex = tempRow.match(/[\?#]/)?.index; // tempRow.findIndex((char) => ["?", "#"].includes(char));
        tempRow = replaceAt(tempRow, startIndex, ".");
        //tempRow.splice(startIndex, 1, ".");
    }

    return [...inserts];
}

function insertAllGroups(startingSets: string[], groups: number[]): string[] {
    const nextGroup = startingSets.flatMap((set) => getAllPossibleInserts(set, groups[0]));
    const uniqueGroups = unique(nextGroup);

    if (uniqueGroups.length <= 1) {
        return uniqueGroups;
    }

    console.log(uniqueGroups.length);

    return unique([...uniqueGroups, ...insertAllGroups(uniqueGroups, groups.slice(1))]);
}

function uniqueSets(sets: string[][]): string[][] {
    return unique(sets.map((s) => s.join(""))).map((s) => s.split(""));
}

function unfold(inputs: Input): Input {
    // Part 1
    return inputs;

    // Part 2
    return {
        towers: [...inputs.towers, ...inputs.towers, ...inputs.towers, ...inputs.towers, ...inputs.towers],
        groups: [...inputs.groups, ...inputs.groups, ...inputs.groups, ...inputs.groups, ...inputs.groups],
    };
}
