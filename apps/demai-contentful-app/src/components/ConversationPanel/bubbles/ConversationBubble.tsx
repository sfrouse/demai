import tokens from "@contentful/f36-tokens";
import { CSSProperties } from "react";
import { AIActionPhase, AIMessage } from "../../../ai/AIAction/AIActionTypes";

const ConversationBubble = ({ aiMessage }: { aiMessage: AIMessage }) => {
  if (!aiMessage) return null;

  const baseCSS: CSSProperties = {
    maxWidth: "95%",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
    marginBottom: tokens.spacingS,
    // fontFamily: "monospace",
    fontFamily: tokens.fontStackPrimary,
    padding: `${tokens.spacingM} ${tokens.spacingL}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: 13,
  };

  switch (aiMessage.role) {
    case "user": {
      return (
        <pre
          style={{
            alignSelf: "flex-end",
            backgroundColor: tokens.blue100,
            ...baseCSS,
          }}
        >
          {aiMessage.message}
        </pre>
      );
    }
    case "assistant": {
      if (aiMessage.phase === AIActionPhase.executed) {
        return (
          <>
            <pre
              style={{
                alignSelf: "flex-start",
                backgroundColor: tokens.green100,
                ...baseCSS,
              }}
            >
              {aiMessage.message}
            </pre>
          </>
        );
      } else {
        return (
          <>
            <pre
              style={{
                alignSelf: "flex-start",
                backgroundColor: tokens.gray100,
                ...baseCSS,
              }}
            >
              {aiMessage.message}
            </pre>
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
