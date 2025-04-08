import tokens from "@contentful/f36-tokens";
import { useEffect, useState } from "react";
import AIState from "../../../ai/AIState/AIState";
import scrollBarStyles from "../../utils/ScrollBarMinimal.module.css";
import convertMarkdown from "../util/convertMarkdown";
import ConversationTitle from "./ConversationTitle";
import { Flex } from "@contentful/f36-components";

const ConversationBubble = ({ aiState }: { aiState: AIState }) => {
  if (!aiState) return null;
  const [systemHtml, setSystemHtml] = useState<string>("");
  const [userContentHTML, setUserContentHTML] = useState<string>("");
  const [requestHtml, setRequestHTML] = useState<string>("");
  const [responseHtml, setResponseHTML] = useState<string>("");
  const [toolsHtml, setToolsHTML] = useState<string>("");
  const [executionResponseHtml, setExecutionResponseHTML] =
    useState<string>("");

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.promptEngine.system.content}`);
      setSystemHtml(newHTML);
    })();
  }, [aiState.promptEngine.system]);

  useEffect(() => {
    (async () => {
      // if (!showSystem || toolsHtml) return;
      const tools = await aiState.promptEngine.getTools(
        aiState.promptEngine.toolFilters
      );
      const toolNames = (tools || [])
        .map((tool: any) => tool.function?.name)
        .join(", ");
      setToolsHTML(toolNames || "");
    })();
  }, [
    aiState.promptEngine,
    // showSystem
  ]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.status.userContent}`);
      setUserContentHTML(newHTML);
    })();
  }, [aiState.status.userContent]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.request}`);
      setRequestHTML(newHTML);
    })();
  }, [aiState.request]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.response}`);
      setResponseHTML(newHTML);
    })();
  }, [aiState.response]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.executionResponse}`);
      setExecutionResponseHTML(newHTML);
    })();
  }, [aiState.executionResponse]);

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
          <span>{aiState.promptEngine.introMessage}</span>
        </div>
      </div>

      {aiState.status.userContent && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="User Prompt" />
          <span
            dangerouslySetInnerHTML={{
              __html: aiState.status.userContent ? userContentHTML : "--",
            }}
          ></span>
        </div>
      )}
      {aiState.request && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="Full Prompt" />
          <div
            style={{
              overflow: "hidden",
              position: "relative",
            }}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: aiState.request ? requestHtml : "--",
              }}
            ></span>
          </div>
        </div>
      )}
      {aiState.request && (
        <>
          <div
            style={{
              padding: `0 ${tokens.spacingL}`,
            }}
          >
            <ConversationTitle title="System" />
            <div>
              <span dangerouslySetInnerHTML={{ __html: systemHtml }} />
            </div>
          </div>
          <div
            style={{
              padding: `0 ${tokens.spacingL}`,
            }}
          >
            <ConversationTitle title="Tools" />
            <span>{toolsHtml || "none"}</span>
          </div>
        </>
      )}
      {aiState.response && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="Suggestion" />
          <span dangerouslySetInnerHTML={{ __html: responseHtml }}></span>
        </div>
      )}
      {aiState.executionResponse && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="Results" />
          <span
            dangerouslySetInnerHTML={{ __html: executionResponseHtml }}
          ></span>
        </div>
      )}
      {aiState.status.errors.length > 0 && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="Errors" />
          <span style={{ color: tokens.colorWarning }}>
            {aiState.status.errors.join(", ")}
          </span>
        </div>
      )}
      {/* <ConversationToolbar aiState={aiState} setShowSystem={setShowSystem} /> */}
    </Flex>
  );
};

export default ConversationBubble;
