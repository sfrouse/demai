import tokens from "@contentful/f36-tokens";
import { Flex, Tabs } from "@contentful/f36-components";
import Divider from "../Divider";
import { useEffect, useRef } from "react";
import ConversationConfirm from "./ConversationConfirm";
import AIState from "../../ai/AIState/AIState";
import ConversationStateEditor from "./ConversationStateEditor";
import { AIStatePhase } from "../../ai/AIState/AIStateTypes";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import classNames from "../utils/classNames";
import useAIState from "../../contexts/AIStateContext/useAIState";
import ConversationBubble from "./ConversationBubble/ConversationBubble";

const ConversationPanel = () => {
  const { contentState, spaceStatus, loadingState } = useContentStateSession();
  const {
    aiState,
    aiSession,
    aiStateStatus,
    route,
    setRoute,
    findAndSetAISessionManager,
  } = useAIState();
  const chatLastBubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      chatLastBubbleRef.current?.scrollIntoView();
    }, 100);
  }, [aiSession]);

  useEffect(() => {
    setTimeout(() => {
      chatLastBubbleRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }, [aiStateStatus?.isRunning]);

  useEffect(() => {
    if (route && route.aiStateEngines.length > 0) {
      findAndSetAISessionManager(
        route.aiStateEngines[route.aiStateEngineFocus || 0],
        JSON.stringify(route)
      );
    }
  }, [route]);

  const isLoading =
    Object.values(loadingState).includes(true) || !spaceStatus?.valid;

  const useNav = route && route.aiStateEngines?.length > 1 && !isLoading;

  return (
    <Flex
      aria-label="Content Panel"
      flexDirection="column"
      style={{
        flex: 1,
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
        className={classNames(scrollBarStyles["scrollbar-minimal"])}
        style={{
          flex: 1,
          paddingTop: tokens.spacingL,
          // paddingLeft: tokens.spacingL,
          // paddingRight: tokens.spacingL,
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
          backgroundColor: isLoading ? tokens.gray100 : tokens.colorWhite,
        }}
      >
        {aiSession.map((aiState: AIState) => {
          return <ConversationBubble key={aiState.key} aiState={aiState} />;
        })}
        <div ref={chatLastBubbleRef}></div>
      </div>
      <Divider style={{ marginTop: 0, marginBottom: 0 }} />
      {useNav ? (
        <Flex flexDirection="column" justifyContent="flex-end">
          <Tabs
            currentTab={`${route?.aiStateEngineFocus}`}
            style={{
              marginLeft: tokens.spacingS,
            }}
            onTabChange={(tab: string) => {
              const index = parseInt(tab);
              setRoute({
                ...route,
                aiStateEngineFocus: index,
              });
            }}
          >
            <Tabs.List>
              {route?.aiStateEngines.map((engine, index) => (
                <Tabs.Tab panelId={`${index}`} key={`${index}`}>
                  {engineIDToSentence(engine)}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <Divider style={{ marginBottom: 0, marginTop: 0 }} />
        </Flex>
      ) : null}
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

function engineIDToSentence(kebab: string): string {
  return kebab
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/_/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
}

export default ConversationPanel;
