import React, { useEffect, useState } from "react";
import { Caption, Flex, Text } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import tokens from "@contentful/f36-tokens";
import Divider from "../../../Divider";
import { NAVIGATION } from "../../../MainNav";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import LoadingStyles from "../../../Loading/LoadingStyles";
import { CONTENT_PANEL_MAX_WIDTH } from "../../../../constants";

const ContentTypeDetailContent = () => {
    const { contentState, loadProperty, loadingState } =
        useContentStateSession();
    const { invalidated, route, setRoute } = useAIState();
    const [localInvalidated, setLocalInvalidated] =
        useState<number>(invalidated);

    useEffect(() => {
        const forceReload = localInvalidated !== invalidated;
        if (!contentState.contentTypes || forceReload) {
            if (!forceReload) setLocalInvalidated(invalidated);
            loadProperty("contentTypes", forceReload);
        }
    }, [invalidated]);

    const contentType = contentState.contentTypes?.find(
        (ctype) => ctype.sys.id === route?.contentTypeId,
    );
    if (!contentType) {
        setRoute({
            navigation: "content_model",
            // aiStateEngines: NAVIGATION["content_model"].aiStateEngines,
            // aiStateEngineFocus: 0,
            aiActions: NAVIGATION["content_model"].aiActions,
            aiActionFocus: 0,
        });
    }
    const isLoading = loadingState.contentTypes === true || !contentType;

    return (
        <>
            <ContentPanelHeader
                title={contentType?.name || "Loading"}
                secondaryTitle={contentType?.sys.id}
                invalidate
                status={
                    contentType?.sys.publishedCounter === 0 ? "draft" : "none"
                }
                goBack={() => {
                    setRoute({
                        navigation: "content_model",
                        // aiStateEngines: NAVIGATION["content_model"].aiStateEngines,
                        // aiStateEngineFocus: 0,
                        aiActions: NAVIGATION["content_model"].aiActions,
                        aiActionFocus: 0,
                    });
                }}
            />
            <Flex
                flexDirection="column"
                alignItems="center"
                style={{
                    overflowY: "auto",
                    position: "relative",
                    ...LoadingStyles(isLoading),
                    flex: 1,
                }}
            >
                <div
                    style={{
                        maxWidth: CONTENT_PANEL_MAX_WIDTH,
                        padding: tokens.spacingM,
                        width: "100%",
                    }}
                >
                    {contentState.contentType?.fields
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((field) => (
                            <Flex
                                key={`${contentType?.sys.id}-${field.id}`}
                                flexDirection="column"
                                style={{
                                    padding: `${tokens.spacingS} ${tokens.spacingXs}`,
                                    cursor: "hand",
                                }}
                            >
                                <Flex flexDirection="row" alignItems="center">
                                    <Text
                                        fontSize="fontSizeL"
                                        style={{
                                            color: tokens.gray800,
                                        }}
                                    >
                                        {field.name}{" "}
                                    </Text>
                                    <div style={{ flex: 1 }}></div>
                                </Flex>
                                <Caption
                                    style={{
                                        color: tokens.gray600,
                                    }}
                                >
                                    id: {field.id}, type: {field.type}
                                    {", "}
                                    {field.linkType
                                        ? `linkType: ${field.linkType},`
                                        : ""}{" "}
                                    localized: {field.localized ? "Yes" : "No"},
                                    required: {field.required ? "Yes" : "No"},
                                    omitted: {field.omitted ? "Yes" : "No"}
                                </Caption>
                                <Divider style={{ marginBottom: 0 }} />
                            </Flex>
                        ))}
                </div>
            </Flex>
        </>
    );
};

export default ContentTypeDetailContent;
