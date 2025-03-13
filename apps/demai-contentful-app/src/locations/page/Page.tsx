import React, { useEffect, useState } from "react";
import { Flex } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AppInstallationParameters } from "../ConfigScreen";
import tokens from "@contentful/f36-tokens";
import PromptAreaNavList, {
  PromptAreas,
} from "../../components/PromptAreaNavList";
import ConversationPanel from "../../components/ConversationPanel/ConversationPanel";
import { MessageStackManager } from "../../ai/MessageStackManager/MessageStackManager";
import {
  AIActionConfig,
  AIActionPhase,
  AIActionState,
  AIMessage,
} from "../../ai/AIAction/AIActionTypes";
import { AIAction } from "../../ai/AIAction/AIAction";
import { CreateContentTypeAIAction } from "../../ai/AIAction/actions/CreateContentTypeAIAction";
import ContentPanel from "../../components/ContentPanel/ContentPanel";

export enum PROMPT_AREAS {
  research = "research",
  content_model = "content_model",
  entries = "entries",
}

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const [navFocus, setNavFocus] = useState<PromptAreas>("research");

  // we will have a stack for each of the contexts...sessions
  const [messageStackManager, setMessageStackManager] =
    useState<MessageStackManager>();
  const [messageStack, setMessageStack] = useState<AIMessage[]>([]);
  const [aiAction, setAIAction] = useState<AIAction>();
  const [aiActionState, setAIActionState] = useState<
    AIActionState | undefined
  >();
  const [aiActionConfig, setAIActionConfig] = useState<AIActionConfig>();
  const [invalidated, setInvalidated] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const params = sdk.parameters.installation as AppInstallationParameters;

      // v1
      // const promptSession = new PromptSession(
      //   setState as any, // it's a circular typing that's failing, just ignore this..
      //   await createContentType(),
      //   params.cma,
      //   params.openai,
      //   sdk.ids.space,
      //   sdk.ids.environment
      // );
      // setPromptSession(promptSession);

      // v2
      // const tmpChat = new CreateCTypeChatSession(setChatState, {
      //   cma: params.cma,
      //   openAiApiKey: params.openai,
      //   spaceId: sdk.ids.space,
      //   environmentId: sdk.ids.environment,
      // });
      // setChatSession(tmpChat);
      // setChatSessions([tmpChat]);

      // v3
      const newMessageStackManager = new MessageStackManager(setMessageStack);
      setMessageStackManager(newMessageStackManager);
      const newAIActionConfig: AIActionConfig = {
        cma: params.cma,
        openAiApiKey: params.openai,
        spaceId: sdk.ids.space,
        environmentId: sdk.ids.environment,
      };
      const aiAction = new CreateContentTypeAIAction(
        setAIActionState,
        newAIActionConfig,
        newMessageStackManager,
        () => setInvalidated((prev) => prev + 1)
      );
      aiAction.initialize();
      setAIActionConfig(newAIActionConfig);
      setAIAction(aiAction);
    })();
  }, []);

  useEffect(() => {
    if (
      aiActionState?.phase === AIActionPhase.done &&
      aiActionConfig &&
      messageStackManager
    ) {
      const aiAction = new CreateContentTypeAIAction(
        setAIActionState,
        aiActionConfig,
        messageStackManager,
        () => setInvalidated((prev) => prev + 1)
      );
      aiAction.initialize("Great, should we try another?");
      setAIAction(aiAction);
    }
  }, [invalidated]);

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
        <PromptAreaNavList navFocus={navFocus} setNavFocus={setNavFocus} />
        <ContentPanel
          navFocus={navFocus}
          sdk={sdk}
          aiActionState={aiActionState}
          invalidated={invalidated}
        />
        <ConversationPanel
          aiAction={aiAction}
          aiActionState={aiActionState}
          messageStack={messageStack}
        />
      </Flex>
    </Flex>
  );
};

export default Page;
