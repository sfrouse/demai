import {
    DEMAI_GENERATED_TAG_ID,
    DEMAI_GENERATED_TAG_NAME,
} from "../../../../../constants";
import createCMAEnvironment from "../../../../../contexts/AIStateContext/utils/createCMAEnvironment";
import { AIAction } from "../../../AIAction";

export default async function createAndSaveAsset(
    aiAction: AIAction,
    prompt: string,
    assetNameOverride?: string,
    assetDescriptionOverride?: string,
) {
    try {
        const formData = new FormData();
        formData.append("prompt", prompt.substring(0, 4000));
        const res = await fetch(
            // "http://localhost:4000/api/img",
            "https://demai-git-main-scott-f-rouses-projects.vercel.app/api/img",
            {
                method: "POST",
                body: formData,
            },
        );

        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        const file = new Uint8Array(buffer);

        // 2. Upload to Contentful
        const env = await createCMAEnvironment(
            aiAction.config.cma,
            aiAction.config.spaceId,
            aiAction.config.environmentId,
        );

        const upload = await env.createUpload({ file: file as any });

        const cleanUpName = (name: string, limit: number = 50) => {
            return name.replace(/[^a-zA-Z\s]/g, "").slice(0, limit);
        };

        // 3. Create and publish asset
        const asset = await env.createAsset({
            fields: {
                title: { "en-US": cleanUpName(assetNameOverride || prompt) },
                description: {
                    "en-US": cleanUpName(
                        assetDescriptionOverride || prompt,
                        255,
                    ),
                },
                file: {
                    "en-US": {
                        fileName: "image.png",
                        contentType: "image/png",
                        uploadFrom: {
                            sys: {
                                type: "Link",
                                linkType: "Upload",
                                id: upload.sys.id,
                            },
                        },
                    },
                },
            },
        });

        // Add a tag titled "demai-generated" to the asset
        const tagId = DEMAI_GENERATED_TAG_ID;
        const tagName = DEMAI_GENERATED_TAG_NAME;

        // Check if the tag exists, if not, create it
        let tag;
        try {
            tag = await env.getTag(tagId);
        } catch {
            tag = await env.createTag(tagId, tagName);
        }

        // Link the tag to the asset
        asset.metadata = {
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

        // ✅ Save metadata before processing/publishing
        await asset.update();

        const processedAsset = await asset.processForLocale("en-US");
        await processedAsset.publish();

        return {
            success: true,
            asset: processedAsset,
        };
    } catch (err) {
        return {
            success: false,
            errors: [`${err}`],
        };
    }
}
