import { doMapping, type MapRange, type Range } from "./mapping";

test("Mapping1", () => {
    const mappings: MapRange[] = [
        {
            from: {
                start: 0,
                end: 10,
            },
            to: {
                start: 100,
                end: 110,
            },
        },
    ];

    const range: Range = {
        start: 5,
        end: 10,
    };

    expect(doMapping(mappings, [range])).toEqual([
        {
            start: 105,
            end: 110,
        },
    ]);
});

test("Mapping2", () => {
    const mappings: MapRange[] = [
        {
            from: {
                start: 10,
                end: 20,
            },
            to: {
                start: 110,
                end: 120,
            },
        },
    ];

    const range: Range = {
        start: 5,
        end: 10,
    };

    expect(doMapping(mappings, [range])).toEqual([
        {
            start: 110,
            end: 110,
        },
        {
            start: 5,
            end: 9,
        },
    ]);
});

test("Mapping3", () => {
    const mappings: MapRange[] = [
        {
            from: {
                start: 10,
                end: 20,
            },
            to: {
                start: 110,
                end: 120,
            },
        },
    ];

    const range: Range = {
        start: 20,
        end: 25,
    };

    expect(doMapping(mappings, [range])).toEqual([
        {
            start: 120,
            end: 120,
        },
        {
            start: 21,
            end: 25,
        },
    ]);
});

test("Mapping4", () => {
    const mappings: MapRange[] = [
        {
            from: {
                start: 10,
                end: 20,
            },
            to: {
                start: 110,
                end: 120,
            },
        },
    ];

    const range: Range = {
        start: 5,
        end: 25,
    };

    expect(doMapping(mappings, [range])).toEqual([
        {
            start: 110,
            end: 120,
        },
        {
            start: 5,
            end: 9,
        },
        {
            start: 21,
            end: 25,
        },
    ]);
});

test("Mapping5", () => {
    const mappings: MapRange[] = [
        {
            from: {
                start: 10,
                end: 20,
            },
            to: {
                start: 110,
                end: 120,
            },
        },
        {
            from: {
                start: 25,
                end: 35,
            },
            to: {
                start: 225,
                end: 235,
            },
        },
    ];

    const range: Range = {
        start: 5,
        end: 25,
    };

    expect(doMapping(mappings, [range])).toEqual([
        {
            start: 110,
            end: 120,
        },
        {
            start: 5,
            end: 9,
        },
        {
            start: 225,
            end: 225,
        },
        {
            start: 21,
            end: 24,
        },
    ]);
});

test("Mapping6", () => {
    const mappings: MapRange[] = [
        {
            from: {
                start: 0,
                end: 10,
            },
            to: {
                start: 100,
                end: 110,
            },
        },
    ];

    const range: Range = {
        start: 3,
        end: 7,
    };

    expect(doMapping(mappings, [range])).toEqual([
        {
            start: 103,
            end: 107,
        },
    ]);
});
