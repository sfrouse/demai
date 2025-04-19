import { createClient } from "contentful-management";

const environmentCache = new Map<
    string,
    { env: any; timeoutId: NodeJS.Timeout }
>();

export default async function createCMAEnvironment(
    cmaToken: string,
    spaceId: string,
    environmentId: string,
): Promise<any> {
    const cacheKey = `${spaceId}:${environmentId}`;

    const cached = environmentCache.get(cacheKey);
    if (cached) {
        return cached.env;
    }

    try {
        const client = createClient({ accessToken: cmaToken });

        const environment = await client
            .getSpace(spaceId)
            .then((space: any) => space.getEnvironment(environmentId));

        const timeoutId = setTimeout(() => {
            environmentCache.delete(cacheKey);
        }, 10 * 60 * 1000); // 10 minutes

        environmentCache.set(cacheKey, { env: environment, timeoutId });

        return environment;
    } catch (error) {
        console.error("Error fetching environment:", error);
        throw error;
    }
}
