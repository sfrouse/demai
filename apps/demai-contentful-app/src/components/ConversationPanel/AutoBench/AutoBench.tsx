import { Button, Flex } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanel/ContentPanelHeader";
import * as icons from "@contentful/f36-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useAIState from "../../../contexts/AIStateContext/useAIState";
import tokens from "@contentful/f36-tokens";
import {
  AIChainOutput,
  AIStateChain,
} from "../../../ai/AIStateChain/AIStateChain";
import { AIPromptConfig } from "../../../ai/AIPromptEngine/AIPromptEngineTypes";
import { useContentStateSession } from "../../../contexts/ContentStateContext/ContentStateContext";
import ResearchAIChain from "../../../ai/AIStateChain/chains/ResearchAIChain";
import ContentSectionHeader from "../../ContentPanel/ContentSectionHeader/ContentSectionHeader";
import scrollBarStyles from "../../utils/ScrollBarMinimal.module.css";
import ContentfulAIChain from "../../../ai/AIStateChain/chains/ContentfulAIChain";
import { useError } from "../../../contexts/ErrorContext/ErrorContext";
import AutoBenchItem from "./components/AutoBenchItem";

const AutoBench = ({
  setShowWorkBench,
}: {
  setShowWorkBench: Dispatch<SetStateAction<boolean>>;
}) => {
  const { contentState } = useContentStateSession();
  const { route, aiStateConfig, setInvalidated } = useAIState();
  const [researchAIChain, setResearchAIChain] = useState<
    AIStateChain | undefined
  >();
  const [contentfulAIChain, setContentfulAIChain] = useState<
    ContentfulAIChain | undefined
  >();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [startTime, setStartTime] = useState<number>(0);
  const [runTimer, setRunTimer] = useState<boolean>(false);
  const [elaspedTime, setElaspedTime] = useState<number>();
  const [aiChainOutput, setAIChainOutput] = useState<
    AIChainOutput[] | undefined
  >();

  useEffect(() => {
    setResearchAIChain(
      new ResearchAIChain(
        setAIChainOutput,
        aiStateConfig as AIPromptConfig,
        setInvalidated
      )
    );
    setContentfulAIChain(
      new ContentfulAIChain(
        setAIChainOutput,
        aiStateConfig as AIPromptConfig,
        setInvalidated
      )
    );
  }, [route, setAIChainOutput, setResearchAIChain, setContentfulAIChain]);

  useEffect(() => {
    if (!runTimer) return;
    setElaspedTime(Date.now() - startTime);
    const interval = setInterval(() => {
      setElaspedTime(Date.now() - startTime);
    }, 500);
    return () => clearInterval(interval);
  }, [runTimer, startTime]);

  const startTimer = () => {
    setStartTime(Date.now());
    setRunTimer(true);
  };

  const stopTimer = () => {
    setRunTimer(false);
  };

  return (
    <>
      <ContentPanelHeader title="AutoBench">
        <Button
          startIcon={<icons.WorkflowsIcon />}
          variant="transparent"
          size="small"
          onClick={() => setShowWorkBench((prev) => !prev)}
        >
          Workbench
        </Button>
      </ContentPanelHeader>
      <Flex
        alignItems="center"
        flexDirection="column"
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <Flex
          alignItems="center"
          flexDirection="column"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            paddingTop: 60,
            paddingBottom: 60,
            width: "100%",
            height: "100%",
            gap: tokens.spacingL,
          }}
        >
          <Flex
            flexDirection="column"
            style={{ maxWidth: 300, width: "100%", gap: tokens.spacingL }}
          >
            <Button
              style={{ minWidth: "100%" }}
              variant="primary"
              isLoading={isLoading === "everything"}
              isDisabled={isLoading !== undefined && isLoading !== "everything"}
              onClick={async () => {
                startTimer();
                setIsLoading("everything");
                setAIChainOutput([]);
                await researchAIChain?.run(contentState, addError);
                await contentfulAIChain?.run(contentState, addError);
                setIsLoading(undefined);
                stopTimer();
              }}
            >
              Show Me the Money
            </Button>
            <Flex flexDirection="column" style={{ gap: 10 }}>
              <ContentSectionHeader title="Sections" />
              <Button
                style={{ minWidth: "100%" }}
                variant="secondary"
                isLoading={isLoading === "research"}
                isDisabled={isLoading !== undefined && isLoading !== "research"}
                onClick={async () => {
                  startTimer();
                  setIsLoading("research");
                  setAIChainOutput([]);
                  await researchAIChain?.run(contentState, addError);
                  setIsLoading(undefined);
                  stopTimer();
                }}
              >
                Build Research
              </Button>
              {/* <Button
                style={{ minWidth: "100%" }}
                variant="negative"
                isLoading={isLoading === "contentful-clear"}
                isDisabled={
                  isLoading !== undefined && isLoading !== "contentful-clear"
                }
                onClick={async () => {
                  const result = await sdk.dialogs.openConfirm({
                    title: "Deleting Generated Content",
                    message:
                      "Are you sure you want to delete all the DemAI generated content in this space? It can not be undone.",
                  });
                  if (result === true) {
                    setIsLoading("contentful-clear");
                    setAIChainOutput([]);
                    await contentfulAIChain?.clearGeneratedContent(addError);
                    setIsLoading(undefined);
                  }
                }}
              >
                Delete Generated Content
              </Button> */}
              <Button
                style={{ minWidth: "100%" }}
                variant="secondary"
                isLoading={isLoading === "contentful"}
                isDisabled={
                  isLoading !== undefined && isLoading !== "contentful"
                }
                onClick={async () => {
                  startTimer();
                  setIsLoading("contentful");
                  setAIChainOutput([]);
                  await contentfulAIChain?.run(contentState, addError);
                  setIsLoading(undefined);
                  stopTimer();
                }}
              >
                Build Contentful Space
              </Button>
              <Button
                style={{ minWidth: "100%" }}
                variant="secondary"
                isLoading={isLoading === "designSystem"}
                isDisabled={
                  true
                  //isLoading !== undefined && isLoading !== "designSystem"
                }
                onClick={async () => {
                  setAIChainOutput([]);
                }}
              >
                Build Design System
              </Button>
              <Button
                style={{ minWidth: "100%" }}
                variant="secondary"
                isDisabled={
                  true
                  //isLoading !== undefined && isLoading !== "pages"
                }
                onClick={async () => {
                  setAIChainOutput([]);
                }}
              >
                Build Pages
              </Button>
            </Flex>
          </Flex>
          <Flex
            flexDirection="column"
            className={scrollBarStyles["scrollbar-minimal"]}
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 300,
              overflow: "auto",
              gap: 2,
              backgroundColor: tokens.gray100,
              borderRadius: tokens.borderRadiusSmall,
              padding: 6,
              border: `1px solid ${tokens.gray200}`,
            }}
          >
            {aiChainOutput?.map((output) => (
              <AutoBenchItem output={output} key={output.key} />
            ))}
          </Flex>
          <Flex
            flexDirection="row"
            style={{ maxWidth: 300, width: "100%" }}
            alignItems="center"
          >
            <div style={{ flex: 1, color: tokens.gray500, fontSize: 12 }}>
              {elaspedTime ? `time: ${(elaspedTime / 1000).toFixed(0)}s` : null}
            </div>
            <Button
              variant="transparent"
              onClick={async () => {
                setElaspedTime(0);
                setAIChainOutput([]);
              }}
            >
              Clear
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default AutoBench;
