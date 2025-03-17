

export default function arrayDifference<T>(arr1: T[], arr2: T[]): T[][] {
    if (!arr1 && arr2) {
        return [[], [...arr2]];
    }
    if (arr1 && !arr2) {
        return [[...arr1], []];
    }
    if (!arr1 && !arr2) {
        return [[], []];
    }
    const uniqueInArr1 = arr1.filter(item => arr2.indexOf(item) === -1);
    const uniqueInArr2 = arr2.filter(item => arr1.indexOf(item) === -1);
    return [uniqueInArr1, uniqueInArr2];
}