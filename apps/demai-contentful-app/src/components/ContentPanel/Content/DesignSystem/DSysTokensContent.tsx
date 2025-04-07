import React, { useEffect, useState } from "react";
import { Button, Flex, IconButton, Text } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import * as icons from "@contentful/f36-icons";
import { AppInstallationParameters } from "../../../../locations/config/ConfigScreen";
import ContentPanelHeader from "../../ContentPanelHeader";
import revertDemAITokensSingletonEntry from "../../../../ai/mcp/designSystemMCP/functions/utils/demaiTokensSingleton/revertDemAITokensSingletonEntry";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import tokens from "@contentful/f36-tokens";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../../../../ai/mcp/designSystemMCP/validate/ctypes/demaiTokensCType";
import LoadingPage from "../../../Loading/LoadingPage";
import ContentSectionHeader from "../../ContentSectionHeader/ContentSectionHeader";
import ColorTokensContent from "./sections/ColorTokensContent";
import TypographyTokensContent from "./sections/TypographyTokensContent";
import IframeWithReact from "./IframeWithReact";

export const COLOR_SET_ALLOW_LIST = [
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "warning",
];

export const COLOR_SINGLE_ALLOW_LIST = ["white", "black", "success", "danger"];

export const COLOR_ALLOW_LIST = [
  ...COLOR_SET_ALLOW_LIST,
  ...COLOR_SINGLE_ALLOW_LIST,
];

const DSysTokensContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadProperty, loadingState } = useContentStateSession();

  const { invalidated, setInvalidated } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.tokens || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("tokens", forceReload);
    }
    if (!contentState.css || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("css", forceReload);
    }
  }, [invalidated]);

  const isLoading = loadingState.tokens === true;
  return (
    <>
      <ContentPanelHeader title="Design Tokens" invalidate>
        <Button
          variant="transparent"
          size="small"
          onClick={async () => {
            const userInput = await sdk.dialogs.openConfirm({
              title: "Confirm Revert",
              message:
                "Are you sure you want to revert all tokens back to original?",
              // defaultValue: "",
            });

            if (userInput !== null) {
              const params = sdk.parameters
                .installation as AppInstallationParameters;
              await revertDemAITokensSingletonEntry(
                params.cma,
                sdk.ids.space,
                sdk.ids.environment
              );
              setInvalidated((p) => p + 1);
            }
          }}
        >
          Revert
        </Button>
        <IconButton
          variant="transparent"
          aria-label="Open"
          size="small"
          onClick={async () => {
            await sdk.navigator.openEntry(DEMAI_TOKENS_SINGLETON_ENTRY_ID, {
              slideIn: true,
            });
          }}
          icon={<icons.EditIcon />}
        />
      </ContentPanelHeader>
      <Flex
        flexDirection="column"
        style={{
          // overflowY: "auto",
          // padding: `${tokens.spacingM} ${tokens.spacingL}`,
          flex: 1,
          position: "relative",
        }}
      >
        {isLoading ? (
          <LoadingPage />
        ) : (
          <IframeWithReact>
            <style
              dangerouslySetInnerHTML={{ __html: `${contentState.css}` || "" }}
            ></style>
            <Flex
              flexDirection="column"
              gap={tokens.spacingL}
              alignItems="center"
              style={{ padding: `${tokens.spacingM} ${tokens.spacingL}` }}
            >
              <Flex
                flexDirection="column"
                style={{ maxWidth: 800, width: "100%" }}
              >
                <Flex
                  flexDirection="column"
                  style={{ marginBottom: tokens.spacingL }}
                >
                  <ContentSectionHeader title="Color" />
                  <ColorTokensContent dsysTokens={contentState.tokens} />
                </Flex>
                <Flex
                  flexDirection="column"
                  style={{ marginBottom: tokens.spacingL }}
                >
                  <ContentSectionHeader title="Typography" />
                  <TypographyTokensContent dsysTokens={contentState.tokens} />
                </Flex>
                <ContentSectionHeader title="Spacing (Padding, Margin, Gap)" />
                <ContentSectionHeader title="Page Widths" />
                <ContentSectionHeader title="Border Radius" />
                <ContentSectionHeader title="Icons" />
              </Flex>
            </Flex>
          </IframeWithReact>
        )}
      </Flex>
    </>
  );
};

export default DSysTokensContent;
