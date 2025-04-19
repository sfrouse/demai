import React, { Dispatch, SetStateAction, useState } from "react";
import ContentPanelHeader from "../ContentPanel/ContentPanelHeader";
import { Button, Flex, Select } from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import tokens from "@contentful/f36-tokens";
import useAIState from "../../contexts/AIStateContext/useAIState";
import { AIAction, useAIAction } from "../../ai/AIAction/AIAction";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import { useError } from "../../contexts/ErrorContext/ErrorContext";
import AutoBenchAIAction from "./components/AutoBenchAIAction";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { MoneyAction } from "../../ai/AIAction/actions/MoneyAction";
import runGroup from "./utils/runGroup";
import Stopwatch from "../Stopwatch/Stopwatch";

const AIActionAutoBench = ({
    showAutoBench,
    setShowWorkBench,
}: {
    showAutoBench: boolean;
    setShowWorkBench: Dispatch<SetStateAction<boolean>>;
}) => {
    const sdk = useSDK<PageAppSDK>();
    const { getContentState, validateSpace, loadProperty } =
        useContentStateSession();
    const { aiActionConfig, setRoute } = useAIState();
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
                        // gap: tokens.spacingXs,
                        // border: "1px solid pink",
                    }}
                >
                    <Flex
                        flexDirection="column"
                        style={{
                            gap: tokens.spacingXs,
                            padding: `${tokens.spacingXs} 0`,
                        }}
                    >
                        <Button
                            style={{ minWidth: "100%" }}
                            variant="primary"
                            isLoading={isLoading}
                            onClick={async () => {
                                setIsLoading(true);
                                const newLocalAIAction = new MoneyAction(
                                    aiActionConfig,
                                    getContentState,
                                    loadProperty,
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
                                    <Select.Option value="contentfulAssets">
                                        Contentful Assets Group
                                    </Select.Option>
                                    <Select.Option value="designSystem">
                                        Design System Group
                                    </Select.Option>
                                    <Select.Option value="layouts">
                                        Layouts Group
                                    </Select.Option>
                                    <Select.Option value="-----">
                                        -------
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
                                onClick={async () => {
                                    await runGroup(
                                        groupId,
                                        setRoute,
                                        aiActionConfig,
                                        getContentState,
                                        loadProperty,
                                        setIsLoading,
                                        setLocalAIAction,
                                        validateSpace,
                                        addError,
                                        sdk,
                                    );
                                }}
                            >
                                Run Group
                            </Button>
                        </Flex>
                    </Flex>
                    <Flex
                        flexDirection="column"
                        className={scrollBarStyles["scrollbar-minimal"]}
                        style={{
                            flex: 1,
                            position: "relative",
                        }}
                    >
                        <Flex
                            flexDirection="column"
                            className={scrollBarStyles["scrollbar-minimal"]}
                            style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                right: 0,
                                left: 0,
                                overflowY: "auto",
                                gap: tokens.spacing2Xs,
                                padding: `${tokens.spacingXs}`,
                                backgroundColor: tokens.gray100,
                                borderRadius: `${tokens.borderRadiusSmall} ${tokens.borderRadiusSmall} 0 0`,
                            }}
                        >
                            {/* {localAIAction &&
                                localAIActionSnapshot?.childActions.length ===
                                    0 && (
                                    <AutoBenchAIAction
                                        key={`main-${localAIAction.key}`}
                                        aiAction={localAIAction}
                                    />
                                )} */}
                            {localAIActionSnapshot?.childActions.map(
                                (childAction) => {
                                    return (
                                        <React.Fragment
                                            key={`group-${childAction.key}`}
                                        >
                                            {childAction.childActions.length >
                                            1 ? (
                                                childAction.childActions.map(
                                                    (nestedChild) => (
                                                        <AutoBenchAIAction
                                                            key={`nested-${nestedChild.key}`}
                                                            aiAction={
                                                                nestedChild
                                                            }
                                                        />
                                                    ),
                                                )
                                            ) : (
                                                <AutoBenchAIAction
                                                    key={`solo-${childAction.key}`}
                                                    aiAction={childAction}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                },
                            )}
                        </Flex>
                    </Flex>
                    {localAIAction && localAIActionSnapshot && (
                        <AutoBenchAIAction
                            aiAction={localAIAction}
                            corners={false}
                        />
                    )}
                    <Flex
                        flexDirection="row"
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        {/* {localAIActionSnapshot?.executeRunTime ? (
                            <div
                                style={{ flex: 1, fontSize: tokens.fontSizeS }}
                            >
                                {renderTime(
                                    localAIActionSnapshot.executeRunTime,
                                )}
                            </div>
                        ) : (
                            localAIActionSnapshot?.startExecutionRunTime && (
                                <div
                                    style={{
                                        flex: 1,
                                        fontSize: tokens.fontSizeS,
                                    }}
                                >
                                    {renderTime(
                                        Date.now() -
                                            localAIActionSnapshot.startExecutionRunTime,
                                    )}
                                </div>
                            )
                        )} */}
                        <Stopwatch
                            startTime={
                                localAIActionSnapshot?.startExecutionRunTime
                            }
                            finalTime={localAIActionSnapshot?.executeRunTime}
                        />
                        <div style={{ flex: 1 }}></div>
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
