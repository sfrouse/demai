export default function renderTime(ms: number) {
    const seconds = ms / 1000;
    return seconds < 60
        ? `${seconds.toFixed(2)}s`
        : `${(seconds / 60).toFixed(1)}m`;
}
