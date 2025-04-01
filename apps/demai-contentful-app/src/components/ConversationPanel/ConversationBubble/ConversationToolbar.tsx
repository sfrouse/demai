import { Flex } from "@contentful/f36-components";
import AIState from "../../../ai/AIState/AIState";
import { AIStatePhase } from "../../../ai/AIState/AIStateTypes";
import {
  ContentState,
  useContentStateSession,
} from "../../../contexts/ContentStateContext/ContentStateContext";
import ButtonXs from "../../ButtonXs/ButtonXs";
import tokens from "@contentful/f36-tokens";
import LoadingIcon from "../../LoadingIcon";
import { DoneIcon } from "@contentful/f36-icons";
import Divider from "../../Divider";
import { Dispatch, SetStateAction } from "react";
import useAIState from "../../../contexts/AIStateContext/useAIState";

const ConversationToolbar = ({
  aiState,
  setShowSystem,
}: {
  aiState: AIState;
  setShowSystem: Dispatch<SetStateAction<boolean>>;
}) => {
  const { contentState } = useContentStateSession();
  const { aiSessionManager } = useAIState();

  const bgColor = aiState.isRunning
    ? tokens.blue100
    : aiState.phase === AIStatePhase.executed
    ? tokens.gray100
    : aiState.phase === AIStatePhase.answered
    ? tokens.gray100
    : tokens.green100;

  return (
    <div>
      <Flex
        flexDirection="row"
        alignContent="center"
        style={{
          backgroundColor: bgColor,
          padding: `${tokens.spacingM} ${tokens.spacingL}`,
          // borderRadius: `0 0 ${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium}`,
        }}
      >
        {getStats(aiState)}
        <div style={{ flex: 1, minWidth: 30 }}></div>
        <ButtonXs
          onClick={() => {
            aiSessionManager?.deleteAIState(aiState);
          }}
        >
          Delete
        </ButtonXs>
        <ButtonXs
          onClick={() => {
            setShowSystem((val: boolean) => !val);
          }}
        >
          System
        </ButtonXs>
        {!aiState.isRunning && getAction(aiState, contentState)}
      </Flex>
      <Divider style={{ margin: 0 }} />
    </div>
  );
};

const getStats = (aiState: AIState) => {
  return (
    <Flex
      style={{
        color: tokens.gray400,
        font: tokens.fontStackPrimary,
        fontSize: 10,
      }}
      flexDirection="row"
      alignItems="center"
      gap={tokens.spacing2Xs}
    >
      {aiState.isRunning ? <LoadingIcon /> : <DoneIcon variant="muted" />}
      <span>
        {aiState.promptEngineId}, "{aiState.phase}",{" "}
        {aiState.isRunning ? "running" : "stopped"}
        {aiState.suggestionRunTime &&
          `, ${(aiState.suggestionRunTime / 1000).toFixed(2)}s`}
        {aiState.executeRunTime &&
          ` / ${(aiState.executeRunTime / 1000).toFixed(2)}s`}
      </span>
    </Flex>
  );
};

const getAction = (aiState: AIState, contentState: ContentState) => {
  switch (aiState.phase) {
    case AIStatePhase.executing:
      return null;

    case AIStatePhase.executed:
      return (
        <ButtonXs
          onClick={async () => {
            await aiState.run(contentState, true);
          }}
        >
          Re-Execute
        </ButtonXs>
      );

    case AIStatePhase.describing:
      return (
        <ButtonXs
          onClick={async () => {
            await aiState.run(contentState);
          }}
        >
          Execute
        </ButtonXs>
      );

    case AIStatePhase.prompting:
      return null;

    default:
      return null;
  }
};

export default ConversationToolbar;
