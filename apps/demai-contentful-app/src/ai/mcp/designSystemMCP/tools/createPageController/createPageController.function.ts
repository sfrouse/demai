import { createClient, Entry } from "contentful-management";
import { DesignSystemMCPClient } from "../../DesignSystemMCPClient";
import { DEMAI_CONTROLLER_CTYPE_ID } from "../../validate/ctypes/demaiControllerCType";

export default async function createPageControllerFunction(
    mcp: DesignSystemMCPClient,
    params: any,
) {
    createPageController(params, mcp);
}

type PageControllerParams = {
    id: string;
    title: string;
    slug: string;
    description: string;
    view: string;
    children: PageControllerParams[];
};

async function createPageController(
    params: PageControllerParams,
    mcp: DesignSystemMCPClient,
) {
    const client = createClient({ accessToken: mcp.cma });
    const space = await client.getSpace(mcp.spaceId);
    const environment = await space.getEnvironment(mcp.environmentId);

    try {
        // TODO: check for existing slug...
        await environment.getEntry(params.id);
    } catch {} // we are good...

    // Create the new view
    let pageViewEntry: Entry | undefined;
    try {
        const contentType = await environment.getContentType(params.view);
        if (contentType) {
            pageViewEntry = await environment.createEntryWithId(
                params.view,
                `${params.id}-view`,
                {
                    fields: {
                        title: { "en-US": `${params.title} View` },
                    },
                },
            );
        }
    } catch {
        console.log("No content type", params.view);
        return;
    } // we are good...

    if (!pageViewEntry) {
        console.log("No content type");
        return;
    }

    const pageController = await environment.createEntryWithId(
        DEMAI_CONTROLLER_CTYPE_ID,
        params.id,
        {
            fields: {
                title: { "en-US": params.title },
                description: { "en-US": params.description },
                slug: { "en-US": params.slug },
                view: {
                    "en-US": {
                        sys: {
                            type: "Link",
                            linkType: "Entry",
                            id: pageViewEntry.sys.id,
                        },
                    },
                },
            },
        },
    );

    if (params.children) {
        const childEntries = [];
        for (const childParams of params.children) {
            const child = await createPageController(childParams, mcp);
            childEntries.push({
                sys: {
                    type: "Link",
                    linkType: "Entry",
                    id: child?.sys.id,
                },
            });
        }
        const latestPageController = await environment.getEntry(
            pageController.sys.id,
        );
        latestPageController.fields.children = {
            "en-US": childEntries,
        };
        await latestPageController.update();
        console.log("latestPageController", latestPageController);
        return latestPageController;
    }

    console.log("pageController", pageController);
    return pageController;
}
