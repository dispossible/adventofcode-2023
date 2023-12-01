import * as fs from "fs/promises";

const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
function wordToInt(val: string) {
    if (!/^\d+$/.test(val)) {
        val = `${words.indexOf(val)}`;
    }
    return val;
}

(async () => {
    const input = await fs.readFile("01/input.txt", { encoding: "utf-8" });

    const codes = input.split("\r\n").filter((a) => !!a);

    const numbers: number[] = [];
    for (let code of codes) {
        let min = code.replace(/^.*?((\d|one|two|three|four|five|six|seven|eight|nine)).*$/, "$1");
        let max = code.replace(/^.*(\d|one|two|three|four|five|six|seven|eight|nine).*?$/, "$1");

        min = wordToInt(min);
        max = wordToInt(max);

        numbers.push(parseInt(`${min}${max}`));
    }

    const sum = numbers.reduce((a, b) => a + b);

    console.log({ numbers, sum });
})();
