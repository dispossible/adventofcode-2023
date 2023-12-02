import * as fs from "fs/promises";

export async function readFile(fileName: string) {
    const input = await fs.readFile(fileName, { encoding: "utf-8" });
    return input
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => !!s);
}
