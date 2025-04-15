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
import LoadingPage from "../Loading/LoadingPage";

const AIActionPanel = () => {
    const { aiAction, route, setRoute } = useAIState();
    const aiActionSnapshot = useAIAction(aiAction);

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
            {!aiAction || !aiActionSnapshot ? (
                <LoadingPage />
            ) : (
                <>
                    <ContentPanelHeader
                        title="Workbench"
                        childrenLeft={
                            route?.aiActions && route?.aiActions?.length > 1 ? (
                                <Select
                                    value={`${route.aiActionFocus}`}
                                    onChange={(e) => {
                                        setRoute({
                                            ...route,
                                            aiActionFocus: Number(
                                                e.target.value,
                                            ),
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
                                // setShowWorkBench((prev) => !prev)
                            }}
                        >
                            AutoBench
                        </Button>
                    </ContentPanelHeader>
                    <div
                        className={classNames(
                            scrollBarStyles["scrollbar-minimal"],
                        )}
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "scroll",
                            // ...LoadingStyles(isLoading),
                        }}
                    >
                        <AIActionDescription
                            aiAction={aiAction}
                            aiActionSnapshot={aiActionSnapshot}
                        />
                    </div>
                    {aiAction && (
                        <AIActionDescriptionToolbar
                            aiAction={aiAction}
                            aiActionSnapshot={aiActionSnapshot}
                        />
                    )}
                    <Divider style={{ marginBottom: 0, marginTop: 0 }} />
                    <AIActionEditor />
                </>
            )}
        </Flex>
    );
};

export default AIActionPanel;
