import React, { useEffect, useState } from "react";
import { Button, Flex, Text } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../locations/config/ConfigScreen";
import LoadingIcon from "../../LoadingIcon";
import getLatestTokens from "../../../ai/mcp/designSystemMCP/utils/getLatestTokens";
import Divider from "../../Divider";
import ContentPanelHeader from "../ContentPanelHeader";
import revertDemAITokensSingletonEntry from "../../../ai/mcp/designSystemMCP/contentTypes/tokenSingleton/revertDemAITokensSingletonEntry";

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
  const [tokens, setTokens] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const params = sdk.parameters.installation as AppInstallationParameters;
      const tokens = await getLatestTokens(
        params.cma,
        sdk.ids.space,
        sdk.ids.environment,
        "jsonNested"
      );
      setTokens(tokens);
      setIsLoading(false);
    })();
  }, [invalidated]);

  return (
    <>
      <ContentPanelHeader title="Design Tokens" invalidate={invalidate}>
        <Button
          variant="transparent"
          onClick={async () => {
            const userInput = await sdk.dialogs.openConfirm({
              title: "Confirm Revert",
              message:
                "Are you sure you want to revert all tokens back to original?",
              // defaultValue: "",
            });

            if (userInput !== null) {
              setIsLoading(true);
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
      </ContentPanelHeader>
      <Flex flexDirection="column" style={{ overflowY: "auto" }}>
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <Flex flexDirection="column">{renderTokens(tokens)}</Flex>
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
