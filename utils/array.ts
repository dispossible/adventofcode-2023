export function range(start: number, size: number): number[] {
    return new Array(size).fill(0).map((_, i) => i + start);
}
export function sum(arr: (number | string)[]): number {
    return arr.reduce<number>((a, b) => {
        if (typeof a === "string") {
            a = parseInt(a, 10);
        }
        if (typeof b === "string") {
            b = parseInt(b, 10);
        }
        return a + b;
    }, 0);
}

export function intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((val) => arr2.includes(val));
}

export function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}
