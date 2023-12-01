import * as fs from "fs/promises";

const words = ["\\d", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
function wordToInt(val: string): number {
    if (!/\d/.test(val)) {
        return words.indexOf(val);
    }
    return parseInt(val, 10);
}

(async () => {
    const input = await fs.readFile("01/input.txt", { encoding: "utf-8" });

    const codes = input.split("\r\n").filter((a) => !!a);

    const numbers: number[] = [];
    for (const code of codes) {
        const min = code.replace(new RegExp(`^.*?(${words.join("|")}).*$`), "$1");
        const max = code.replace(new RegExp(`^.*(${words.join("|")}).*?$`), "$1");
        numbers.push(parseInt(`${wordToInt(min)}${wordToInt(max)}`, 10));
    }

    const sum = numbers.reduce((a, b) => a + b);

    console.log(sum);
})();
