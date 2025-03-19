import React, { useEffect, useState } from "react";
import { Button, Flex, IconButton, Text } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import * as icons from "@contentful/f36-icons";
import { AppInstallationParameters } from "../../../locations/config/ConfigScreen";
import LoadingIcon from "../../LoadingIcon";
import Divider from "../../Divider";
import ContentPanelHeader from "../ContentPanelHeader";
import revertDemAITokensSingletonEntry from "../../../ai/mcp/designSystemMCP/contentTypes/tokenSingleton/revertDemAITokensSingletonEntry";
import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../../../ai/mcp/designSystemMCP/contentTypes/demaiTokensCType";
import { useContentStateSession } from "../../../contexts/ContentStateContext/ContentStateContext";

interface ContentTypesProps {
  sdk: PageAppSDK;
  invalidated: number; // increments after CTF content update
  invalidate: () => void;
}

export const COLOR_SET_ALLOW_LIST = [
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "warning",
];

export const COLOR_SINGLE_ALLOW_LIST = ["white", "black", "success", "danger"];

export const COLOR_ALLOW_LIST = [
  ...COLOR_SINGLE_ALLOW_LIST,
  ...COLOR_SET_ALLOW_LIST,
];

const DSysTokensContent: React.FC<ContentTypesProps> = ({
  sdk,
  invalidated,
  invalidate,
}) => {
  const { contentState, loadProperty, loadingState } = useContentStateSession();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.tokens || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("tokens", forceReload);
    }
  }, [invalidated]);

  const isLoading = loadingState.tokens === true;
  return (
    <>
      <ContentPanelHeader title="Design Tokens" invalidate={invalidate}>
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
              invalidate();
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
      <Flex flexDirection="column" style={{ overflowY: "auto" }}>
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <Flex flexDirection="column">
            {renderTokens(contentState.tokens)}
          </Flex>
        )}
      </Flex>
    </>
  );
};

function renderTokens(tokens: any) {
  const output: any[] = [];
  if (tokens && tokens.color) {
    Object.entries(tokens.color).map((colorSet) => {
      renderColorSet(colorSet[0], colorSet[1], output);
    });
  }
  return output;
}

function renderColorSet(name: string, colorSet: any, output: any[]) {
  if (!COLOR_ALLOW_LIST.includes(name)) return;
  if (typeof colorSet === "string") {
    output.push(
      <Flex flexDirection="column" gap="4px" key={`color-token-${name}`}>
        <Text
          fontSize="fontSizeM"
          fontWeight="fontWeightDemiBold"
          style={{ flex: 1 }}
        >
          {name}
        </Text>
        <Flex>{renderChip(name, colorSet)}</Flex>
        <Divider />
      </Flex>
    );
    return;
  }
  output.push(
    <Flex flexDirection="column" gap="4px" key={`color-token-${name}`}>
      <Text
        fontSize="fontSizeM"
        fontWeight="fontWeightDemiBold"
        style={{ flex: 1 }}
      >
        {name}
      </Text>
      <Flex flexDirection="row" gap="6px">
        {Object.entries(colorSet).map((set) =>
          renderChip(`${name}-${set[0]}`, set[1] as string)
        )}
      </Flex>
      <Divider />
    </Flex>
  );
}

function renderChip(name: string, colorHex: string) {
  if (typeof colorHex !== "string") return;
  return (
    <div
      title={`${name}: ${colorHex}`}
      key={`color-token-${name}-${colorHex}`}
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: colorHex,
        border: "1px solid #aaa",
      }}
    ></div>
  );
}

export default DSysTokensContent;
