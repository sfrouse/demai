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
import AIState from "../../ai/AIState/AIState";
import {
  ContentState,
  useContentStateSession,
} from "../../contexts/ContentStateContext/ContentStateContext";
import LoadingIcon from "../Loading/LoadingIcon";
import useAIState from "../../contexts/AIStateContext/useAIState";
import LoadingPage from "../Loading/LoadingPage";
import {
  AIPromptContentPrefix,
  AIPromptEngineID,
} from "../../ai/AIPromptEngine/AIPromptEngineTypes";
import { useError } from "../../contexts/ErrorContext/ErrorContext";
import LoadingStyles from "../Loading/LoadingStyles";

interface ConversationStateEditorProps {}

const ConversationStateEditor: React.FC<ConversationStateEditorProps> = () => {
  const { contentState, loadingState, spaceStatus } = useContentStateSession();
  const {
    aiState,
    aiStateStatus,
    autoExecute,
    setAutoExecute,
    ignoreContextContent,
    setIgnoreContextContent,
  } = useAIState();
  const { addError } = useError();
  const isLoading = Object.values(loadingState).includes(true);

  const isReady = !aiState || !aiStateStatus || !spaceStatus?.valid;

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
        ...LoadingStyles(isLoading),
      }}
    >
      {isReady ? (
        <LoadingPage />
      ) : (
        <>
          {renderContextContent(
            aiState,
            contentState,
            ignoreContextContent,
            setIgnoreContextContent
          )}
          <Textarea
            value={aiStateStatus.userContent}
            placeholder={aiState.promptEngine.placeholder}
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
            {aiState.promptEngineId !== AIPromptEngineID.OPEN && (
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
            )}

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
              onClick={() =>
                aiState?.run(
                  contentState,
                  addError,
                  false,
                  autoExecute,
                  ignoreContextContent
                )
              }
              variant="primary"
            >
              Ask
            </Button>
          </Flex>
        </>
      )}
      {aiStateStatus?.isRunning ? <LoadingPage /> : null}
    </Flex>
  );
};

const renderContextContent = (
  aiState: AIState,
  contentState: ContentState,
  ignoreContextContent: boolean,
  setIgnoreContextContent: React.Dispatch<React.SetStateAction<boolean>>
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
          opacity: ignoreContextContent ? 0.2 : 1.0,
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
          ignoreContextContent ? (
            <icons.PreviewOffIcon />
          ) : (
            <icons.PreviewIcon />
          )
        }
        aria-label="Ignore Execution "
        onClick={() => {
          setIgnoreContextContent((prevVal) => !prevVal);
        }}
      />
    </Flex>
  );
};

const renderContextContentRow = (
  aiState: AIState,
  contextContent: AIPromptContentPrefix,
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

    if (item === "[BREAK]") {
      output.push(<div style={{ width: "100%" }} key={key} />);
      return;
    }

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
      aiState.status.contextContentSelections[item.id] ||
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
                ...aiState.status.contextContentSelections,
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
