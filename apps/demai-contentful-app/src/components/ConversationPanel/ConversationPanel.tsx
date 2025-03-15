import tokens from "@contentful/f36-tokens";
import { Flex, Heading } from "@contentful/f36-components";
import Divider from "../Divider";
import { useEffect, useRef } from "react";
import LoadingIcon from "../LoadingIcon";
import {
  AIActionPhase,
  AIActionState,
  AIMessage,
} from "../../ai/AIAction/AIActionTypes";
import { AIAction } from "../../ai/AIAction/AIAction";
import ConversationBubble from "./bubbles/ConversationBubble";
import ConversationInput from "./ConversationInput";
import ConversationConfirm from "./ConversationConfirm";
import AIState from "../../ai/AIState/AIState";
import ConversationState from "./bubbles/ConversationState";
import ConversationStateEditor from "./ConversationStateEditor";
import { AIStatePhase, AIStateStatus } from "../../ai/AIState/AIStateTypes";

interface ConversationPanelProps {
  messageStack: AIMessage[];
  aiAction: AIAction | undefined;
  aiActionState: AIActionState | undefined;
  aiSession: AIState[];
  aiState: AIState | undefined;
  aiStateStatus: AIStateStatus | undefined;
}

const ConversationPanel = ({
  messageStack,
  aiAction,
  aiActionState,
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
  }, [messageStack, aiActionState?.isRunning]);

  return (
    <Flex
      aria-label="Content Panel"
      flexDirection="column"
      style={{
        flex: 1.5,
      }}
    >
      {/* <Flex
        flexDirection="column"
        style={{
          paddingLeft: tokens.spacingL,
          paddingRight: tokens.spacingL,
          paddingTop: tokens.spacingM,
          paddingBottom: 0,
        }}
      >
        <Flex
          flexDirection="row"
          style={{
            alignItems: "baseline",
          }}
        >
          <Heading style={{ marginBottom: tokens.spacingS, flex: 1 }}>
            Content Type
          </Heading>
          <Tabs>
            <Tabs.List>
              <Tabs.Tab panelId="first">First</Tabs.Tab>
              <Tabs.Tab panelId="second">Second</Tabs.Tab>
              <Tabs.Tab panelId="third">Third</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Flex>
        <Divider style={{ marginTop: 0, marginBottom: 0 }} />
      </Flex> */}
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
              onCancel={() => console.log("not sure yet...")}
              onConfirm={() => aiState?.run()}
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
