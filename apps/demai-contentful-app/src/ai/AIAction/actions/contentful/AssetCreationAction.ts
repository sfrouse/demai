import {
    AIActionConfig,
    AIActionExecuteResults,
    AIActionPhase,
    AIActionSnapshot,
} from "../../AIActionTypes";
import { AIAction } from "../../AIAction";
import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AIModels } from "../../../openAI/openAIConfig";
import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import { createClient } from "contentful-management";

export class AssetCreationAction extends AIAction {
    static label = "Asset Creation";

    // async postExeDataUpdates(): Promise<void> {
    //     await Promise.all([
    //         this.loadProperty("contentTypes", true),
    //         this.loadProperty("components", true),
    //         this.loadProperty("css", true),
    //         this.loadProperty("ai", true),
    //         this.loadProperty("tokens", true),
    //         this.loadProperty("research", true),
    //     ]);
    // }

    constructor(
        config: AIActionConfig,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, getContentState, loadProperty, snapshotOverrides);

        this.introMessage = "What kind of image would you like to make?";
        this.executionPrompt = "Saving image to assets";
        this.placeholder =
            "Describe what you would like this image to be like. Try to be descriptive...";
        this.system = {
            role: "system",
            content: `
You are a visual brand assistant for a headless CMS platform.
Your job is to create clean, modern, and on-brand visuals that reflect the identity of potential Contentful customers.
Focus on clarity, visual storytelling, and contextual relevance.
Avoid generic stock imagery and prioritize scenes that support dynamic content workflows, digital storefronts, or modern editorial experiences.
Always align with the tone of the prospect’s brand—whether it’s playful, luxurious, technical, or minimal.`,
        };
        this.toolType = "none";

        this.model = AIModels.dalle3;
    }

    async runExe(
        addError: (err: AppError) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ): Promise<AIActionExecuteResults> {
        this.updateSnapshot({
            startExecutionRunTime: Date.now(),
            isRunning: true,
        });

        const client = createClient({
            accessToken: this.config.cma,
        });
        const space = await client.getSpace(this.config.spaceId);
        const env = await space.getEnvironment(this.config.environmentId);
        // Step 1: Upload the file
        const imageUrl =
            "https://oaidalleapiprodscus.blob.core.windows.net/private/org-OvSjLZ0OEit4vwro9WEf7dR5/user-StGvY9IhmvacJIGMot95n6bw/img-uk16YzKa56MU8YQyaYrCz9Pf.png?st=2025-04-18T16%3A23%3A58Z&se=2025-04-18T18%3A23%3A58Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=475fd488-6c59-44a5-9aa9-31c4db451bea&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-18T06%3A09%3A24Z&ske=2025-04-19T06%3A09%3A24Z&sks=b&skv=2024-08-04&sig=bAlpd%2BrHIXEaOV2FDK2P0%2BALnhEVaITDExPXoCuup04%3D";
        const response = await fetch(imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer()); // Simulate node Buffer

        const upload = await env.createUpload({ file: buffer as any });

        // Step 2: Create the asset
        const asset = await env.createAsset({
            fields: {
                title: {
                    "en-US": "My Image",
                },
                description: {
                    "en-US": "A sleek, futuristic city skyline at sunset.",
                },
                file: {
                    "en-US": {
                        contentType: "image/png",
                        fileName: "image.png",
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

        // Step 3: Process and publish
        await asset.processForAllLocales();
        await asset.publish();

        console.log(`Asset published with ID: ${asset.sys.id}`);

        this.updateSnapshot({
            executeRunTime: Date.now() - this.startExecutionRunTime!,
            isRunning: false,
            phase: AIActionPhase.executed,
            executionResponse: `Executed: `,
            errors: [],
        });
        await this.postExeDataUpdates();
        return {
            success: true,
            result: this.executionResponse,
            toolCalls: [],
            toolResults: [],
        };
    }
}
