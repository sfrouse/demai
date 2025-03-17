import tokens from "@contentful/f36-tokens";
import { CSSProperties } from "react";
import { AIActionPhase, AIMessage } from "./AIAction/AIActionTypes";
import { marked } from "marked";

const ConversationBubble = ({ aiMessage }: { aiMessage: AIMessage }) => {
  if (!aiMessage) return null;

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

  const html = marked(aiMessage.message);
  switch (aiMessage.role) {
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
      if (aiMessage.phase === AIActionPhase.executed) {
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

export default ConversationBubble;
