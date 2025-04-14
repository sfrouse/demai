import {
    Button,
    Checkbox,
    Flex,
    IconButton,
    Select,
    Textarea,
} from "@contentful/f36-components";
import useAIState from "../../contexts/AIStateContext/useAIState";
import tokens from "@contentful/f36-tokens";
import {
    ContentState,
    useContentStateSession,
} from "../../contexts/ContentStateContext/ContentStateContext";
import LoadingPage from "../Loading/LoadingPage";
import * as icons from "@contentful/f36-icons";
import {
    AIActionContentPrefix,
    AIActionPhase,
    AIActionSnapshot,
} from "../../ai/AIAction/AIActionTypes";
import { AIAction, useAIAction } from "../../ai/AIAction/AIAction";
import LoadingIcon from "../Loading/LoadingIcon";
import { useError } from "../../contexts/ErrorContext/ErrorContext";
import AIActionConfirm from "./components/AIActionConfirm";

const AIActionEditor = () => {
    const { contentState, loadingState, spaceStatus } =
        useContentStateSession();
    const {
        aiAction,
        ignoreContextContent,
        setIgnoreContextContent,
        autoExecute,
        setAutoExecute,
    } = useAIState();
    const { addError } = useError();

    const isLoading = Object.values(loadingState).includes(true);
    const isReady = aiAction && spaceStatus?.valid;
    const aiActionSnapshot = aiAction ? useAIAction(aiAction) : null;

    if (!isReady || !aiActionSnapshot) {
        return (
            <div style={{ position: "relative", minHeight: 200 }}>
                <LoadingPage />
            </div>
        );
    }

    return (
        <div style={{ position: "relative", minHeight: 200 }}>
            <AIActionConfirm
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    zIndex: 1000,
                }}
                onCancel={() => {
                    aiAction?.reset();
                }}
                onConfirm={async () => {
                    await aiAction?.run(
                        contentState,
                        ignoreContextContent,
                        addError,
                    );
                }}
                prompts={aiAction?.prompts}
                visible={aiActionSnapshot?.phase === AIActionPhase.describing}
            />
            <AIActionConfirm
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    zIndex: 1000,
                }}
                onCancel={() => {
                    aiAction?.redo();
                }}
                onConfirm={async () => {
                    aiAction?.reset();
                }}
                prompts={{
                    cancel: "Let's try this again.",
                    run: "OK, Done.",
                    cancelIcon: icons.CycleIcon,
                    runIcon: icons.StarIcon,
                }}
                visible={aiActionSnapshot?.phase === AIActionPhase.executed}
            />
            <Flex
                flexDirection="column"
                style={{
                    paddingLeft: tokens.spacingL,
                    paddingRight: tokens.spacingL,
                    paddingTop: 0,
                    paddingBottom: tokens.spacingM,
                    minHeight: isLoading ? 200 : 0,
                    position: "relative",
                    // ...LoadingStyles(isLoading),
                }}
            >
                {renderContextContent(
                    aiAction,
                    aiActionSnapshot,
                    contentState,
                    ignoreContextContent,
                    setIgnoreContextContent,
                )}
                <Textarea
                    value={aiActionSnapshot.userContent}
                    placeholder={aiAction.placeholder}
                    rows={3}
                    style={{
                        marginBottom: tokens.spacingS,
                    }}
                    onChange={(
                        event: React.ChangeEvent<HTMLTextAreaElement>,
                    ) => {
                        aiAction.updateSnapshot({
                            userContent: event.target.value,
                        });
                    }}
                />
                <Flex
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={tokens.spacing2Xs}
                >
                    {aiAction?.className !== "ContentfulOpenToolingAction" && (
                        <Checkbox
                            name="newsletter-subscribe-controlled"
                            id="newsletter-subscribe-controlled"
                            isChecked={autoExecute}
                            onChange={() => {
                                setAutoExecute((prevVal: boolean) => !prevVal);
                            }}
                        >
                            auto-execute
                        </Checkbox>
                    )}

                    <div style={{ flex: 1 }}></div>
                    {aiActionSnapshot.isRunning ? <LoadingIcon /> : null}
                    <Button
                        onClick={() => {
                            aiAction.updateSnapshot({
                                userContent: "",
                                contextContentSelections: {},
                            });
                        }}
                        variant="transparent"
                    >
                        Clear
                    </Button>
                    <Button
                        startIcon={<icons.StarIcon />}
                        onClick={() =>
                            aiAction?.run(
                                contentState,
                                ignoreContextContent,
                                addError,
                                false,
                                // autoExecute,
                            )
                        }
                        variant="primary"
                    >
                        Ask
                    </Button>
                </Flex>
            </Flex>
        </div>
    );
};

