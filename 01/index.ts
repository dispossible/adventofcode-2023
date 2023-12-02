import { sum } from "../utils/array";
import { readFile } from "../utils/file";

const words = ["\\d", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
function wordToInt(val: string): number {
    if (!/\d/.test(val)) {
        return words.indexOf(val);
    }
    return parseInt(val, 10);
}

(async () => {
    const codes = await readFile("01/input.txt");

    const numbers: number[] = [];
    for (const code of codes) {
        const min = code.replace(new RegExp(`^.*?(${words.join("|")}).*$`), "$1");
        const max = code.replace(new RegExp(`^.*(${words.join("|")}).*?$`), "$1");
        numbers.push(parseInt(`${wordToInt(min)}${wordToInt(max)}`, 10));
    }

    console.log(sum(numbers));
})();
