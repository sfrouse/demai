import React, { useEffect } from "react";
import { Flex } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AppInstallationParameters } from "../config/ConfigScreen";
import tokens from "@contentful/f36-tokens";
import MainNav, { NAVIGATION } from "../../components/MainNav";
import ConversationPanel from "../../components/ConversationPanel/ConversationPanel";
import ContentPanel from "../../components/ContentPanel/ContentPanel";
import { AIStateConfig } from "../../ai/AIState/AIStateTypes";
import { useAIState } from "../../contexts/AIStateContext/AIStateContext";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const { spaceStatus, validateSpace } = useContentStateSession();
  const { setAIStateConfig, setRoute } = useAIState();

  useEffect(() => {
    // Save Config
    const params = sdk.parameters.installation as AppInstallationParameters;
    const newAIConfig: AIStateConfig = {
      cma: params.cma,
      openAiApiKey: params.openai,
      spaceId: sdk.ids.space,
      environmentId: sdk.ids.environment,
    };
    setAIStateConfig(newAIConfig);
    validateSpace();
    setRoute({
      navigation: "content_model",
      aiStateEngines: NAVIGATION["content_model"].aiStateEngines,
      aiStateEngineFocus: 0,
    });
  }, []);

  useEffect(() => {
    if (spaceStatus?.valid === false) {
      setRoute({
        navigation: "space",
        aiStateEngines: NAVIGATION["space"].aiStateEngines,
      });
    }
  }, [spaceStatus]);

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
        <MainNav />
        <ContentPanel />
        <ConversationPanel />
      </Flex>
    </Flex>
  );
};

export default Page;
