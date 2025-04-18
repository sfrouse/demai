import { forwardRef, useEffect, useState } from "react";
import { AIAction } from "../../ai/AIAction/AIAction";
import tokens from "@contentful/f36-tokens";
import { Flex } from "@contentful/f36-components";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import AIActionDescriptionTitle from "./components/AIActionDescriptionTitle";
import { AIActionSnapshot } from "../../ai/AIAction/AIActionTypes";
import AutoBenchAIAction from "../AIActionAutoBench/components/AutoBenchAIAction";
import convertMarkdown from "../utils/convertMarkdown/convertMarkdown";
import { safeJSONStringify } from "../utils/safeJSONStringify";
import ButtonXs from "../ButtonXs/ButtonXs";
import useAIState from "../../contexts/AIStateContext/useAIState";

const AIActionDescription = forwardRef<
    HTMLDivElement,
    {
        aiAction: AIAction;
        aiActionSnapshot: AIActionSnapshot;
        robust?: boolean;
    }
>(({ aiAction, aiActionSnapshot, robust = false }, ref) => {
    if (!aiAction) return null;
    const { setInspectedContent } = useAIState();
    const [systemHtml, setSystemHtml] = useState<string>("");
    const [userContentHTML, setUserContentHTML] = useState<string>("");
    const [requestHtml, setRequestHTML] = useState<string>("");
    const [responseHtml, setResponseHTML] = useState<string>("");
    const [toolsHtml, setToolsHTML] = useState<string>("");
    const [executionResponseHtml, setExecutionResponseHTML] =
        useState<string>("");

    useEffect(() => {
        (async () => {
            const newHTML = convertMarkdown(`${aiAction.system.content}`);
            setSystemHtml(newHTML);
        })();
    }, [aiAction.system]);

    useEffect(() => {
        (async () => {
            // if (!showSystem || toolsHtml) return;
            const tools = await aiAction.getTools(aiAction.toolFilters);
            const toolNames = (tools || [])
                .map((tool: any) => tool.function?.name)
                .join(", ");
            setToolsHTML(toolNames || "");
        })();
    }, [aiAction]);

    useEffect(() => {
        (async () => {
            const newHTML = convertMarkdown(`${aiActionSnapshot.userContent}`);
            setUserContentHTML(newHTML);
        })();
    }, [aiActionSnapshot.userContent]);

    useEffect(() => {
        (async () => {
            const newHTML = convertMarkdown(`${aiActionSnapshot.request}`);
            setRequestHTML(newHTML);
        })();
    }, [aiActionSnapshot.request]);

    useEffect(() => {
        (async () => {
            const newHTML = convertMarkdown(`${aiActionSnapshot.response}`);
            setResponseHTML(newHTML);
        })();
    }, [aiActionSnapshot.response]);

    useEffect(() => {
        (async () => {
            const newHTML = convertMarkdown(
                `${aiActionSnapshot.executionResponse}`,
            );
            setExecutionResponseHTML(newHTML);
        })();
    }, [aiActionSnapshot.executionResponse]);

    return (
        <Flex
            ref={ref}
            flexDirection="column"
            className={scrollBarStyles["scrollbar-minimal"]}
            style={{
                alignSelf: "flex-start",
                width: "100%",

                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",

                margin: 0,
                fontFamily: tokens.fontStackPrimary,
                borderRadius: tokens.borderRadiusMedium,
                fontSize: 12,
                gap: tokens.spacingM,
                backgroundColor: "rgba(0,0,0,0)",
                padding: `${tokens.spacingL} 0`,
            }}
        >
            <div>
                <div
                    style={{
                        alignSelf: "flex-start",
                        backgroundColor: "rgba(0,0,0,0)",
                        maxWidth: "100%",
                        width: "100%",
                        fontSize: tokens.fontSizeM,
                        padding: `0 ${tokens.spacingL} ${tokens.spacingM} ${tokens.spacingL}`,
                    }}
                >
                    <span>{aiAction.introMessage}</span>
                </div>
            </div>

            {/* USER PROMPT */}
            {robust && aiActionSnapshot.userContent && (
                <div
                    style={{
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <AIActionDescriptionTitle title="User Prompt" />
                    <span
                        dangerouslySetInnerHTML={{
                            __html: aiActionSnapshot.userContent
                                ? userContentHTML
                                : "--",
                        }}
                    ></span>
                </div>
            )}
            {/* FULL PROMPT */}
            {aiActionSnapshot.request && (
                <div
                    style={{
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <AIActionDescriptionTitle
                        title={robust ? "Full Prompt" : "Prompt"}
                    />
                    <div
                        style={{
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <span
                            dangerouslySetInnerHTML={{
                                __html: aiActionSnapshot.request
                                    ? requestHtml
                                    : "--",
                            }}
                        ></span>
                    </div>
                </div>
            )}

            {/* SYSTEM */}
            {robust && (
                <>
                    <div
                        style={{
                            padding: `0 ${tokens.spacingL}`,
                        }}
                    >
                        <AIActionDescriptionTitle title="System" />
                        <div>
                            <span
                                dangerouslySetInnerHTML={{ __html: systemHtml }}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            padding: `0 ${tokens.spacingL}`,
                        }}
                    >
                        <AIActionDescriptionTitle title="Tools" />
                        <span>{toolsHtml || "none"}</span>
                    </div>
                </>
            )}

            {/* RESPONSE */}
            {aiActionSnapshot.response && (
                <div
                    style={{
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <Flex flexDirection="row" alignItems="center">
                        <AIActionDescriptionTitle title="Response" />
                        <div style={{ flex: 1 }}></div>
                        {robust && (
                            <>
                                <ButtonXs
                                    onClick={() => {
                                        setInspectedContent(
                                            safeJSONStringify(
                                                aiActionSnapshot.runAIArg,
                                            ),
                                        );
                                    }}
                                >
                                    Args
                                </ButtonXs>
                                <ButtonXs
                                    onClick={() => {
                                        console.log("TEST");
                                        setInspectedContent(
                                            safeJSONStringify(
                                                aiActionSnapshot.runAIResults,
                                            ),
                                        );
                                    }}
                                >
                                    Results
                                </ButtonXs>
                            </>
                        )}
                    </Flex>

                    <span
                        dangerouslySetInnerHTML={{ __html: responseHtml }}
                    ></span>
                </div>
            )}
            {aiActionSnapshot.executionResponse && (
                <div
                    style={{
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <Flex flexDirection="row" alignItems="center">
                        <AIActionDescriptionTitle title="Execution Results" />
                        <div style={{ flex: 1 }}></div>
                        {robust && (
                            <>
                                <ButtonXs
                                    onClick={() => {
                                        setInspectedContent(
                                            safeJSONStringify(
                                                aiActionSnapshot.runExeAIArg,
                                            ),
                                        );
                                    }}
                                >
                                    Args
                                </ButtonXs>
                                <ButtonXs
                                    onClick={() => {
                                        console.log("TEST", aiActionSnapshot);
                                        setInspectedContent(
                                            safeJSONStringify(
                                                aiActionSnapshot.runExeAIResults,
                                            ),
                                        );
                                    }}
                                >
                                    Results
                                </ButtonXs>
                            </>
                        )}
                    </Flex>

                    <span
                        dangerouslySetInnerHTML={{
                            __html: executionResponseHtml,
                        }}
                    ></span>
                </div>
            )}
            {aiActionSnapshot.childActions.length > 0 && (
                <Flex
                    flexDirection="column"
                    style={{
                        gap: tokens.spacingXs,
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <AIActionDescriptionTitle title="Actions" />
                    {aiActionSnapshot.childActions.map((subAIAction) => {
                        return (
                            <AutoBenchAIAction
                                key={`sub-${subAIAction.key}`}
                                aiAction={subAIAction}
                            />
                        );
                    })}
                </Flex>
            )}
            {aiActionSnapshot.errors.length > 0 && (
                <div
                    style={{
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <AIActionDescriptionTitle title="Errors" />
                    <span style={{ color: tokens.colorWarning }}>
                        {aiActionSnapshot.errors.join(", ")}
                    </span>
                </div>
            )}
        </Flex>
    );
});

export default AIActionDescription;
