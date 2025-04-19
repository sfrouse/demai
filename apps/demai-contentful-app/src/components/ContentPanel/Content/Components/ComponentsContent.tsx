import React, { useEffect, useState } from "react";
import { Flex, Menu } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import CompDetailContent, {
    COMP_DETAIL_NAVIGATION,
} from "./panels/CompDetailContent";
import tokens from "@contentful/f36-tokens";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import getEntryStatus from "../../../utils/entryStatus";
import { EditComponentAction } from "../../../../ai/AIAction/actions/designSystem/EditComponentAction";
import { Entry } from "contentful-management";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import LoadingStyles from "../../../Loading/LoadingStyles";

const ComponentsContent = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState, setComponent } =
        useContentStateSession();
    const { setRoute, route } = useAIState();
    const [localLoading, setLocalLoading] = useState<boolean>(false);

    useEffect(() => {
        loadProperty("components");
        loadProperty("ai");
        loadProperty("contentTypes");
        loadProperty("css");
    }, [contentState]);

    const isLoading =
        loadingState.components === true ||
        loadingState.ai === true ||
        loadingState.contentTypes === true ||
        loadingState.css === true ||
        localLoading === true;

    if (route?.componentId) {
        return <CompDetailContent />;
    }

    const handleDelete = async (contentType: Entry) => {
        const doDelete = await sdk.dialogs.openConfirm({
            title: "Delete Component",
            message: "Are you sure you want to delete this component?",
        });
        if (doDelete) {
            try {
                setLocalLoading(true);
                await sdk.cma.contentType.unpublish({
                    contentTypeId: contentType.sys.id,
                });
                await sdk.cma.contentType.delete({
                    contentTypeId: contentType.sys.id,
                });
                sdk.notifier.success(
                    `deleted contentType with id: ${contentType.sys.id}`,
                );

                await sdk.cma.entry.unpublish({
                    entryId: contentType.sys.id,
                });
                await sdk.cma.entry.delete({
                    entryId: contentType.sys.id,
                });
                sdk.notifier.success(
                    `deleted entry with id: ${contentType.sys.id}`,
                );
            } catch (err: any) {
                sdk.notifier.error(`error: ${err.message}`);
            }
            await loadProperty("components", true);
            setLocalLoading(false);
        }
    };

    return (
        <>
            <ContentPanelHeader title="Components" invalidate />
            <Flex
                flexDirection="column"
                alignItems="center"
                style={{
                    overflowY: "auto",
                    padding: `0 ${tokens.spacingM}`,
                    position: "relative",
                    flex: 1,
                }}
            >
                <Flex
                    flexDirection="column"
                    style={{
                        maxWidth: 800,
                        width: "100%",
                        ...LoadingStyles(isLoading),
                    }}
                >
                    <Flex
                        flexDirection="column"
                        style={{ paddingTop: tokens.spacingM }}
                    >
                        {contentState.components?.length === 0 && (
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
                                no compontents found
                            </div>
                        )}
                        {contentState.components
                            ?.slice() // Make a shallow copy to avoid mutating the original array
                            .sort((a, b) => {
                                if (!a.fields?.title || !b.fields?.title) {
                                    return 0;
                                }
                                return `${a.fields?.title}`.localeCompare(
                                    `${b.fields?.title}`,
                                );
                            }) // Sort by title
                            .map((comp: any) => (
                                <DmaiContentRow
                                    key={`comp-${comp.sys.id}`}
                                    onClick={async () => {
                                        await setComponent(comp.sys.id);
                                        setRoute({
                                            navigation: "components",
                                            componentId: comp.sys.id,
                                            componentFocusId:
                                                COMP_DETAIL_NAVIGATION.WEB_COMP,
                                            aiActions: [EditComponentAction],
                                            aiActionFocus: 0,
                                        });
                                    }}
                                    otherMenuItems={[
                                        <Menu.Item
                                            key={"view-definition-entry"}
                                            onClick={(e: React.MouseEvent) => {
                                                sdk.navigator.openEntry(
                                                    comp.sys.id,
                                                    {
                                                        slideIn: true,
                                                    },
                                                );
                                                e.stopPropagation();
                                            }}
                                        >
                                            View Defintion Entry
                                        </Menu.Item>,
                                        <Menu.Item
                                            key={"view-content-type"}
                                            onClick={(e: React.MouseEvent) => {
                                                window.open(
                                                    `https://app.contentful.com/spaces/${sdk.ids.space}/environments/${sdk.ids.environment}/content_types/${comp.sys.id}/fields`,
                                                    "_blank",
                                                );
                                                e.stopPropagation();
                                            }}
                                        >
                                            View Content Type
                                        </Menu.Item>,
                                    ]}
                                    deleteOnClick={() => {
                                        handleDelete(comp);
                                    }}
                                    title={
                                        comp.fields.title && comp.fields.title
                                    }
                                    id={comp.sys.id}
                                    description={
                                        comp.fields.description &&
                                        comp.fields.description
                                    }
                                    status={getEntryStatus(comp)}
                                />
                            ))}
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default ComponentsContent;
