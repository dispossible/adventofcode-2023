import { sum } from "../utils/array";
import { readFile } from "../utils/file";

const isNumber = (str: string) => /\d/.test(str);
const isSymbol = (str: string) => /[^\d\.]/.test(str);
const isGear = (chars: string) => /\*/.test(chars);
const containsSymbol = (chars: string[]) => chars?.filter(isSymbol)?.length > 0;
const containsGear = (chars: string[]) => chars?.filter(isGear)?.length > 0;

(async () => {
    const input = await readFile("03/input.txt");
    //const input = await readFile("03/test.txt"); // p1: 413 // p2:  6756

    const lines = input.map((line) => line.split(""));

    const partNumbers: number[] = [];
    const gearMap = new Map<string, number[]>();

    for (const [lineIndex, chars] of lines.entries()) {
        for (let charIndex = 0; charIndex < chars.length; charIndex++) {
            const char = chars[charIndex];

            if (isNumber(char)) {
                // Get the full number
                let fullNumber = "";
                let nextIndex = charIndex;
                let lastIndex = charIndex;
                while (true) {
                    const nextChar = chars[nextIndex];
                    if (isNumber(nextChar)) {
                        fullNumber += nextChar;
                        lastIndex = nextIndex;
                        nextIndex++;
                    } else {
                        break;
                    }
                }

                let isPartNumber = false;
                // Check left
                const left = chars[charIndex - 1];
                if (left && isSymbol(left)) {
                    isPartNumber = true;
                }
                // Check right
                const right = chars[lastIndex + 1];
                if (right && isSymbol(right)) {
                    isPartNumber = true;
                }
                // Check up
                const prevLine = lines[lineIndex - 1];
                const aboveChars = prevLine?.slice(Math.max(0, charIndex - 1), lastIndex + 2);
                if (aboveChars && containsSymbol(aboveChars)) {
                    isPartNumber = true;
                }
                // Check down
                const nextLine = lines[lineIndex + 1];
                const belowChars = nextLine?.slice(Math.max(0, charIndex - 1), lastIndex + 2);
                if (belowChars && containsSymbol(belowChars)) {
                    isPartNumber = true;
                }

                const partNumber = parseInt(fullNumber, 10);
                if (isPartNumber) {
                    partNumbers.push(partNumber);
                }

                // Deal with gears
                let gearId: string | null = null;
                if (containsGear(aboveChars)) {
                    gearId = `${lineIndex - 1}-${Math.max(0, charIndex - 1) + aboveChars.indexOf("*")}`;
                } else if (isGear(left)) {
                    gearId = `${lineIndex}-${Math.max(0, charIndex - 1)}`;
                } else if (isGear(right)) {
                    gearId = `${lineIndex}-${lastIndex + 1}`;
                } else if (containsGear(belowChars)) {
                    gearId = `${lineIndex + 1}-${Math.max(0, charIndex - 1) + belowChars.indexOf("*")}`;
                }

                if (gearId) {
                    if (gearMap.has(gearId)) {
                        gearMap.get(gearId)?.push(partNumber);
                    } else {
                        gearMap.set(gearId, [partNumber]);
                    }
                }

                // Skip over the consumed digits (and the trailing symbol/dot)
                charIndex += lastIndex - charIndex;
            }
        }
    }

    const gearRatios = [...gearMap.values()]
        .filter((numbers) => numbers.length === 2)
        .map((numbers) => numbers[0] * numbers[1]);

    console.log({
        partsSum: sum(partNumbers),
        gearsSum: sum(gearRatios),
    });
})();
