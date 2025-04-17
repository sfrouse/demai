import React, { useEffect, useState } from "react";
import { Button, Flex } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import getEntryStatus from "../../../utils/entryStatus";
import scrollBarStyles from "../../../utils/ScrollBarMinimal.module.css";
import { Entry } from "contentful-management";
import LoadingStyles from "../../../Loading/LoadingStyles";
import createPageControllerFunction from "../../../../ai/mcp/designSystemMCP/tools/createPageController/createPageController.function";
import { DesignSystemMCPClient } from "../../../../ai/mcp/designSystemMCP/DesignSystemMCPClient";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import test from "./test";

const PageControllers = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState } =
        useContentStateSession();
    const { aiActionConfig } = useAIState();
    const [localLoading, setLocalLoading] = useState<boolean>(false);

    useEffect(() => {
        loadProperty("pageControllers");
        loadProperty("systemContentTypes");
    }, [contentState]);

    const isLoading =
        loadingState.pageControllers === true ||
        loadingState.systemContentTypes === true ||
        localLoading === true;

    const handleDelete = async (entry: Entry) => {
        const doDelete = await sdk.dialogs.openConfirm({
            title: "Delete Entry",
            message: "Are you sure you want to delete this entry?",
        });
        if (doDelete) {
            try {
                setLocalLoading(true);

                if (entry.fields.view) {
                    const viewEntry = entry.fields.view;
                    if (viewEntry.sys.publishedVersion) {
                        await sdk.cma.entry.unpublish({
                            entryId: viewEntry.sys.id,
                        });
                    }
                    await sdk.cma.entry.delete({
                        entryId: viewEntry.sys.id,
                    });
                }

                if (entry.sys.publishedVersion) {
                    await sdk.cma.entry.unpublish({ entryId: entry.sys.id });
                }
                await sdk.cma.entry.delete({
                    entryId: entry.sys.id,
                });
                sdk.notifier.success(`deleted entry with id: ${entry.sys.id}`);
            } catch (err: any) {
                sdk.notifier.error(`error: ${err.message}`);
            }
            await loadProperty("pageControllers", true);
            setLocalLoading(false);
        }
    };

    const handlePublish = async (entry: Entry) => {
        try {
            setLocalLoading(true);
            const latestEntry = await sdk.cma.entry.get({
                entryId: entry.sys.id,
            });
            await sdk.cma.entry.publish(
                { entryId: latestEntry.sys.id },
                latestEntry,
            );
            sdk.notifier.success(`publish entry with id: ${entry.sys.id}`);
        } catch (err: any) {
            sdk.notifier.error(`error: ${err.message}`);
        }
        await loadProperty("pageControllers", true);
        setLocalLoading(false);
    };

    return (
        <>
            <ContentPanelHeader title="Page Controllers" invalidate>
                <Button
                    onClick={() => {
                        if (aiActionConfig) {
                            const mcp = new DesignSystemMCPClient(
                                aiActionConfig.cma,
                                aiActionConfig.spaceId,
                                aiActionConfig.environmentId,
                                aiActionConfig.cpa,
                            );
                            createPageControllerFunction(mcp, test);
                        }
                    }}
                >
                    Test
                </Button>
            </ContentPanelHeader>
            <Flex
                flexDirection="column"
                style={{
                    position: "relative",
                    flex: 1,
                    ...LoadingStyles(isLoading),
                }}
            >
                <Flex
                    flexDirection="column"
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    <Flex
                        flexDirection="column"
                        alignItems="center"
                        className={scrollBarStyles["scrollbar-minimal"]}
                        style={{
                            overflowY: "auto",
                            flex: 1,
                            position: "relative",
                            padding: `${tokens.spacingM} ${tokens.spacingL} 0 ${tokens.spacingL}`,
                        }}
                    >
                        {contentState.pageControllers?.length === 0 && (
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
                                no entries found
                            </div>
                        )}
                        <Flex
                            flexDirection="column"
                            style={{ maxWidth: 800, width: "100%" }}
                        >
                            {contentState.pageControllers?.map((entry) => {
                                const contentType =
                                    contentState.systemContentTypes?.find(
                                        (ctype) =>
                                            ctype.sys.id ===
                                            entry.sys.contentType.sys.id,
                                    );
                                let title = entry.sys.id;
                                if (contentType?.displayField) {
                                    title =
                                        entry.fields[
                                            contentType.displayField
                                        ] || title;
                                }
                                return (
                                    <DmaiContentRow
                                        key={`ctype-${entry.sys.id}`}
                                        editOnClick={() => {
                                            sdk.navigator.openEntry(
                                                entry.sys.id,
                                                {
                                                    slideIn: true,
                                                },
                                            );
                                        }}
                                        deleteOnClick={async () =>
                                            handleDelete(entry)
                                        }
                                        publishOnClick={async () => {
                                            handlePublish(entry);
                                        }}
                                        title={title}
                                        id={`${contentType?.name} - ${entry.sys.id}`}
                                        status={getEntryStatus(entry)}
                                    />
                                );
                            })}
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default PageControllers;
