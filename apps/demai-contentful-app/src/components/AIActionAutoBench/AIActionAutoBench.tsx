import { Dispatch, SetStateAction, useState } from "react";
import ContentPanelHeader from "../ContentPanel/ContentPanelHeader";
import { Button, Flex, Select } from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import tokens from "@contentful/f36-tokens";
import useAIState from "../../contexts/AIStateContext/useAIState";
import { ResearchGroupAction } from "../../ai/AIAction/actions/research/groups/ResearchGroupAction";
import { AIAction, useAIAction } from "../../ai/AIAction/AIAction";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import { useError } from "../../contexts/ErrorContext/ErrorContext";
import AutoBenchAIAction from "./components/AutoBenchAIAction";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import { ContentfulGroupAction } from "../../ai/AIAction/actions/contentful/groups/ContentfulGroupAction";
import { DeleteGeneratedContentAction } from "../../ai/AIAction/actions/contentful/DeleteGeneratedContentAction";
import { DeleteSystemContentAction } from "../../ai/AIAction/actions/contentful/DeleteSystemContentAction";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { DeleteAllContentGroupAction } from "../../ai/AIAction/actions/contentful/groups/DeleteAllContentGroupAction";
import { NAVIGATION, PromptAreas } from "../MainNav";

const AIActionAutoBench = ({
    showAutoBench,
    setShowWorkBench,
}: {
    showAutoBench: boolean;
    setShowWorkBench: Dispatch<SetStateAction<boolean>>;
}) => {
    const sdk = useSDK<PageAppSDK>();
    const { getContentState, validateSpace } = useContentStateSession();
    const { aiActionConfig, bumpInvalidated, setRoute } = useAIState();
    const [localAIAction, setLocalAIAction] = useState<AIAction>();
    const { addError } = useError();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [groupId, setGroupId] = useState<string>("research");
    const localAIActionSnapshot = useAIAction(localAIAction);

    if (!aiActionConfig) return null;

    return (
        <Flex
            flexDirection="column"
            style={{
                display: showAutoBench ? "flex" : "none",
                backgroundColor: tokens.colorWhite,
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: tokens.zIndexDefault,
            }}
        >
            <ContentPanelHeader title="AutoBench">
                <Button
                    startIcon={<icons.WorkflowsIcon />}
                    variant="transparent"
                    size="small"
                    onClick={() => {
                        setShowWorkBench((prev) => !prev);
                    }}
                >
                    Workbench
                </Button>
            </ContentPanelHeader>
            <Flex
                alignItems="center"
                flexDirection="column"
                style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    padding: `${tokens.spacing2Xl} ${tokens.spacingL}`,
                }}
            >
                <Flex
                    flexDirection="column"
                    style={{
                        maxWidth: 400,
                        width: "100%",
                        height: "100%",
                        gap: tokens.spacingXs,
                        // border: "1px solid pink",
                    }}
                >
                    <Button
                        style={{ minWidth: "100%" }}
                        variant="primary"
                        isLoading={isLoading}
                        onClick={async () => {
                            setIsLoading(true);
                            const newLocalAIAction = new ResearchGroupAction(
                                aiActionConfig,
                                bumpInvalidated,
                                getContentState,
                            );
                            setLocalAIAction(newLocalAIAction);
                            newLocalAIAction.run(addError);
                            setIsLoading(false);
                        }}
                    >
                        Show Me the Money
                    </Button>
                    <Flex
                        flexDirection="row"
                        style={{
                            alignSelf: "stretch",
                            width: "100%",
                            gap: tokens.spacingXs,
                        }}
                    >
                        <Flex
                            flexDirection="column"
                            alignItems="stretch"
                            style={{ flex: 1, width: "100%" }}
                        >
                            <Select
                                size="small"
                                value={groupId}
                                style={{ flex: 1, width: "100%" }}
                                onChange={(e) => {
                                    setGroupId(e.target.value);
                                }}
                            >
                                <Select.Option value="research">
                                    Research Group
                                </Select.Option>
                                <Select.Option value="contentful">
                                    Contentful Group
                                </Select.Option>
                                <Select.Option value="designSystem">
                                    Design System Group
                                </Select.Option>
                                <Select.Option value="layouts">
                                    Layouts Group
                                </Select.Option>
                                <Select.Option value="deleteGenerated">
                                    Delete DemAI Generated Content
                                </Select.Option>
                                <Select.Option value="deleteSystem">
                                    Delete DemAI System Content
                                </Select.Option>
                                <Select.Option value="deleteAll">
                                    Delete All DemAI Content
                                </Select.Option>
                            </Select>
                        </Flex>
                        <Button
                            variant="secondary"
                            isLoading={isLoading}
                            size="small"
                            onClick={async () => {
                                let newLocalAIActionConstructor;
                                let notifyFirst = false;
                                let validateDemAI = false;
                                switch (groupId) {
                                    case "research":
                                        newLocalAIActionConstructor =
                                            ResearchGroupAction;
                                        setRoute({
                                            navigation: "research",
                                            aiActions:
                                                NAVIGATION["research"]
                                                    .aiActions,
                                            aiActionFocus: 0,
                                        });
                                        break;
                                    case "contentful":
                                        notifyFirst = true;
                                        newLocalAIActionConstructor =
                                            ContentfulGroupAction;
                                        setRoute({
                                            navigation: "content_model",
                                            aiActions:
                                                NAVIGATION["content_model"]
                                                    .aiActions,
                                            aiActionFocus: 0,
                                        });
                                        break;
                                    case "deleteGenerated":
                                        notifyFirst = true;
                                        newLocalAIActionConstructor =
                                            DeleteGeneratedContentAction;
                                        break;
                                    case "deleteSystem":
                                        notifyFirst = true;
                                        validateDemAI = true;
                                        newLocalAIActionConstructor =
                                            DeleteSystemContentAction;
                                        break;
                                    case "deleteAll":
                                        notifyFirst = true;
                                        validateDemAI = true;
                                        newLocalAIActionConstructor =
                                            DeleteAllContentGroupAction;
                                        break;
                                }

                                if (newLocalAIActionConstructor) {
                                    const newLocalAIAction =
                                        new newLocalAIActionConstructor(
                                            aiActionConfig,
                                            bumpInvalidated,
                                            getContentState,
                                        );
                                    if (notifyFirst) {
                                        const answer =
                                            await sdk.dialogs.openConfirm({
                                                title: "Delete Confirmation",
                                                message:
                                                    "This will delete content, are you sure?",
                                            });
                                        if (answer === true) {
                                            setIsLoading(true);
                                            setLocalAIAction(newLocalAIAction);
                                            await newLocalAIAction.run(
                                                addError,
                                            );
                                            if (validateDemAI) {
                                                await validateSpace();
                                                bumpInvalidated();
                                            }
                                            setIsLoading(false);
                                        }
                                    } else {
                                        setIsLoading(true);
                                        setLocalAIAction(newLocalAIAction);
                                        await newLocalAIAction.run(addError);
                                        setIsLoading(false);
                                    }
                                }
                            }}
                        >
                            Run Group
                        </Button>
                    </Flex>
                    <Flex
                        flexDirection="column"
                        className={scrollBarStyles["scrollbar-minimal"]}
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            gap: tokens.spacing2Xs,
                            padding: `${tokens.spacingXs}`,
                            backgroundColor: tokens.gray100,
                            borderRadius: tokens.borderRadiusSmall,
                        }}
                    >
                        {localAIAction &&
                            localAIActionSnapshot?.childActions.length ===
                                0 && (
                                <AutoBenchAIAction
                                    key={localAIAction.key}
                                    aiAction={localAIAction}
                                />
                            )}
                        {localAIActionSnapshot &&
                            localAIActionSnapshot.childActions.map(
                                (childAction) => (
                                    <AutoBenchAIAction
                                        key={childAction.key}
                                        aiAction={childAction}
                                    />
                                ),
                            )}
                    </Flex>
                    <Flex flexDirection="row" justifyContent="flex-end">
                        <Button
                            variant="transparent"
                            onClick={async () => {
                                setLocalAIAction(undefined);
                            }}
                        >
                            Clear
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default AIActionAutoBench;
