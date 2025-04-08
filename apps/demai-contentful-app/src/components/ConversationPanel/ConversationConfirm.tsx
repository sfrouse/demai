import { Button, Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import React from "react";
import { AIPromptPrompts } from "../../ai/AIState/AIPromptEngine/AIPromptEngineTypes";

interface ConversationConfirmProps {
  onCancel: () => void;
  onConfirm: () => void;
  prompts?: AIPromptPrompts;
  style?: React.CSSProperties;
  visible: boolean;
}

const ConversationConfirm: React.FC<ConversationConfirmProps> = ({
  onCancel,
  onConfirm,
  prompts,
  style,
  visible,
}) => {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{
        opacity: visible ? 1 : 0, // 🔹 Animate opacity
        visibility: visible ? "visible" : "hidden",
        // transition: "opacity 0.s ease-in-out, visibility 0.3s",
        backgroundColor: tokens.colorWhite,
        ...style,
      }}
    >
      {/* <Paragraph>{message}</Paragraph> */}
      <Flex flexDirection="row" justifyContent="center" alignItems="center">
        {prompts?.cancel && (
          <Button
            startIcon={
              prompts?.cancelIcon && React.createElement(prompts.cancelIcon)
            }
            variant="secondary"
            onClick={onCancel}
            style={{ marginRight: "10px" }}
          >
            {prompts?.cancel}
          </Button>
        )}
        <Button
          startIcon={prompts?.runIcon && React.createElement(prompts.runIcon)}
          variant="primary"
          onClick={onConfirm}
        >
          {prompts?.run}
        </Button>
      </Flex>
    </Flex>
  );
};

export default ConversationConfirm;
