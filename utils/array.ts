export function range(start: number, end: number): number[] {
    return new Array(end - start).map((_, i) => i + start);
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

export function intersection(arr1: unknown[], arr2: unknown[]): unknown[] {
    return arr1.filter((val) => arr2.includes(val));
}
