

export default function isObject(a: any) {
    return (typeof a === "object" || typeof a === 'function') && (a !== null);
}