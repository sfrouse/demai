import tokens from "@contentful/f36-tokens";
import { useEffect, useState } from "react";
import AIState from "../../../ai/AIState/AIState";
import Divider from "../../Divider";
import styles from "./ConversationBubble.module.css";
import scrollBarStyles from "../../utils/ScrollBarMinimal.module.css";
import classNames from "../../utils/classNames";
import convertMarkdown from "../util/convertMarkdown";
import ConversationToolbar from "./ConversationToolbar";
import ConversationTitle from "./ConversationTitle";
import { Flex } from "@contentful/f36-components";

const ConversationBubble = ({ aiState }: { aiState: AIState }) => {
  if (!aiState) return null;
  const [showSystem, setShowSystem] = useState<boolean>(false);
  const [systemHtml, setSystemHtml] = useState<string>("");
  const [requestHtml, setRequestHTML] = useState<string>("");
  const [responseHtml, setResponseHTML] = useState<string>("");
  const [toolsHtml, setToolsHTML] = useState<string>("");
  const [executionResponseHtml, setExecutionResponseHTML] =
    useState<string>("");

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(
        `${aiState.promptEngine.system.content}`,
        styles
      );
      setSystemHtml(newHTML);
    })();
  }, [aiState.promptEngine.system]);

  useEffect(() => {
    (async () => {
      if (!showSystem || toolsHtml) return;
      const tools = await aiState.promptEngine.getTools(
        aiState.promptEngine.toolFilters
      );
      const toolNames = (tools || [])
        .map((tool: any) => tool.function?.name)
        .join(", ");
      setToolsHTML(toolNames || "");
    })();
  }, [aiState.promptEngine, showSystem]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.request}`, styles);
      setRequestHTML(newHTML);
    })();
  }, [aiState.request]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.response}`, styles);
      setResponseHTML(newHTML);
    })();
  }, [aiState.response]);

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${aiState.executionResponse}`, styles);
      setExecutionResponseHTML(newHTML);
    })();
  }, [aiState.executionResponse]);

  if (!aiState.request) {
    return (
      <div>
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: tokens.colorWhite,
            maxWidth: "100%",
            width: "100%",
            fontSize: tokens.fontSizeM,
            padding: `0 ${tokens.spacingL} ${tokens.spacingM} ${tokens.spacingL}`,
          }}
        >
          <span>{aiState.promptEngine.introMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <Flex
      flexDirection="column"
      className={classNames(
        styles["conversation-state"],
        scrollBarStyles["scrollbar-minimal"]
      )}
      style={{
        alignSelf: "flex-start",
        width: "100%",

        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",

        margin: 0,
        // marginBottom: tokens.spacingS,
        fontFamily: tokens.fontStackPrimary,
        // backgroundColor: tokens.gray100,
        borderRadius: tokens.borderRadiusMedium,
        fontSize: 12,
        // padding: `${tokens.spacingM} 0 0 0`,
        gap: tokens.spacingM,
      }}
    >
      <Divider style={{ margin: 0 }} />
      <div
        style={{
          padding: `0 ${tokens.spacingL}`,
        }}
      >
        <ConversationTitle title="Prompt" />
        <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
      </div>
      {showSystem && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="System" />
          <span dangerouslySetInnerHTML={{ __html: systemHtml }}></span>
        </div>
      )}
      {showSystem && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="Tools" />
          <span>{toolsHtml}</span>
        </div>
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
      <ConversationToolbar aiState={aiState} setShowSystem={setShowSystem} />
    </Flex>
  );
};

export default ConversationBubble;
