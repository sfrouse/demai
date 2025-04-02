import React from "react";
import tokens from "@contentful/f36-tokens";
import {
  Button,
  Checkbox,
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
import {
  ContentState,
  useContentStateSession,
} from "../../contexts/ContentStateContext/ContentStateContext";
import LoadingIcon from "../LoadingIcon";
import useAIState from "../../contexts/AIStateContext/useAIState";

interface ConversationStateEditorProps {}

const ConversationStateEditor: React.FC<ConversationStateEditorProps> = () => {
  const { contentState, loadingState, spaceStatus } = useContentStateSession();
  const { aiState, aiStateStatus, autoExecute, setAutoExecute } = useAIState();

  const isLoading =
    Object.values(loadingState).includes(true) ||
    !aiState ||
    !aiStateStatus ||
    !spaceStatus?.valid;

  return (
    <Flex
      flexDirection="column"
      style={{
        paddingLeft: tokens.spacingL,
        paddingRight: tokens.spacingL,
        paddingTop: 0,
        paddingBottom: tokens.spacingM,
        minHeight: isLoading ? 200 : 0,
        position: "relative",
      }}
    >
      {isLoading ? (
        <LoadingIcon />
      ) : (
        <>
          {renderContextContent(aiState, aiStateStatus, contentState)}
          <Textarea
            value={aiStateStatus.userContent}
            placeholder={aiStateStatus.placeholder}
            rows={3}
            style={{
              marginBottom: tokens.spacingS,
            }}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              aiState.updateStatus({ userContent: event.target.value });
            }}
          />
          <Flex
            justifyContent="flex-end"
            alignItems="center"
            gap={tokens.spacing2Xs}
          >
            <Checkbox
              name="newsletter-subscribe-controlled"
              id="newsletter-subscribe-controlled"
              isChecked={autoExecute}
              onChange={() => {
                setAutoExecute((prevVal: boolean) => !prevVal);
              }}
            >
              auto-execute
            </Checkbox>
            <div style={{ flex: 1 }}></div>
            {aiStateStatus.isRunning ? <LoadingIcon /> : null}
            <Button
              onClick={() => {
                aiState.updateStatus({
                  userContent: "",
                  contextContentSelections: {},
                });
              }}
              variant="transparent"
            >
              Clear
            </Button>
            <Button
              startIcon={<icons.StarIcon />}
              onClick={() => aiState?.run(contentState, false, autoExecute)}
              variant="primary"
            >
              Ask
            </Button>
          </Flex>
        </>
      )}
      {aiStateStatus?.isRunning ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(255,255,255,.5)",
            zIndex: 1000,
          }}
        ></div>
      ) : null}
    </Flex>
  );
};

const renderContextContent = (
  aiState: AIState,
  aiStateStatus: AIStateStatus,
  contentState: ContentState
) => {
  const contextContent = aiState.promptEngine.contextContent(contentState);

  if (contextContent.length === 0) {
    return (
      <div
        key={`sentence-${aiState.key}`}
        style={{ padding: tokens.spacingXs }}
      ></div>
    );
  }
  return (
    <Flex alignItems="center" key={`sentence-${aiState.key}`}>
      <div
        style={{
          flex: 1,
          opacity: aiStateStatus.ignoreContextContent ? 0.2 : 1.0,
        }}
      >
        <Flex
          flexDirection="row"
          alignItems="baseline"
          flexWrap="wrap"
          style={{
            marginTop: tokens.spacingS,
            marginBottom: tokens.spacingS,
          }}
        >
          {renderContextContentRow(aiState, contextContent)}
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

const renderContextContentRow = (
  aiState: AIState,
  contextContent: AIStateContentPrefix,
  pathIndexes: { sentenceIndex: number; pathIndex: number }[] = []
): (JSX.Element | null)[] => {
  const output: (JSX.Element | null)[] = [];
  contextContent?.map((item, index) => {
    const key = `fragment-${[
      ...pathIndexes.map(
        (indexes) => `${indexes.sentenceIndex}-${indexes.pathIndex}`
      ),
      index,
    ].join("-")}`;

    if (typeof item === "string") {
      const words = item.split(" ");
      words.map((word, index) => {
        output.push(
          <span key={`${key}-${index}`} style={{ padding: `8px 0` }}>
            {word}&nbsp;
          </span>
        );
      });
      return;
    }

    const val =
      aiState.contextContentSelections[item.id] ||
      item.defaultValue ||
      (item.options[0] as any);
    let path, pathIndex;
    if (item.paths) {
      pathIndex = item.options.indexOf(val);
      pathIndex = pathIndex === -1 ? 0 : pathIndex;
      path = item.paths[pathIndex];
    }

    // select...
    output.push(
      <div key={key} style={{ padding: `${tokens.spacing2Xs} 0` }}>
        <Select
          value={val}
          onChange={(e) => {
            const val = e.target.value;
            aiState.updateStatus({
              contextContentSelections: {
                ...aiState.contextContentSelections,
                [item.id]: val,
              },
            });
          }}
        >
          {item.options.map((option, optionIndex) => {
            let name = `${option}`;
            if (item.labels && item.labels[optionIndex]) {
              name = `${item.labels[optionIndex]}`;
            }
            return (
              <Select.Option
                value={option as any}
                key={`${key}-${optionIndex}`}
              >
                {name}
              </Select.Option>
            );
          })}
        </Select>
      </div>
    );

    output.push(<div key={`${key}-space`} style={{ width: 6 }}></div>);

    if (path) {
      output.push(
        ...renderContextContentRow(aiState, path, [
          ...pathIndexes,
          { sentenceIndex: index, pathIndex: pathIndex! },
        ])
      );
    }
  });

  return output;
};

export default ConversationStateEditor;
