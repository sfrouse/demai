import tokens from "@contentful/f36-tokens";
import { Flex } from "@contentful/f36-components";
import Divider from "../Divider";
import { useEffect, useRef } from "react";
import LoadingIcon from "../LoadingIcon";
import ConversationConfirm from "./ConversationConfirm";
import AIState from "../../ai/AIState/AIState";
import ConversationState from "./ConversationState";
import ConversationStateEditor from "./ConversationStateEditor";
import { AIStatePhase, AIStateStatus } from "../../ai/AIState/AIStateTypes";

interface ConversationPanelProps {
  aiSession: AIState[];
  aiState: AIState | undefined;
  aiStateStatus: AIStateStatus | undefined;
}

const ConversationPanel = ({
  aiSession,
  aiState,
  aiStateStatus,
}: ConversationPanelProps) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      const lastChild = chatRef.current.lastElementChild as HTMLElement;
      lastChild?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiSession, aiStateStatus?.isRunning]);

  return (
    <Flex
      aria-label="Content Panel"
      flexDirection="column"
      style={{
        flex: 1.5,
      }}
    >
      <div
        ref={chatRef}
        style={{
          flex: 1,
          paddingTop: tokens.spacingL,
          paddingLeft: tokens.spacingL,
          paddingRight: tokens.spacingL,
          // paddingBottom: 100,
          display: "flex",
          flexDirection: "column",
          // justifyContent: "flex-end",
          overflowY: "scroll",
        }}
      >
        {aiSession.map((aiState: AIState) => {
          return <ConversationState key={aiState.key} aiState={aiState} />;
        })}
        {aiStateStatus?.isRunning ? <LoadingIcon /> : null}
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
                aiState?.run();
              }}
              prompts={aiStateStatus?.prompts}
              visible={aiStateStatus?.phase === AIStatePhase.describing}
            />
            <ConversationStateEditor
              aiState={aiState}
              aiStateStatus={aiStateStatus}
            />
          </>
        ) : null}
      </div>
    </Flex>
  );
};

export default ConversationPanel;
