import React, { useEffect, useState } from "react";
import { Button, Flex, Menu, Select, Text } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import getEntryStatus from "../../../utils/entryStatus";
import scrollBarStyles from "../../../utils/ScrollBarMinimal.module.css";
import LoadingStyles from "../../../Loading/LoadingStyles";
import createPageControllerFunction from "../../../../ai/mcp/designSystemMCP/tools/createPageController/createPageController.function";
import { DesignSystemMCPClient } from "../../../../ai/mcp/designSystemMCP/DesignSystemMCPClient";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import test from "./test";
import publishPageControllers from "./publishPageControllers";
import { Entry } from "contentful";
import Divider from "../../../Divider";

const PageControllers = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState } =
        useContentStateSession();
    const { aiActionConfig, setRoute, route } = useAIState();
    const [localLoading, setLocalLoading] = useState<boolean>(false);
    const [seletedViews, setSelectedViews] = useState<string>("demai-page");

    useEffect(() => {
        loadProperty("pageControllers");
        loadProperty("systemContentTypes");
        loadProperty("components");
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
                    const viewEntry = entry.fields.view as Entry;
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

    const filteredPages = contentState.pageControllers?.filter((page) => {
        if (
            seletedViews === "all" ||
            (page.fields.view as Entry)?.sys.contentType.sys.id === seletedViews
        ) {
            return true;
        }
        return false;
    });

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
                        style={{
                            padding: `${tokens.spacingM} ${tokens.spacingL}`,
                        }}
                        flexDirection="row"
                        alignItems="baseline"
                        gap={tokens.spacingS}
                    >
                        <Text>filter:</Text>
                        <Select
                            style={{ flex: 1, width: "100%" }}
                            value={seletedViews}
                            onChange={(event) => {
                                setSelectedViews(event.target.value);
                            }}
                        >
                            <Select.Option value="all">All Views</Select.Option>
                            {contentState.components?.map((component) => {
                                return (
                                    <Select.Option
                                        value={component.sys.id}
                                        key={`${component.sys.id}`}
                                    >
                                        {String(component.fields.title)}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Flex>
                    <Divider style={{ margin: 0 }} />
                    <Flex style={{ flex: 1, overflow: "hidden" }}>
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
                            {filteredPages?.length === 0 && (
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
                                {filteredPages?.map((entry) => {
                                    const contentType =
                                        contentState.systemContentTypes?.find(
                                            (ctype) =>
                                                ctype.sys.id ===
                                                entry.sys.contentType.sys.id,
                                        );
                                    let title = entry.sys.id;
                                    if (contentType?.displayField) {
                                        title =
                                            String(
                                                entry.fields[
                                                    contentType.displayField
                                                ],
                                            ) || title;
                                    }
                                    return (
                                        <DmaiContentRow
                                            key={`ctype-${entry.sys.id}`}
                                            onClick={async () => {
                                                if (route) {
                                                    setRoute({
                                                        ...route,
                                                        pageControllerSlug: `${entry.fields.slug}`,
                                                    });
                                                }
                                            }}
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
                                                publishPageControllers(
                                                    entry,
                                                    sdk,
                                                    setLocalLoading,
                                                    loadProperty,
                                                );
                                            }}
                                            otherMenuItems={[
                                                <Menu.Item
                                                    key={"open-page-preview"}
                                                    onClick={(
                                                        e: React.MouseEvent,
                                                    ) => {
                                                        window.open(
                                                            `http://localhost:4000${entry.fields.slug}?space=${sdk.ids.space}&env=${sdk.ids.environment}`,
                                                            "_blank",
                                                        );
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    View in WebSite
                                                </Menu.Item>,
                                            ]}
                                            title={`${title} ${entry.fields.slug}`}
                                            id={`${contentType?.name} - ${entry.sys.id}`}
                                            status={getEntryStatus(entry)}
                                        />
                                    );
                                })}
                            </Flex>
                        </Flex>
                        <div
                            style={{
                                width: "52%",
                                height: "100%",
                                borderLeft: `1px solid ${tokens.gray200}`,
                            }}
                        >
                            <iframe
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                }}
                                src={`http://localhost:3000${route?.pageControllerSlug}?space=${sdk.ids.space}&env=${sdk.ids.environment}`}
                            ></iframe>
                        </div>
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default PageControllers;
