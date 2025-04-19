import React, { useEffect, useState } from "react";
import { Flex, Menu, Text } from "@contentful/f36-components";
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
import { Asset } from "contentful";
import deleteAssetAndUnlinkReferences from "./utils/deleteAssetAndUnlinkReferences";
import useAIState from "../../../../contexts/AIStateContext/useAIState";

const AssetsContent = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState } =
        useContentStateSession();
    const { aiActionConfig } = useAIState();
    const [localLoading, setLocalLoading] = useState<boolean>(false);

    useEffect(() => {
        loadProperty("assets");
    }, [contentState]);

    const isLoading = loadingState.assets === true || localLoading === true;
    const finalAssets: Asset[] = contentState.assets || [];

    const handleDelete = async (asset: Asset) => {
        const doDelete = await sdk.dialogs.openConfirm({
            title: "Delete Asset",
            message: "Are you sure you want to delete this asset?",
        });
        if (doDelete && aiActionConfig) {
            try {
                setLocalLoading(true);
                await deleteAssetAndUnlinkReferences(
                    asset.sys.id,
                    aiActionConfig,
                );
                sdk.notifier.success(`deleted asset with id: ${asset.sys.id}`);
            } catch (err: any) {
                sdk.notifier.error(`error: ${err.message}`);
            }
            await loadProperty("assets", true);
            setLocalLoading(false);
        }
    };

    const handlePublish = async (asset: Asset) => {
        try {
            setLocalLoading(true);
            const latest = await sdk.cma.asset.get({ assetId: asset.sys.id });
            await sdk.cma.asset.publish({ assetId: asset.sys.id }, latest);
            sdk.notifier.success(`published asset with id: ${asset.sys.id}`);
        } catch (err: any) {
            sdk.notifier.error(`error: ${err.message}`);
        }
        await loadProperty("assets", true);
        setLocalLoading(false);
    };

    return (
        <>
            <ContentPanelHeader title="Assets" invalidate />
            <Divider style={{ margin: 0 }} />
            <Flex
                flexDirection="column"
                style={{
                    position: "relative",
                    flex: 1,
                }}
            >
                <Flex
                    flexDirection="column"
                    alignItems="center"
                    className={scrollBarStyles["scrollbar-minimal"]}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflowY: "auto",
                        padding: `${tokens.spacingM} ${tokens.spacingL} 0 ${tokens.spacingL}`,
                        ...LoadingStyles(isLoading),
                    }}
                >
                    {!isLoading && finalAssets?.length === 0 && (
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
                            no assets found
                        </div>
                    )}
                    <Flex
                        flexDirection="column"
                        style={{ maxWidth: 800, width: "100%" }}
                    >
                        {finalAssets.map((asset) => {
                            const title =
                                (asset.fields.title as any)?.["en-US"] ||
                                (asset.fields.file as any)?.["en-US"]
                                    ?.fileName ||
                                asset.sys.id;
                            return (
                                <DmaiContentRow
                                    key={`asset-${asset.sys.id}`}
                                    editOnClick={() =>
                                        sdk.navigator.openAsset(asset.sys.id, {
                                            slideIn: true,
                                        })
                                    }
                                    imageUrl={
                                        (
                                            asset.fields.file as {
                                                [key: string]: {
                                                    url: string;
                                                };
                                            }
                                        )?.["en-US"]?.url || ""
                                    }
                                    publishOnClick={() => handlePublish(asset)}
                                    otherMenuItems={[
                                        <Menu.Item
                                            key={"open-page-preview"}
                                            onClick={(e: React.MouseEvent) => {
                                                handleDelete(asset);
                                            }}
                                        >
                                            Unlink and Delete
                                        </Menu.Item>,
                                    ]}
                                    title={title}
                                    id={`Asset - ${asset.sys.id}`}
                                    status={getEntryStatus(asset)}
                                />
                            );
                        })}
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default AssetsContent;
