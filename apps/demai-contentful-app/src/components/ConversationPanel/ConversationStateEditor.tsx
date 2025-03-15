import React from "react";
import tokens from "@contentful/f36-tokens";
import {
  Button,
  Flex,
  IconButton,
  Select,
  Textarea,
} from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import {
  AIStateContentPrefix,
  AIStateStatus,
} from "../../ai/AIState/AIStateTypes";
import AIState from "../../ai/AIState/AIState";

interface ConversationStateEditorProps {
  aiState: AIState;
  aiStateStatus: AIStateStatus;
}

const ConversationStateEditor: React.FC<ConversationStateEditorProps> = ({
  aiStateStatus,
  aiState,
}) => {
  return (
    <Flex
      flexDirection="column"
      style={{
        paddingLeft: tokens.spacingL,
        paddingRight: tokens.spacingL,
        paddingTop: 0,
        paddingBottom: tokens.spacingM,
      }}
    >
      {renderContextContent(aiState, aiStateStatus)}
      <Textarea
        value={aiStateStatus.userContent}
        placeholder={aiState.placeholder}
        rows={4}
        style={{
          marginBottom: tokens.spacingS,
        }}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          aiState.updateStatus({ userContent: event.target.value });
        }}
      />
      <Flex justifyContent="flex-end" gap={tokens.spacing2Xs}>
        <div style={{ flex: 1 }}></div>
        <Button
          startIcon={<icons.DeleteIcon />}
          onClick={() => {
            // not sure what this is now...
            // aiState.revert();
          }}
          variant="transparent"
        >
          Reset
        </Button>
        <Button
          startIcon={<icons.StarIcon />}
          onClick={() => aiState?.run()}
          variant="primary"
        >
          Run
        </Button>
      </Flex>
    </Flex>
  );
};

const renderContextContent = (
  aiState: AIState,
  aiStateStatus: AIStateStatus
) => {
  if (
    !aiStateStatus.contextContent ||
    aiStateStatus.contextContent.length === 0
  ) {
    return <div style={{ padding: tokens.spacingXs }}></div>;
  }
  return (
    <Flex alignItems="center">
      <div
        style={{
          flex: 1,
          opacity: aiStateStatus.ignoreContextContent ? 0.2 : 1.0,
        }}
      >
        <Flex
          flexDirection="row"
          gap={tokens.spacingXs}
          alignItems="baseline"
          style={{
            marginTop: tokens.spacingS,
            marginBottom: tokens.spacingS,
          }}
        >
          {aiStateStatus.contextContent?.map((item, index) => {
            if (typeof item === "string") {
              return <span key={index}>{item} </span>;
            }
            return (
              <Select
                key={index}
                value={item.value || (item.options[0] as any)}
                onChange={(e) => {
                  // onChange(e.target.value, index)
                  // (val: string, index: number) => {
                  const select = aiStateStatus.contextContent[index];
                  if (typeof select !== "string") {
                    select.value = e.target.value;
                  }
                  aiState.updateStatus({
                    contextContent: [...aiStateStatus.contextContent],
                  });
                }}
              >
                {item.options.map((option) => (
                  <Select.Option key={option as any} value={option as any}>
                    {option as string}
                  </Select.Option>
                ))}
              </Select>
            );
          })}
        </Flex>
      </div>
      <IconButton
        style={{ maxHeight: 40 }}
        icon={
          aiStateStatus.ignoreContextContent ? (
            <icons.PreviewOffIcon />
          ) : (
            <icons.PreviewIcon />
          )
        }
        aria-label="Ignore Execution "
        onClick={() => {
          aiState.updateStatus({
            ignoreContextContent: !aiStateStatus.ignoreContextContent,
          });
        }}
      />
    </Flex>
  );
};

export default ConversationStateEditor;
