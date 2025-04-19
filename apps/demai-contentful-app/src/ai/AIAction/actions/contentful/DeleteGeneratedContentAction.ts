import { Environment } from "contentful-management";
import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../../AIActionTypes";
import {
    DEMAI_GENERATED_PROPERTY_IDENTIFIER,
    DEMAI_GENERATED_TAG_ID,
} from "../../../../constants";
import createCMAEnvironment from "../../../../contexts/AIStateContext/utils/createCMAEnvironment";
import { DEMAI_COMPONENT_CTYPE_ID } from "../../../mcp/designSystemMCP/validate/ctypes/demaiComponentCType";

export class DeleteGeneratedContentAction extends AIAction {
    static label = "Delete Generated Content";

    async postExeDataUpdates(): Promise<void> {
        await Promise.all([
            this.loadProperty("contentTypes", true),
            this.loadProperty("components", true),
            this.loadProperty("assets", true),
            this.loadProperty("research", true),
            this.loadProperty("entries", true),
        ]);
    }

    async run(addError: (err: AppError) => void): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };

        this.updateSnapshot({
            isRunning: true,
            request: "Delete all generated content.",
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        await this.deleteCompBindings(addError);
        await this.deletePriorAssets(addError);

        const deleteResults = await this.deleteAllCTypes(
            DEMAI_GENERATED_PROPERTY_IDENTIFIER,
            addError,
        );

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            response: `Deleted \`${deleteResults?.total}\` content types and \`${deleteResults?.totalEntries}\` entries.`,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });

        await this._postExeDataUpdates();
        return results;
    }

    async runAnswerOrDescribe(
        addError: (err: AppError) => void,
    ): Promise<AIActionRunResults> {
        return this.run(addError);
    }

    async runExe(
        addError: (err: AppError) => void,
    ): Promise<AIActionExecuteResults> {
        const runResults = await this.run(addError);
        return {
            ...runResults,
            toolCalls: [],
            toolResults: [],
        };
    }

    async deleteCompBindings(addError: (err: AppError) => void) {
        try {
            const env: Environment = await createCMAEnvironment(
                this.config.cma,
                this.config.spaceId,
                this.config.environmentId,
            );

            const compInfo = await env.getEntries({
                content_type: DEMAI_COMPONENT_CTYPE_ID,
                limit: 1000, // adjust as needed
            });

            const updated: string[] = [];
            for (const entry of compInfo.items) {
                if (entry.fields?.bindings?.["en-US"]) {
                    entry.fields.bindings["en-US"] = [];
                    const updatedEntry = await entry.update();
                    if (entry.sys.publishedVersion) {
                        await updatedEntry.publish();
                    }
                    updated.push(entry.sys.id);
                }
            }

            return { success: true, updated };
        } catch (err) {
            addError({
                service: "Deleting all DemAI Assets",
                message: "Error trying to delete assets related to DemAI",
                details: `${err}`,
            });
        }
    }

    async deletePriorAssets(addError: (err: AppError) => void) {
        try {
            const env = await createCMAEnvironment(
                this.config.cma,
                this.config.spaceId,
                this.config.environmentId,
            );

            const assets = await env.getAssets({
                "metadata.tags.sys.id[in]": DEMAI_GENERATED_TAG_ID,
                limit: 1000,
            });

            const deleted: string[] = [];

            for (const asset of assets.items) {
                try {
                    if (asset.sys.publishedVersion) {
                        await asset.unpublish();
                    }
                    await asset.delete();
                    deleted.push(asset.sys.id);
                } catch (err) {
                    console.error(
                        `Failed to delete asset ${asset.sys.id}:`,
                        err,
                    );
                }
            }

            return deleted;
        } catch (err) {
            addError({
                service: "Deleting all DemAI Assets",
                message: "Error trying to delete assets related to DemAI",
                details: `${err}`,
            });
        }
    }

    async deleteAllCTypes(
        ctypeIdentifier: string,
        addError: (err: AppError) => void,
    ) {
        try {
            const env = await createCMAEnvironment(
                this.config.cma,
                this.config.spaceId,
                this.config.environmentId,
            );

            const contentTypes = await env.getContentTypes({ limit: 1000 });

            let total = 0;
            let totalEntries = 0;
            for (const contentType of contentTypes.items) {
                // if (contentType.sys.id.indexOf(`${DESIGN_SYSTEM_PREFIX}-`) !== 0) {
                const demaiPropIdentifier = contentType.fields.find(
                    (field: any) => field.id === ctypeIdentifier,
                );
                if (demaiPropIdentifier) {
                    totalEntries = await this.deleteAllEntriesByContentType(
                        contentType.sys.id,
                        addError,
                        totalEntries,
                    );
                    if (!contentType.isPublished()) {
                        await contentType.delete();
                    } else {
                        await contentType.unpublish();
                        await contentType.delete();
                    }
                    total = total + 1;
                }
            }

            return {
                total,
                totalEntries,
            };
        } catch (err) {
            addError({
                service: "Deleting all DemAI Entries",
                message: "Error trying to delete entries related to DemAI",
                details: `${err}`,
            });
        }
    }

    async deleteAllEntriesByContentType(
        contentTypeIdToDelete: string,
        addError: (err: AppError) => void,
        totalDeleted: number = 0,
    ) {
        let total = totalDeleted;
        try {
            const env = await createCMAEnvironment(
                this.config.cma,
                this.config.spaceId,
                this.config.environmentId,
            );

            const entries = await env.getEntries({
                content_type: contentTypeIdToDelete,
                limit: 1000,
            });

            for (const entry of entries.items) {
                try {
                    if (entry.isPublished()) {
                        await entry.unpublish();
                    }
                    await entry.delete();
                    total += 1;
                } catch (entryErr) {
                    addError({
                        message: `Failed to delete entry ${entry.sys.id}`,
                        service: "Delete Entry",
                        details: entryErr,
                    });
                }
            }
        } catch (err) {
            addError({
                service: "Deleting Entries by Content Type",
                message: "Failed to delete entries",
                details: `${err}`,
            });
        }
        return total;
    }
}
