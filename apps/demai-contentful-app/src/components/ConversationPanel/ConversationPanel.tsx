import tokens from "@contentful/f36-tokens";
import { Flex } from "@contentful/f36-components";
import Divider from "../Divider";
import { useEffect, useRef } from "react";
import LoadingIcon from "../LoadingIcon";
import ConversationConfirm from "./ConversationConfirm";
import AIState from "../../ai/AIState/AIState";
import ConversationState from "./ConversationState";
import ConversationStateEditor from "./ConversationStateEditor";
import { AIStatePhase } from "../../ai/AIState/AIStateTypes";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import { useAIState } from "../../contexts/AIStateContext/AIStateContext";

const ConversationPanel = () => {
  const { contentState, spaceStatus } = useContentStateSession();
  const { aiState, aiSession, aiStateStatus } = useAIState();
  const chatLastBubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatLastBubbleRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiSession, aiStateStatus?.isRunning]);

  return (
    <Flex
      aria-label="Content Panel"
      flexDirection="column"
      style={{
        flex: 1.5,
        position: "relative",
      }}
    >
      {!spaceStatus?.valid ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 300,
            backgroundColor: "rgba(255,255,255, 0.5)",
          }}
        ></div>
      ) : null}
      <div
        style={{
          flex: 1,
          paddingTop: tokens.spacingL,
          paddingLeft: tokens.spacingL,
          paddingRight: tokens.spacingL,
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
        }}
      >
        {aiSession.map((aiState: AIState) => {
          return <ConversationState key={aiState.key} aiState={aiState} />;
        })}
        {aiStateStatus?.isRunning ? <LoadingIcon /> : null}
        <div ref={chatLastBubbleRef}></div>
      </div>
      <Divider />
      <div style={{ position: "relative" }}>
        {aiState && aiStateStatus ? (
          <>
            <ConversationConfirm
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                zIndex: 1000,
              }}
              onCancel={() => {
                aiState?.updateStatus({
                  phase: AIStatePhase.answered,
                  userContent: aiState.userContent,
                });
              }}
              onConfirm={() => {
                aiState?.run(contentState);
              }}
              prompts={aiStateStatus?.prompts}
              visible={aiStateStatus?.phase === AIStatePhase.describing}
            />
            <ConversationStateEditor />
          </>
        ) : null}
      </div>
    </Flex>
  );
};

export default ConversationPanel;
