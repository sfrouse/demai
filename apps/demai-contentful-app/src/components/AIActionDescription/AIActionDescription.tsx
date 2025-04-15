import { useEffect, useState } from "react";
import { AIAction } from "../../ai/AIAction/AIAction";
import convertMarkdown from "./util/convertMarkdown";
import tokens from "@contentful/f36-tokens";
import { Flex } from "@contentful/f36-components";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import AIActionDescriptionTitle from "./components/AIActionDescriptionTitle";
import { AIActionSnapshot } from "../../ai/AIAction/AIActionTypes";
import AutoBenchAIAction from "../AutoBench/components/AutoBenchAIAction";

const AIActionDescription = ({
    aiAction,
    aiActionSnapshot,
}: {
    aiAction: AIAction;
    aiActionSnapshot: AIActionSnapshot;
}) => {
    if (!aiAction) return null;
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

            {aiActionSnapshot.userContent && (
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
            {aiActionSnapshot.request && (
                <div
                    style={{
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <AIActionDescriptionTitle title="Full Prompt" />
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
            {aiActionSnapshot.request && (
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
            {aiActionSnapshot.response && (
                <div
                    style={{
                        padding: `0 ${tokens.spacingL}`,
                    }}
                >
                    <AIActionDescriptionTitle title="Suggestion" />
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
                    <AIActionDescriptionTitle title="Results" />
                    <span
                        dangerouslySetInnerHTML={{
                            __html: executionResponseHtml,
                        }}
                    ></span>
                </div>
            )}
            {aiActionSnapshot.request &&
                aiActionSnapshot.childActions.length > 0 && (
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
};

export default AIActionDescription;
