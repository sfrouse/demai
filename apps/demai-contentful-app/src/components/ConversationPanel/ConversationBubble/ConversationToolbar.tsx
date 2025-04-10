import { Flex } from "@contentful/f36-components";
import AIState from "../../../ai/AIState/AIState";
import { AIStatePhase } from "../../../ai/AIState/AIStateTypes";
import {
  ContentState,
  useContentStateSession,
} from "../../../contexts/ContentStateContext/ContentStateContext";
import ButtonXs from "../../ButtonXs/ButtonXs";
import tokens from "@contentful/f36-tokens";
import LoadingIcon from "../../Loading/LoadingIcon";
import { DoneIcon, IconVariant } from "@contentful/f36-icons";
import Divider from "../../Divider";

const ConversationToolbar = ({ aiState }: { aiState: AIState }) => {
  const { contentState } = useContentStateSession();

  let bgColor = tokens.gray100;
  let foreColor = tokens.gray800;
  let iconVariant: IconVariant = "muted";

  switch (aiState.status.phase) {
    case AIStatePhase.describing: {
      bgColor = aiState.status.isRunning ? tokens.green100 : tokens.blue100;
      break;
    }
    case AIStatePhase.executing: {
      bgColor = tokens.green100;
      break;
    }
    case AIStatePhase.answered: {
      bgColor = tokens.orange100;
      break;
    }
    case AIStatePhase.executed: {
      bgColor =
        aiState.status.errors.length > 0 ? tokens.colorWarning : tokens.gray500;
      foreColor = tokens.colorWhite;
      iconVariant = "white";
      break;
    }
  }

  return (
    <div>
      <Flex
        flexDirection="row"
        alignContent="center"
        style={{
          backgroundColor: bgColor,
          color: foreColor,
          padding: `${tokens.spacingM} ${tokens.spacingL}`,
          height: 54,
        }}
      >
        {getStats(aiState, foreColor, iconVariant)}
        <div style={{ flex: 1, minWidth: 30 }}></div>
        {/* <ButtonXs
          style={{
            color: foreColor,
          }}
          onClick={() => {
            aiSessionManager?.deleteAIState(aiState);
          }}
        >
          Delete
        </ButtonXs> */}
        {/* <ButtonXs
          style={{
            color: foreColor,
          }}
          onClick={() => {
            setShowSystem((val: boolean) => !val);
          }}
        >
          System
        </ButtonXs> */}
        {!aiState.status.isRunning &&
          getAction(aiState, contentState, foreColor)}
      </Flex>
      <Divider style={{ margin: 0 }} />
    </div>
  );
};

const getStats = (
  aiState: AIState,
  foreColor: string,
  iconVariant: IconVariant
) => {
  return (
    <Flex
      style={{
        color: foreColor,
        font: tokens.fontStackPrimary,
        fontSize: 10,
      }}
      flexDirection="row"
      alignItems="center"
      gap={tokens.spacing2Xs}
    >
      {aiState.status.isRunning ? (
        <LoadingIcon />
      ) : (
        <DoneIcon variant={iconVariant} />
      )}
      <span>
        {aiState.promptEngineId}, "{aiState.status.phase}",{" "}
        {aiState.status.isRunning ? "running" : "stopped"}
        {aiState.suggestionRunTime &&
          `, ${(aiState.suggestionRunTime / 1000).toFixed(2)}s`}
        {aiState.executeRunTime &&
          ` / ${(aiState.executeRunTime / 1000).toFixed(2)}s`}
      </span>
    </Flex>
  );
};

const getAction = (
  aiState: AIState,
  contentState: ContentState,
  foreColor: string
) => {
  switch (aiState.status.phase) {
    case AIStatePhase.executing:
      return null;

    // case AIStatePhase.executed:
    //   return (
    //     <ButtonXs
    //       style={{
    //         color: foreColor,
    //       }}
    //       onClick={async () => {
    //         await aiState.run(contentState, true);
    //       }}
    //     >
    //       Try Again
    //     </ButtonXs>
    //   );

    // case AIStatePhase.describing:
    //   return (
    //     <ButtonXs
    //       style={{
    //         color: foreColor,
    //       }}
    //       onClick={async () => {
    //         await aiState.run(contentState);
    //       }}
    //     >
    //       Create
    //     </ButtonXs>
    //   );

    case AIStatePhase.prompting:
      return null;

    // case AIStatePhase.answered:
    //   return (
    //     <ButtonXs
    //       style={{
    //         color: foreColor,
    //       }}
    //       onClick={async () => {
    //         await aiState.run(contentState);
    //       }}
    //     >
    //       Try Again
    //     </ButtonXs>
    //   );

    default:
      return null;
  }
};

export default ConversationToolbar;
