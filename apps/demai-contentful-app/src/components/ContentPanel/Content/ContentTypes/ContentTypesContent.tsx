import React, { useEffect, useState } from "react";
import { Flex } from "@contentful/f36-components";
import { ContentType } from "contentful-management";
import { PageAppSDK } from "@contentful/app-sdk";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import tokens from "@contentful/f36-tokens";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import { AIPromptEngineID } from "../../../../ai/AIPromptEngine/AIPromptEngineTypes";
import LoadingStyles from "../../../Loading/LoadingStyles";
import { EditContentTypeAction } from "../../../../ai/AIAction/actions/contentful/EditContentTypeAction";

const ContentTypesContent = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState, setContentType } =
        useContentStateSession();
    const { invalidated, setRoute } = useAIState();
    const [localInvalidated, setLocalInvalidated] =
        useState<number>(invalidated);

    useEffect(() => {
        const forceReload = localInvalidated !== invalidated;
        if (!contentState.contentTypes || forceReload) {
            if (!forceReload) setLocalInvalidated(invalidated);
            loadProperty("contentTypes", forceReload);
        }
    }, [invalidated]);

    const isLoading = loadingState.contentTypes === true;

    return (
        <>
            <ContentPanelHeader title="Content Types" invalidate />
            <Flex
                flexDirection="column"
                alignItems="center"
                style={{
                    overflowY: "auto",
                    padding: `${tokens.spacingM} ${tokens.spacingM}`,
                    flex: 1,
                    ...LoadingStyles(isLoading),
                    position: "relative",
                }}
            >
                {contentState.contentTypes?.length === 0 && (
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: tokens.gray500,
                        }}
                    >
                        no content types found
                    </div>
                )}
                <Flex
                    flexDirection="column"
                    style={{ maxWidth: 800, width: "100%" }}
                >
                    {contentState.contentTypes?.map(
                        (contentType: ContentType) => (
                            <DmaiContentRow
                                key={`ctype-${contentType.sys.id}`}
                                onClick={async () => {
                                    await setContentType(contentType.sys.id);
                                    setRoute({
                                        navigation: "content_model",
                                        contentTypeId: contentType.sys.id,
                                        aiActions: [EditContentTypeAction],
                                        aiActionFocus: 0,
                                    });
                                }}
                                editOnClick={() => {
                                    window.open(
                                        `https://app.contentful.com/spaces/${sdk.ids.space}/environments/${sdk.ids.environment}/content_types/${contentType.sys.id}/fields`,
                                        "_blank",
                                    );
                                }}
                                title={contentType.name}
                                id={contentType.sys.id}
                                description={contentType.description}
                                status={
                                    contentType.sys.publishedCounter === 0
                                        ? "draft"
                                        : "none"
                                }
                            />
                        ),
                    )}
                </Flex>
            </Flex>
        </>
    );
};

export default ContentTypesContent;
