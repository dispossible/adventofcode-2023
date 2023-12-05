import * as fs from "fs/promises";

export async function readFile(fileName: string, separator = "\n") {
    const input = await fs.readFile(fileName, { encoding: "utf-8" });
    return input
        .replaceAll("\r\n", "\n")
        .split(separator)
        .map((s) => s.trim())
        .filter((s) => !!s);
}

export function parseNumberList(numberStr: string, separator = " "): number[] {
    return numberStr
        .split(separator)
        .map((s) => s.trim())
        .filter((s) => !!s)
        .map((s) => parseInt(s, 10));
}
