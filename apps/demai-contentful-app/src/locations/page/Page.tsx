import React, { useEffect, useState } from "react";
import { Flex, Heading } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AppInstallationParameters } from "../config/ConfigScreen";
import tokens from "@contentful/f36-tokens";
import MainNav, { NAVIGATION } from "../../components/MainNav";
import ConversationPanel from "../../components/ConversationPanel/ConversationPanel";
import ContentPanel from "../../components/ContentPanel/ContentPanel";
import { AIStateConfig } from "../../ai/AIState/AIStateTypes";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import useAIState from "../../contexts/AIStateContext/useAIState";
import { createClient } from "contentful-management";
import LoadingIcon from "../../components/LoadingIcon";

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const { spaceStatus, validateSpace, setCPA } = useContentStateSession();
  const { setAIStateConfig, setRoute } = useAIState();
  const [configReady, setConfigReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      // find CPA for Context...
      const params = sdk.parameters.installation as AppInstallationParameters;
      const client = createClient({
        accessToken: params.cma,
      });
      const space = await client.getSpace(sdk.ids.space);
      const previewKeys = await space.getPreviewApiKeys();
      let cpaResult;
      if (
        previewKeys &&
        previewKeys.items &&
        previewKeys.items[0] &&
        previewKeys.items[0].accessToken
      ) {
        cpaResult = previewKeys.items[0].accessToken;
        setCPA(previewKeys.items[0].accessToken);
      } else {
        console.error("NO CPA KEY");
        sdk.dialogs.openAlert({
          title: "No CPA Key",
          message: "No CPA key found, please create an API key for the space.",
          confirmLabel: "OK",
        });
        return;
      }

      // Build and Save Config...pass on to AI State Context
      const newAIConfig: AIStateConfig = {
        cma: params.cma,
        openAiApiKey: params.openai,
        spaceId: sdk.ids.space,
        environmentId: sdk.ids.environment,
        cpa: cpaResult,
      };
      setAIStateConfig(newAIConfig);
      validateSpace();
      setRoute({
        navigation: "research",
        aiStateEngines: NAVIGATION["research"].aiStateEngines,
        aiStateEngineFocus: 0,
      });

      setConfigReady(true);
    })();
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
        {configReady === false ? (
          <Flex
            style={{ width: "100%", height: "100%" }}
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Heading
              style={{
                fontSize: tokens.fontSizeL,
              }}
            >
              DemAI
            </Heading>
            <LoadingIcon />
          </Flex>
        ) : (
          <>
            <MainNav />
            <ContentPanel />
            <ConversationPanel />
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Page;