const renderContextContent = (
    aiAction: AIAction,
    aiActionSnapshot: AIActionSnapshot,
    contentState: ContentState,
    ignoreContextContent: boolean,
    setIgnoreContextContent: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    const contextContent = aiAction.contextContent(contentState);
    if (contextContent.length === 0) {
        return (
            <div
                key={`sentence-${aiAction.key}`}
                style={{ padding: tokens.spacingXs }}
            ></div>
        );
    }
    return (
        <Flex alignItems="center" key={`sentence-${aiAction.key}`}>
            <div
                style={{
                    flex: 1,
                    opacity: ignoreContextContent ? 0.2 : 1.0,
                }}
            >
                <Flex
                    flexDirection="row"
                    alignItems="baseline"
                    flexWrap="wrap"
                    style={{
                        marginTop: tokens.spacingS,
                        marginBottom: tokens.spacingS,
                    }}
                >
                    {renderContextContentRow(
                        aiAction,
                        aiActionSnapshot,
                        contextContent,
                    )}
                </Flex>
            </div>
            <IconButton
                style={{ maxHeight: 40 }}
                icon={
                    ignoreContextContent ? (
                        <icons.PreviewOffIcon />
                    ) : (
                        <icons.PreviewIcon />
                    )
                }
                aria-label="Ignore Execution "
                onClick={() => {
                    setIgnoreContextContent((prevVal) => !prevVal);
                }}
            />
        </Flex>
    );
};

const renderContextContentRow = (
    aiAction: AIAction,
    aiActionSnapshot: AIActionSnapshot,
    contextContent: AIActionContentPrefix,
    pathIndexes: { sentenceIndex: number; pathIndex: number }[] = [],
): (JSX.Element | null)[] => {
    const output: (JSX.Element | null)[] = [];
    contextContent?.map((item, index) => {
        const key = `fragment-${[
            ...pathIndexes.map(
                (indexes) => `${indexes.sentenceIndex}-${indexes.pathIndex}`,
            ),
            index,
        ].join("-")}`;

        if (item === "[BREAK]") {
            output.push(<div style={{ width: "100%" }} key={key} />);
            return;
        }

        if (typeof item === "string") {
            const words = item.split(" ");
            words.map((word, index) => {
                output.push(
                    <span key={`${key}-${index}`} style={{ padding: `8px 0` }}>
                        {word}&nbsp;
                    </span>,
                );
            });
            return;
        }

        const val =
            aiActionSnapshot.contextContentSelections[item.id] ||
            item.defaultValue ||
            (item.options[0] as any);
        let path, pathIndex;
        if (item.paths) {
            pathIndex = item.options.indexOf(val);
            pathIndex = pathIndex === -1 ? 0 : pathIndex;
            path = item.paths[pathIndex];
        }

        // select...
        output.push(
            <div key={key} style={{ padding: `${tokens.spacing2Xs} 0` }}>
                <Select
                    value={val}
                    onChange={(e) => {
                        const val = e.target.value;
                        aiAction.updateSnapshot({
                            contextContentSelections: {
                                ...aiActionSnapshot.contextContentSelections,
                                [item.id]: val,
                            },
                        });
                    }}
                >
                    {item.options.map((option, optionIndex) => {
                        let name = `${option}`;
                        if (item.labels && item.labels[optionIndex]) {
                            name = `${item.labels[optionIndex]}`;
                        }
                        return (
                            <Select.Option
                                value={option as any}
                                key={`${key}-${optionIndex}`}
                            >
                                {name}
                            </Select.Option>
                        );
                    })}
                </Select>
            </div>,
        );

        output.push(<div key={`${key}-space`} style={{ width: 6 }}></div>);

        if (path) {
            output.push(
                ...renderContextContentRow(aiAction, aiActionSnapshot, path, [
                    ...pathIndexes,
                    { sentenceIndex: index, pathIndex: pathIndex! },
                ]),
            );
        }
    });

    return output;
};

export default AIActionEditor;
