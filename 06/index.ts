import { range } from "../utils/array";

const races = [
    {
        time: 59,
        distance: 430,
    },
    {
        time: 70,
        distance: 1218,
    },
    {
        time: 78,
        distance: 1213,
    },
    {
        time: 78,
        distance: 1276,
    },
];

const races2 = [
    {
        time: 59707878,
        distance: 430121812131276,
    },
];

function calculateRace(holdTime: number, raceTime: number): number {
    const travelTime = raceTime - holdTime;
    const distance = holdTime * travelTime;
    return distance;
}

const wins: number[] = [];

for (const race of races2) {
    const winningTimes: number[] = [];

    for (const holdTime of range(1, race.time - 2)) {
        if (holdTime % 5000 === 0) console.log(`${holdTime} / ${race.time}`);

        const distance = calculateRace(holdTime, race.time);

        if (distance > race.distance) {
            winningTimes.push(holdTime);
        }
    }

    wins.push(winningTimes.length);
}

console.log({
    wins,
    product: wins.reduce((a, b) => a * b),
});
