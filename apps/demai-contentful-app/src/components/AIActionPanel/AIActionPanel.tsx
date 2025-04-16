import { useEffect, useRef, useState } from "react";
import { Button, Flex, Select } from "@contentful/f36-components";
import useAIState from "../../contexts/AIStateContext/useAIState";
import { AIAction, useAIAction } from "../../ai/AIAction/AIAction";
import ContentPanelHeader from "../ContentPanel/ContentPanelHeader";
import * as icons from "@contentful/f36-icons";
import classNames from "../utils/classNames";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import AIActionEditor from "../AIActionEditor/AIActionEditor";
import Divider from "../Divider";
import AIActionDescription from "../AIActionDescription/AIActionDescription";
import AIActionDescriptionToolbar from "../AIActionDescription/components/AIActionDescriptionToolbar";
import AIActionAutoBench from "../AIActionAutoBench/AIActionAutoBench";

const AIActionPanel = () => {
    const { aiAction, route, setRoute, invalidated, setAIAction } =
        useAIState();
    const aiActionSnapshot = useAIAction(aiAction);
    const scrollBottomRef = useRef<HTMLDivElement>(null);
    const [showAutoBench, setShowAutoBench] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            scrollBottomRef.current?.scrollIntoView();
        }, 0);
    }, [aiAction]);

    useEffect(() => {
        setTimeout(() => {
            scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
    }, [aiActionSnapshot, invalidated]);

    return (
        <Flex
            flexDirection="column"
            style={{
                flex: 1,
                maxWidth: 650, // Not Content Panel
                width: "100%",
                position: "relative",
            }}
        >
            <ContentPanelHeader
                title="Workbench"
                childrenLeft={
                    route?.aiActions && route?.aiActions?.length > 1 ? (
                        <Select
                            value={`${route.aiActionFocus}`}
                            onChange={(e) => {
                                setRoute({
                                    ...route,
                                    aiActionFocus: Number(e.target.value),
                                });
                            }}
                        >
                            {route?.aiActions.map((action, index) => (
                                <Select.Option
                                    key={`${action.name}`}
                                    value={`${index}`}
                                >
                                    {(action as typeof AIAction).label}
                                </Select.Option>
                            ))}
                        </Select>
                    ) : null
                }
            >
                <Button
                    startIcon={<icons.DiamondIcon />}
                    variant="transparent"
                    size="small"
                    onClick={() => {
                        setShowAutoBench(true);
                    }}
                >
                    AutoBench
                </Button>
            </ContentPanelHeader>
            <div
                className={classNames(scrollBarStyles["scrollbar-minimal"])}
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "scroll",
                    // ...LoadingStyles(isLoading),
                }}
            >
                {aiAction && aiActionSnapshot && (
                    <AIActionDescription
                        aiAction={aiAction}
                        aiActionSnapshot={aiActionSnapshot}
                    />
                )}
                <div ref={scrollBottomRef}></div>
            </div>
            {aiAction && aiActionSnapshot && (
                <AIActionDescriptionToolbar
                    aiAction={aiAction}
                    aiActionSnapshot={aiActionSnapshot}
                />
            )}
            <Divider style={{ marginBottom: 0, marginTop: 0 }} />
            <AIActionEditor />
            <AIActionAutoBench
                showAutoBench={showAutoBench}
                setShowWorkBench={setShowAutoBench}
            />
        </Flex>
    );
};

export default AIActionPanel;
