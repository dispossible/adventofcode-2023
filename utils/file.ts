import * as fs from "fs/promises";

export async function readEntireFile(fileName: string) {
    return await fs.readFile(fileName, { encoding: "utf-8" });
}

export async function readFile(fileName: string, separator = "\n") {
    const input = await readEntireFile(fileName);
    return input
        .replaceAll("\r\n", "\n")
        .split(separator)
        .map((s) => s.trim())
        .filter((s) => !!s);
}

export async function readJsonFile<T>(fileName: string, fallback?: T): Promise<T> {
    try {
        const input = await readEntireFile(fileName);
        return JSON.parse(input);
    } catch (err) {
        if (fallback) return fallback;
        throw err;
    }
}

export async function writeFile(fileName: string, content: string) {
    return await fs.writeFile(fileName, content, { encoding: "utf-8" });
}

export async function writeJsonFile<T>(fileName: string, content: T) {
    return await writeFile(fileName, JSON.stringify(content));
}

export function parseNumberList(numberStr: string, separator = " "): number[] {
    return numberStr
        .split(separator)
        .map((s) => s.trim())
        .filter((s) => !!s)
        .map((s) => parseInt(s, 10));
}
