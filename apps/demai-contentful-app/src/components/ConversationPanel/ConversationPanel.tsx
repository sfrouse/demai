import tokens from "@contentful/f36-tokens";
import { Button, Flex, Tabs } from "@contentful/f36-components";
import Divider from "../Divider";
import { useEffect, useRef, useState } from "react";
import ConversationConfirm from "./ConversationConfirm";
import ConversationStateEditor from "./ConversationStateEditor";
import { AIStatePhase } from "../../ai/AIState/AIStateTypes";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import classNames from "../utils/classNames";
import useAIState from "../../contexts/AIStateContext/useAIState";
import ConversationBubble from "./ConversationBubble/ConversationBubble";
import ConversationToolbar from "./ConversationBubble/ConversationToolbar";
import * as icons from "@contentful/f36-icons";
import ContentPanelHeader from "../ContentPanel/ContentPanelHeader";
import AutoBench from "./AutoBench/AutoBench";
import { useError } from "../../contexts/ErrorContext/ErrorContext";
import LoadingStyles from "../Loading/LoadingStyles";

const ConversationPanel = () => {
  const { spaceStatus, loadingState, contentState } = useContentStateSession();
  const { aiState, aiSession, aiStateStatus, route, setRoute } = useAIState();
  const { addError } = useError();
  const [showWorkBench, setShowWorkBench] = useState<boolean>(false);
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
        maxWidth: 650, // Not Content Panel
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
      {!showWorkBench ? (
        <AutoBench setShowWorkBench={setShowWorkBench} />
      ) : (
        <>
          <ContentPanelHeader title="Workbench">
            <Button
              startIcon={<icons.DiamondIcon />}
              variant="transparent"
              size="small"
              onClick={() => setShowWorkBench((prev) => !prev)}
            >
              AutoBench
            </Button>
          </ContentPanelHeader>
          <div
            className={classNames(scrollBarStyles["scrollbar-minimal"])}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "scroll",
              ...LoadingStyles(isLoading),
            }}
          >
            {aiState && (
              <ConversationBubble key={aiState.key} aiState={aiState} />
            )}
            <div ref={chatLastBubbleRef}></div>
          </div>
          {aiState && <ConversationToolbar aiState={aiState} />}
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
                    aiState.reset();
                  }}
                  onConfirm={async () => {
                    await aiState?.run(contentState, addError);
                  }}
                  prompts={aiState?.promptEngine.prompts}
                  visible={aiStateStatus?.phase === AIStatePhase.describing}
                />
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
                    aiState.redo();
                  }}
                  onConfirm={async () => {
                    aiState.reset();
                  }}
                  prompts={{
                    cancel: "Let's try this again.",
                    run: "OK, Done.",
                    cancelIcon: icons.CycleIcon,
                    runIcon: icons.StarIcon,
                  }}
                  visible={aiStateStatus?.phase === AIStatePhase.executed}
                />
                <ConversationStateEditor />
              </>
            ) : null}
          </div>
        </>
      )}
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
