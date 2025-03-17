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
  AIActionContentPrefix,
  AIActionState,
} from "../../../ai/_archive/v3/AIAction/AIActionTypes";
import { AIAction } from "../../../ai/_archive/v3/AIAction/AIAction";

interface ConversationInputProps {
  aiAction: AIAction | undefined;
  aiActionState: AIActionState | undefined;
}

const ConversationInput: React.FC<ConversationInputProps> = ({
  aiActionState,
  aiAction,
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
      <Flex alignItems="center">
        <div
          style={{
            flex: 1,
            opacity: aiActionState?.ignoreExecutionPrompt ? 0.2 : 1.0,
          }}
        >
          {aiActionState?.contentPrefix &&
            renderContentPrefix(
              aiActionState.contentPrefix,
              (val: string, index: number) => {
                const select = aiActionState.contentPrefix[index];
                if (typeof select !== "string") {
                  select.value = val;
                }
                aiAction?.updateContentPrefix([...aiActionState.contentPrefix]);
              }
            )}
        </div>
        <IconButton
          style={{ maxHeight: 40 }}
          icon={
            aiActionState?.ignoreExecutionPrompt ? (
              <icons.PreviewOffIcon />
            ) : (
              <icons.PreviewIcon />
            )
          }
          aria-label="Ignore Execution "
          onClick={() => {
            aiAction?.updateIgnoreExecutionPrompt(
              !aiActionState?.ignoreExecutionPrompt
            );
          }}
        />
      </Flex>
      <Textarea
        value={aiActionState?.userPrompt}
        placeholder={aiAction?.placeholder}
        rows={4}
        style={{
          marginBottom: tokens.spacingS,
        }}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          aiAction?.updateUserPrompt(event.target.value);
        }}
      />
      <Flex justifyContent="flex-end" gap={tokens.spacing2Xs}>
        <div style={{ flex: 1 }}></div>
        <Button
          startIcon={<icons.DeleteIcon />}
          onClick={() => aiAction?.revert()}
          variant="transparent"
        >
          Reset
        </Button>
        <Button
          startIcon={<icons.StarIcon />}
          onClick={() => aiAction?.run()}
          variant="primary"
        >
          Run
        </Button>
      </Flex>
    </Flex>
  );
};

const renderContentPrefix = (
  contentPrefix: AIActionContentPrefix,
  onChange: (value: string, index: number) => void
) => {
  return (
    <Flex
      flexDirection="row"
      gap={tokens.spacingXs}
      alignItems="baseline"
      style={{
        marginTop: tokens.spacingS,
        marginBottom: tokens.spacingS,
      }}
    >
      {contentPrefix?.map((item, index) => {
        if (typeof item === "string") {
          return <span key={index}>{item} </span>;
        }
        return (
          <Select
            key={index}
            value={item.value || (item.options[0] as any)}
            onChange={(e) => onChange(e.target.value, index)}
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
  );
};

export default ConversationInput;
