import React, { useEffect, useState } from "react";
import { Flex, Heading, Paragraph } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import {
    ContentStateResearch,
    useContentStateSession,
} from "../../../../contexts/ContentStateContext/ContentStateContext";
import scrollBarStyles from "../../../utils/ScrollBarMinimal.module.css";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../../locations/config/ConfigScreen";
import { createClient } from "contentful-management";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../../../ai/mcp/researchMCP/validate/ctypes/demaiResearchCType";
import { useSDK } from "@contentful/react-apps-toolkit";
import EditableResearchField from "./ResearchContent/EditableResearchField";
import ContentSectionHeader from "../../ContentSectionHeader/ContentSectionHeader";
import ColorTokensContent from "../DesignSystem/sections/ColorTokensContent";
import { CONTENT_PANEL_MAX_WIDTH } from "../../../../constants";
import LoadingStyles from "../../../Loading/LoadingStyles";

const ResearchContent = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState, spaceStatus } =
        useContentStateSession();
    const [fieldInEditMode, setFieldInEditMode] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [localResearch, setLocalResearch] = useState<
        ContentStateResearch | undefined
    >();

    useEffect(() => {
        loadProperty("research");
        loadProperty("tokens");
    }, [contentState]);

    useEffect(() => {
        const research = contentState.research;
        setLocalResearch({
            ...(research?.fields as any),
        });
    }, [contentState.research]);

    const isLoading = loadingState.research === true || !spaceStatus?.valid;

    const research = contentState.research;

    const saveResearch = async (id: string) => {
        setIsSaving(true);
        const params = sdk.parameters.installation as AppInstallationParameters;
        const client = createClient({
            accessToken: params.cma,
        });
        const space = await client.getSpace(sdk.ids.space);
        const environment = await space.getEnvironment(sdk.ids.environment);

        const entryId = DEMAI_RESEARCH_SINGLETON_ENTRY_ID;
        let entry;
        try {
            entry = await environment.getEntry(entryId);
        } catch (err: any) {
            if (err.name === "NotFound") {
                sdk.notifier.error("Singleton entry not found.");
                return;
            }
            throw err; // rethrow if it's another type of error
        }

        entry.fields[id] = {
            "en-US": localResearch![id as keyof ContentStateResearch],
        };

        const updatedEntry = await entry.update();
        await updatedEntry.publish();

        sdk.notifier.success("Research saved!");

        setIsSaving(false);
        loadProperty("research", true);
        setFieldInEditMode("");
    };

    return (
        <>
            <ContentPanelHeader title="Research" invalidate />
            <Flex
                flexDirection="column"
                className={scrollBarStyles["scrollbar-minimal"]}
                alignItems="center"
                style={{
                    overflowY: "auto",
                    flex: 1,
                    padding: `${tokens.spacingL} ${tokens.spacing2Xl} 100px ${tokens.spacing2Xl}`,
                    ...LoadingStyles(isLoading),
                    position: "relative",
                }}
                alignContent="stretch"
            >
                <div
                    style={{
                        maxWidth: CONTENT_PANEL_MAX_WIDTH,
                        width: "100%",
                    }}
                >
                    {research && research.fields && (
                        <>
                            {research.fields.prospect && (
                                <Heading>{research.fields.prospect}</Heading>
                            )}
                            {research.fields.mainWebsite && (
                                <>
                                    <ContentSectionHeader
                                        title={"Main Website"}
                                    />
                                    <Paragraph>
                                        <a
                                            href={research.fields.mainWebsite}
                                            target="_new"
                                            style={{
                                                color: tokens.blue600,
                                                textDecoration: "none",
                                            }}
                                        >
                                            {research.fields.mainWebsite}
                                        </a>
                                    </Paragraph>
                                </>
                            )}
                            {research.fields.solutionEngineerDescription && (
                                <>
                                    <ContentSectionHeader
                                        title={"Description"}
                                    />
                                    <Paragraph>
                                        {
                                            research.fields
                                                .solutionEngineerDescription
                                        }
                                    </Paragraph>
                                </>
                            )}
                            {(research.fields.primaryColor ||
                                research.fields.secondaryColor ||
                                research.fields.tertiaryColor) && (
                                <ContentSectionHeader title="Brand Colors" />
                            )}
                            <Flex
                                flexDirection="row"
                                style={{ paddingBottom: `${tokens.spacingL}` }}
                            >
                                {renderColor(
                                    "primary",
                                    research.fields.primaryColor,
                                )}
                                {renderColor(
                                    "secondary",
                                    research.fields.secondaryColor,
                                )}
                                {renderColor(
                                    "tertiary",
                                    research.fields.tertiaryColor,
                                )}
                            </Flex>
                            {["description", "products", "style", "tone"].map(
                                (id) => (
                                    <EditableResearchField
                                        id={id}
                                        key={`research-field-${id}`}
                                        fieldInEditMode={fieldInEditMode}
                                        setFieldInEditMode={setFieldInEditMode}
                                        localResearch={localResearch}
                                        setLocalResearch={setLocalResearch}
                                        research={research.fields}
                                        isSaving={isSaving}
                                        saveResearch={saveResearch}
                                    />
                                ),
                            )}
                        </>
                    )}
                </div>
            </Flex>
        </>
    );
};

function renderColor(name: string, color: string) {
    if (!color) return null;
    return (
        <Flex gap={tokens.spacingS} flexDirection="column" style={{ flex: 1 }}>
            <ColorTokensContent
                dsysTokens={{ color: { [name]: color } }}
                useCssVars={false}
            />
        </Flex>
    );
}

export default ResearchContent;
