

export default function flatTokensToNested(flatTokens) {
    const nested = {};

    Object.entries(flatTokens).forEach(([key, value]) => {
        const parts = key.split("_").slice(1); // Remove prefix
        let current = nested;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
    });

    return nested;
}