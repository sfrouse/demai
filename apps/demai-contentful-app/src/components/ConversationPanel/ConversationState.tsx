import tokens from "@contentful/f36-tokens";
import { CSSProperties } from "react";
import { marked } from "marked";
import AIState from "../../ai/AIState/AIState";
import { AIStatePhase } from "../../ai/AIState/AIStateTypes";
import addHTMLColorChips from "./util/addHTMLColorChips";

const ConversationState = ({ aiState }: { aiState: AIState }) => {
  if (!aiState) return null;

  const baseCSS: CSSProperties = {
    maxWidth: "85%",
    // whiteSpace: "pre-wrap",
    // wordBreak: "break-word",
    margin: 0,
    marginBottom: tokens.spacingS,
    // fontFamily: "monospace",
    fontFamily: tokens.fontStackPrimary,
    padding: `${tokens.spacingM} ${tokens.spacingM}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: 12,
  };

  const html = `${marked(
    addHTMLColorChips(aiState.response)
  )}<div style="color: ${tokens.gray400}">role: ${aiState.role}, phase: ${
    aiState.phase
  }, running: ${aiState.isRunning ? "yes" : "no"}</div>`;
  switch (aiState.role) {
    case "user": {
      return (
        <div
          style={{
            alignSelf: "flex-end",
            backgroundColor: tokens.blue100,
            ...baseCSS,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        ></div>
      );
    }
    case "assistant": {
      if (aiState.phase === AIStatePhase.executing) {
        return (
          <>
            <div
              style={{
                alignSelf: "flex-start",
                backgroundColor: tokens.green100,
                ...baseCSS,
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            ></div>
          </>
        );
      } else {
        return (
          <>
            <div
              style={{
                alignSelf: "flex-start",
                backgroundColor: tokens.gray100,
                ...baseCSS,
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            ></div>
          </>
        );
      }
    }
    default: {
      return "";
    }
  }
};

export default ConversationState;
