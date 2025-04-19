import { Asset, Entry, Environment } from "contentful-management";
import {
    DEMAI_GENERATED_TAG_ID,
    DEMAI_GENERATED_TAG_NAME,
} from "../../../../../constants";

export default async function addDemaiTag(
    env: Environment,
    target: Asset | Entry,
): Promise<void> {
    const tagId = DEMAI_GENERATED_TAG_ID;
    const tagName = DEMAI_GENERATED_TAG_NAME;

    // Check if the tag exists, if not, create it
    let tag;
    try {
        tag = await env.getTag(tagId);
    } catch {
        tag = await env.createTag(tagId, tagName, "public");
    }

    // Link the tag to the asset
    target.metadata = {
        tags: [
            {
                sys: {
                    type: "Link",
                    linkType: "Tag",
                    id: tagId,
                },
            },
        ],
    };
}
