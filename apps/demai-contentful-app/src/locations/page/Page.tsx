import React, { useEffect, useState } from "react";
import { Flex } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AppInstallationParameters } from "../config/ConfigScreen";
import tokens from "@contentful/f36-tokens";
import PromptAreaNavList, {
  NAVIGATION,
  PromptAreas,
} from "../../components/PromptAreaNavList";
import ConversationPanel from "../../components/ConversationPanel/ConversationPanel";
import ContentPanel from "../../components/ContentPanel/ContentPanel";
import AIState from "../../ai/AIState/AIState";
import { AIStateConfig, AIStateStatus } from "../../ai/AIState/AIStateTypes";
import AISessionManager from "../../ai/AIState/AISessionManager";
import findAISessionManager from "./utils/findAISessionManager";
import validateDemAIContentModel from "../../ai/mcp/designSystemMCP/contentTypes/validateDemAIContentModel";

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const [navFocus, setNavFocus] = useState<PromptAreas>("settings");
  const [invalidated, setInvalidated] = useState<number>(0);
  const [spaceIsValid, setSpaceIsValid] = useState<boolean>(true);

  // v4
  const [aiStateConfig, setAIStateConfig] = useState<AIStateConfig>();
  const [aiState, setAIState] = useState<AIState>();
  const [aiStateStatus, setAIStateStatus] = useState<AIStateStatus>();
  const [, setAISessionManager] = useState<AISessionManager>();
  const [aiSession, setAISession] = useState<AIState[]>([]);

  useEffect(() => {
    (async () => {
      const params = sdk.parameters.installation as AppInstallationParameters;
      const newAIConfig: AIStateConfig = {
        cma: params.cma,
        openAiApiKey: params.openai,
        spaceId: sdk.ids.space,
        environmentId: sdk.ids.environment,
      };
      setAIStateConfig(newAIConfig);

      const isValid = await validateDemAIContentModel(
        params.cma,
        sdk.ids.space,
        sdk.ids.environment
      );
      setSpaceIsValid(isValid.valid);
      if (isValid.valid === false) {
        setNavFocus("settings");
      }

      setInvalidated((prev) => prev + 1);
    })();
  }, []);

  // Navigation was changed...
  useEffect(() => {
    if (aiStateConfig) {
      const nav = NAVIGATION[navFocus];
      const newAIStackManager = findAISessionManager(
        nav.aiStateEngine,
        setAISession,
        setAIState
      );
      setAISessionManager(newAIStackManager);
      let newFocusedAIState = newAIStackManager.getLastState();
      if (!newFocusedAIState) {
        const newAIState = new AIState(
          newAIStackManager,
          aiStateConfig,
          setAIStateStatus,
          nav.aiStateEngine,
          () => setInvalidated((prev) => prev + 1),
          true
        );
        newAIStackManager.addAndActivateAIState(newAIState);
      } else {
        newAIStackManager.refreshState();
        setAIState(newFocusedAIState);
        newFocusedAIState.refreshState();
      }
    }
  }, [navFocus, aiStateConfig]);

  return (
    <Flex
      flexDirection="row"
      style={{
        width: "100vw",
        height: "100vh",
        boxSizing: "border-box",
      }}
      alignItems="stretch"
    >
      <Flex
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          boxShadow:
            "rgba(25, 37, 50, 0.1) 0px 6px 16px -2px, rgba(25, 37, 50, 0.15) 0px 3px 6px -3px",
          boxSizing: "border-box",
          backgroundColor: tokens.colorWhite,
          marginLeft: tokens.spacingM,
          marginRight: tokens.spacingL,
        }}
      >
        <PromptAreaNavList
          navFocus={navFocus}
          setNavFocus={setNavFocus}
          spaceIsValid={spaceIsValid}
        />
        <ContentPanel
          navFocus={navFocus}
          sdk={sdk}
          invalidated={invalidated}
          invalidate={() => setInvalidated((prev) => prev + 1)}
          setSpaceIsValid={setSpaceIsValid}
        />
        <ConversationPanel
          aiSession={aiSession}
          aiState={aiState}
          aiStateStatus={aiStateStatus}
          spaceIsValid={spaceIsValid}
        />
      </Flex>
    </Flex>
  );
};

export default Page;
