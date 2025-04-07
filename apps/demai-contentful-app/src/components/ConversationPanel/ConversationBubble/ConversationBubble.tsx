import tokens from "@contentful/f36-tokens";
import { useEffect, useState } from "react";
import AIState from "../../../ai/AIState/AIState";
import scrollBarStyles from "../../utils/ScrollBarMinimal.module.css";
import convertMarkdown from "../util/convertMarkdown";
import ConversationTitle from "./ConversationTitle";
import { Flex } from "@contentful/f36-components";
import ButtonXs from "../../ButtonXs/ButtonXs";

const ConversationBubble = ({ aiState }: { aiState: AIState }) => {
  if (!aiState) return null;
  const [showSystem, setShowSystem] = useState<boolean>(false);
  const [showFullPrompt, setShowFullPrompt] = useState<boolean>(false);
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
      const newHTML = convertMarkdown(`${aiState.userContent}`);
      setUserContentHTML(newHTML);
    })();
  }, [aiState.userContent]);

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

  if (!aiState.request) {
    return (
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
    );
  }

  const doShowPromptMore = requestHtml?.length > 200;

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
        paddingTop: tokens.spacingL,
      }}
    >
      {/* <Divider style={{ margin: 0 }} /> */}
      <div
        style={{
          padding: `0 ${tokens.spacingL}`,
        }}
      >
        <ConversationTitle title="User Prompt" />
        <span
          dangerouslySetInnerHTML={{
            __html: aiState.userContent ? userContentHTML : "--",
          }}
        ></span>
      </div>
      <div
        style={{
          padding: `0 ${tokens.spacingL}`,
        }}
      >
        <ConversationTitle title="Full Prompt" />
        <div
          style={{
            maxHeight: showFullPrompt ? "initial" : 100,
            overflow: "hidden",
            position: "relative",
            paddingBottom: doShowPromptMore ? 40 : 0,
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: requestHtml }}></span>
          {doShowPromptMore &&
            (showFullPrompt ? (
              <Flex
                justifyContent="center"
                alignItems="flex-end"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background: "linear-gradient(to top, white, transparent)",
                }}
              >
                <ButtonXs
                  onClick={async () => {
                    setShowFullPrompt((prev) => !prev);
                  }}
                >
                  Hide
                </ButtonXs>
              </Flex>
            ) : (
              <Flex
                justifyContent="center"
                alignItems="flex-end"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background:
                    "linear-gradient(to top, white 50%, transparent 100%)",
                }}
              >
                <ButtonXs
                  onClick={async () => {
                    setShowFullPrompt((prev) => !prev);
                  }}
                >
                  More...
                </ButtonXs>
              </Flex>
            ))}
        </div>
      </div>

      <div
        style={{
          padding: `0 ${tokens.spacingL}`,
        }}
      >
        <ConversationTitle title="System" />
        {showSystem ? (
          <>
            <div>
              <span dangerouslySetInnerHTML={{ __html: systemHtml }} />
            </div>
            <div
              style={{
                padding: ` ${tokens.spacingM} 0`,
              }}
            >
              <ConversationTitle title="Tools" />
              <span>{toolsHtml}</span>
            </div>
            <Flex justifyContent="center" alignItems="flex-end">
              <ButtonXs
                onClick={async () => {
                  setShowSystem((prev) => !prev);
                }}
              >
                Hide
              </ButtonXs>
            </Flex>
          </>
        ) : (
          <Flex justifyContent="center" alignItems="flex-end">
            <ButtonXs
              onClick={async () => {
                setShowSystem((prev) => !prev);
              }}
            >
              Show...
            </ButtonXs>
          </Flex>
        )}
      </div>
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
      {aiState.errors.length > 0 && (
        <div
          style={{
            padding: `0 ${tokens.spacingL}`,
          }}
        >
          <ConversationTitle title="Errors" />
          <span style={{ color: tokens.colorWarning }}>
            {aiState.errors.join(", ")}
          </span>
        </div>
      )}
      {/* <ConversationToolbar aiState={aiState} setShowSystem={setShowSystem} /> */}
    </Flex>
  );
};

export default ConversationBubble;
