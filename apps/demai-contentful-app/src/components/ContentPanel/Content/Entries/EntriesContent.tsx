import React, { useEffect, useState } from "react";
import { Flex, Select, Text } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import getEntryStatus from "../../../utils/entryStatus";
import scrollBarStyles from "../../../utils/ScrollBarMinimal.module.css";
import Divider from "../../../Divider";
import LoadingStyles from "../../../Loading/LoadingStyles";
import { Asset, Entry } from "contentful";

const EntriesContent = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState } =
        useContentStateSession();
    const [selectedContentType, setSelectedContentType] =
        useState<string>("all");
    const [localLoading, setLocalLoading] = useState<boolean>(false);

    useEffect(() => {
        loadProperty("contentTypes");
        loadProperty("entries");
    }, [contentState]);

    const isLoading =
        loadingState.entries === true ||
        loadingState.contentTypes === true ||
        localLoading === true;

    const filteredEntries = contentState.entries?.filter((entry) => {
        if (
            selectedContentType === "all" ||
            entry.sys.contentType.sys.id === selectedContentType
        ) {
            return true;
        }
        return false;
    });

    const handleDelete = async (entry: Entry) => {
        const doDelete = await sdk.dialogs.openConfirm({
            title: "Delete Entry",
            message: "Are you sure you want to delete this entry?",
        });
        if (doDelete) {
            try {
                setLocalLoading(true);
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
            await loadProperty("entries", true);
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
        await loadProperty("entries", true);
        setLocalLoading(false);
    };

    return (
        <>
            <ContentPanelHeader title="Entries" invalidate />
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
                            value={selectedContentType}
                            onChange={(event) => {
                                setSelectedContentType(event.target.value);
                            }}
                        >
                            <Select.Option value="all">
                                All Content Types
                            </Select.Option>
                            {contentState.contentTypes?.map((contentType) => {
                                return (
                                    <Select.Option
                                        value={contentType.sys.id}
                                        key={`${contentType.sys.id}`}
                                    >
                                        {contentType.name}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Flex>
                    <Divider style={{ margin: 0 }} />
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
                        {filteredEntries?.length === 0 && (
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
                            {filteredEntries?.map((entry) => {
                                const contentType =
                                    contentState.contentTypes?.find(
                                        (ctype) =>
                                            ctype.sys.id ===
                                            entry.sys.contentType.sys.id,
                                    );
                                let title = entry.sys.id;
                                if (contentType?.displayField) {
                                    title = String(
                                        entry.fields[
                                            contentType.displayField
                                        ] || title,
                                    );
                                }

                                // IMAGES
                                let imageUrl: string | undefined;
                                const imageField =
                                    contentType &&
                                    contentType.fields.find(
                                        (field) =>
                                            field.type === "Link" &&
                                            field.linkType === "Asset",
                                    );
                                if (imageField) {
                                    const image = entry.fields[imageField?.id];
                                    if (image) {
                                        imageUrl = (image as Asset)?.fields
                                            ?.file?.url as string;
                                        imageUrl = imageUrl
                                            ? `https:${imageUrl}`
                                            : undefined;
                                    }
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
                                        imageUrl={imageUrl}
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

export default EntriesContent;
