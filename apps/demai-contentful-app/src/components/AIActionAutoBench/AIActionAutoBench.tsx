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

const AIActionAutoBench = ({
    setShowWorkBench,
}: {
    setShowWorkBench: Dispatch<SetStateAction<boolean>>;
}) => {
    const { contentState } = useContentStateSession();
    const { aiStateConfig, setInvalidated } = useAIState();
    const { addError } = useError();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [groupId, setGroupId] = useState<string>("research");
    const [localAIAction, setLocalAIAction] = useState<AIAction | undefined>();
    const localAIActionSnapshot = useAIAction(localAIAction);

    if (!aiStateConfig) return null;

    return (
        <>
            <ContentPanelHeader title="AutoBench">
                <Button
                    startIcon={<icons.WorkflowsIcon />}
                    variant="transparent"
                    size="small"
                    onClick={() => setShowWorkBench((prev) => !prev)}
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
                                aiStateConfig,
                            );
                            setLocalAIAction(newLocalAIAction);
                            newLocalAIAction.contentChangeEvent = () =>
                                setInvalidated((prev) => prev + 1);
                            newLocalAIAction.run(contentState, addError);
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
                            </Select>
                        </Flex>
                        <Button
                            variant="secondary"
                            isLoading={isLoading}
                            size="small"
                            onClick={async () => {
                                setIsLoading(true);
                                let newLocalAIAction;
                                if (groupId === "research") {
                                    newLocalAIAction = new ResearchGroupAction(
                                        aiStateConfig,
                                    );
                                } else if (groupId === "contentful") {
                                    newLocalAIAction =
                                        new ContentfulGroupAction(
                                            aiStateConfig,
                                        );
                                }
                                if (newLocalAIAction) {
                                    setLocalAIAction(newLocalAIAction);
                                    newLocalAIAction.contentChangeEvent = () =>
                                        setInvalidated((prev) => prev + 1);
                                    newLocalAIAction.run(
                                        contentState,
                                        addError,
                                    );
                                }
                                setIsLoading(false);
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
                            padding: `${tokens.spacingS} 0`,
                        }}
                    >
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
        </>
    );
};

export default AIActionAutoBench;
