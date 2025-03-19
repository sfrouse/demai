import tokens from "@contentful/f36-tokens";
import { CSSProperties } from "react";
import AIState from "../../ai/AIState/AIState";
import { AIStatePhase } from "../../ai/AIState/AIStateTypes";
import { Flex } from "@contentful/f36-components";
import ButtonXs from "../ButtonXs/ButtonXs";
import Divider from "../Divider";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import styles from "./ConversationState.module.css";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import classNames from "../utils/classNames";
import convertMarkdown from "./util/convertMarkdown";

const ConversationState = ({ aiState }: { aiState: AIState }) => {
  if (!aiState) return null;
  const { contentState } = useContentStateSession();

  const baseCSS: CSSProperties = {
    maxWidth: "85%",

    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",

    margin: 0,
    marginBottom: tokens.spacingS,
    // fontFamily: "monospace",
    fontFamily: tokens.fontStackPrimary,
    padding: `${tokens.spacingM} ${tokens.spacingM}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: 12,
  };

  const html = convertMarkdown(aiState.response, styles);

  const stats = (
    <Flex
      style={{ color: tokens.gray400, font: tokens.fontStackPrimary }}
      flexDirection="row"
      alignItems="center"
    >
      role: {aiState.role}, phase: {aiState.phase}, running:{" "}
      {aiState.isRunning ? "yes" : "no"}
    </Flex>
  );

  switch (aiState.role) {
    case "user": {
      return (
        <div
          className={classNames(
            styles["conversation-state"],
            scrollBarStyles["scrollbar-minimal"]
          )}
          style={{
            alignSelf: "flex-end",
            backgroundColor: tokens.blue100,
            ...baseCSS,
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: html }}></span>
          <Divider />
          <Flex flexDirection="row" alignContent="center">
            {stats}
            <div style={{ flex: 1, minWidth: 30 }}></div>
            <ButtonXs
              onClick={async () => {
                await aiState.run(contentState);
              }}
            >
              Run Again
            </ButtonXs>
          </Flex>
        </div>
      );
    }
    case "assistant": {
      if (aiState.phase === AIStatePhase.executing) {
        return (
          <div
            className={classNames(
              styles["conversation-state"],
              scrollBarStyles["scrollbar-minimal"]
            )}
            style={{
              alignSelf: "flex-start",
              backgroundColor: tokens.green100,
              ...baseCSS,
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: html }}></span>
            <Divider />
            {stats}
          </div>
        );
      } else if (aiState.phase === AIStatePhase.executed) {
        return (
          <div
            className={classNames(
              styles["conversation-state"],
              scrollBarStyles["scrollbar-minimal"]
            )}
            style={{
              alignSelf: "flex-start",
              backgroundColor: tokens.gray100,
              ...baseCSS,
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: html }}></span>
            <Divider />
            {stats}
          </div>
        );
      } else if (aiState.phase === AIStatePhase.describing) {
        return (
          <div
            className={classNames(
              styles["conversation-state"],
              scrollBarStyles["scrollbar-minimal"]
            )}
            style={{
              alignSelf: "flex-start",
              backgroundColor: tokens.gray100,
              ...baseCSS,
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: html }}></span>
            <Divider />
            <Flex flexDirection="row" alignContent="center">
              {stats}
              <div style={{ flex: 1, minWidth: 30 }}></div>
              <ButtonXs
                onClick={async () => {
                  await aiState.run(contentState);
                }}
              >
                Execute
              </ButtonXs>
            </Flex>
          </div>
        );
      } else {
        return (
          <div
            className={classNames(
              styles["conversation-state"],
              scrollBarStyles["scrollbar-minimal"]
            )}
            style={{
              alignSelf: "flex-start",
              backgroundColor: tokens.gray100,
              ...baseCSS,
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: html }}></span>
            {stats}
          </div>
        );
      }
    }
    default: {
      return "";
    }
  }
};

export default ConversationState;
