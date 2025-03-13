import { Button, Flex, Paragraph } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import React, { useEffect, useState } from "react";
import { AIActionPrompts } from "../../ai/AIAction/AIActionTypes";

interface ConversationConfirmProps {
  message: string | undefined;
  onCancel: () => void;
  onConfirm: () => void;
  prompts?: AIActionPrompts;
  style?: React.CSSProperties;
  visible: boolean;
}

const ConversationConfirm: React.FC<ConversationConfirmProps> = ({
  message,
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
