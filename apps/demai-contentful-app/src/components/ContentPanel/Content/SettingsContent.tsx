import React, { useEffect, useState } from "react";
import { Button, Flex, Text } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../locations/config/ConfigScreen";
import ContentPanelHeader from "../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../contexts/ContentStateContext/ContentStateContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import updateDesignSystemMCP from "../../../ai/mcp/designSystemMCP/validate/updateDesignSystemMCP";
import { IMCPClientValidation } from "../../../ai/mcp/MCPClient";
import updateResearchMCP from "../../../ai/mcp/researchMCP/validate/updateResearchMCP";
import LoadingIcon from "../../Loading/LoadingIcon";
import { CONTENT_PANEL_MAX_WIDTH_SMALL } from "../../../constants";
import scrollBarStyles from "../../utils/ScrollBarMinimal.module.css";
import LoadingStyles from "../../Loading/LoadingStyles";
import ContentfulAIChain from "../../../ai/AIStateChain/chains/ContentfulAIChain";
import { useError } from "../../../contexts/ErrorContext/ErrorContext";
import useAIState from "../../../contexts/AIStateContext/useAIState";
import { AIPromptConfig } from "../../../ai/AIPromptEngine/AIPromptEngineTypes";
import { deleteAllPreviewAccessKey } from "../../../locations/page/utils/getPreviewAccessKey";

function generateErrorMessage(
  validationResult: IMCPClientValidation
): (string | null)[] {
  const issues = Object.entries(validationResult.details || {})
    .filter(([key, value]) => typeof value === "object")
    .map(([key, value]) => {
      if (!value.exists) {
        return `The "${key}" is missing.`;
      }
      if (!value.fieldsValid) {
        return `The "${key}" has invalid fields.`;
      }
      return null;
    })
    .filter(Boolean);
  console.log("validationResult", validationResult);
  return issues.length > 0 ? issues : ["No errors found."];
}

const SettingsContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { validateSpace, spaceStatus, resetLoadingState, resetContentState } =
    useContentStateSession();
  const { addError } = useError();
  const { aiStateConfig, setInvalidated } = useAIState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<(string | null)[]>([]);

  const localValidateSpace = async () => {
    setIsLoading(true);
    setErrors([]);
    await validateSpace();
    setIsLoading(false);
  };

  useEffect(() => {
    if (spaceStatus?.valid === false) {
      setErrors(generateErrorMessage(spaceStatus));
    }
  }, [spaceStatus]);

  return (
    <>
      <ContentPanelHeader title="Settings"></ContentPanelHeader>
      <Flex
        flexDirection="column"
        className={scrollBarStyles["scrollbar-minimal"]}
        alignItems="center"
        style={{
          flex: 1,
          padding: `${tokens.spacingXl} 0`,
          ...LoadingStyles(isLoading),
          position: "relative",
        }}
        alignContent="stretch"
      >
        <Flex
          flexDirection="column"
          alignItems="stretch"
          gap={tokens.spacingM}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: CONTENT_PANEL_MAX_WIDTH_SMALL,
          }}
        >
          <Flex flexDirection="column" gap={"4px"}>
            <Text style={{ color: tokens.gray700 }}>
              This checks to see if DemAI has everything it needs in this space.
            </Text>
            <Button
              style={{ minWidth: "100%" }}
              onClick={async () => {
                await localValidateSpace();
              }}
              isDisabled={isLoading}
            >
              Validate DemAI
            </Button>
          </Flex>
          <Flex flexDirection="column" gap={"4px"}>
            <Text style={{ color: tokens.gray700 }}>
              This will install all the necessary content types and entries
              required to run DemAI.
            </Text>
            <Button
              isDisabled={isLoading}
              style={{ minWidth: "100%" }}
              onClick={async () => {
                setIsLoading(true);
                setErrors([]);
                const params = sdk.parameters
                  .installation as AppInstallationParameters;
                const errors = await updateDesignSystemMCP(
                  params.cma,
                  sdk.ids.space,
                  sdk.ids.environment
                );
                const researchErrors = await updateResearchMCP(
                  params.cma,
                  sdk.ids.space,
                  sdk.ids.environment
                );
                setIsLoading(false);
                setErrors([...errors, ...researchErrors]);
                if (errors.length === 0) {
                  await localValidateSpace();
                }
                resetLoadingState();
              }}
            >
              Install / Update DemAI
            </Button>
          </Flex>
          {/* <Button
            onClick={async () => {
              const userInput = await sdk.dialogs.openConfirm({
                title: "Confirm Revert",
                message:
                  "Are you sure you want to revert all tokens back to original?",
              });
              if (userInput === true) {
                setIsLoading(true);
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
            Revert Tokens
          </Button> */}
          <div style={{ flex: 1, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                overflow: "auto",
              }}
            >
              {isLoading ? <LoadingIcon /> : null}
              {errors.map((error) => (
                <div style={{ color: tokens.colorNegative }} key={error}>
                  {error}
                </div>
              ))}
              {!isLoading && errors.length === 0 ? (
                <Text fontColor="blue500" style={{ textAlign: "center" }}>
                  Space is valid
                </Text>
              ) : null}
            </div>
          </div>
          <Flex flexDirection="column" gap={"4px"}>
            <Text style={{ color: tokens.gray700 }}>
              WARNING!!! This will delete all the necessary content types and
              entries required to run DemAI as well as all content types and
              entries created by DemAI.
            </Text>
            <Button
              isDisabled={isLoading}
              variant="negative"
              style={{ minWidth: "100%", marginBottom: 2 }}
              onClick={async () => {
                const result = await sdk.dialogs.openConfirm({
                  title: "Removing DemAI Generated Content",
                  message:
                    "Are you sure you want to delete everything DemAI created in this space? It can not be undone.",
                });

                if (result === true) {
                  setIsLoading(true);
                  setErrors([]);

                  // clear out all created stuff...
                  const ctfAIChain = new ContentfulAIChain(
                    () => {},
                    aiStateConfig as AIPromptConfig,
                    setInvalidated
                  );
                  await ctfAIChain?.clearGeneratedContent(addError);

                  setIsLoading(false);
                  setErrors([...errors]);
                  resetContentState();
                  if (errors.length === 0) {
                    await localValidateSpace();
                  }
                  resetLoadingState();
                }
              }}
            >
              Remove DemAI Generated Content
            </Button>
            <Button
              isDisabled={isLoading}
              variant="negative"
              style={{ minWidth: "100%" }}
              onClick={async () => {
                const result = await sdk.dialogs.openConfirm({
                  title: "Removing DemAI",
                  message:
                    "Are you sure you want to delete everything related to DemAI in this space? It can not be undone.",
                });

                if (result === true && aiStateConfig) {
                  setIsLoading(true);
                  setErrors([]);

                  // clear out all created stuff...
                  const ctfAIChain = new ContentfulAIChain(
                    () => {},
                    aiStateConfig as AIPromptConfig,
                    setInvalidated
                  );
                  await ctfAIChain?.clearGeneratedContent(addError);
                  await ctfAIChain?.clearSystemContent(addError);
                  await deleteAllPreviewAccessKey(
                    aiStateConfig.cma,
                    aiStateConfig.spaceId,
                    aiStateConfig.environmentId
                  );

                  setIsLoading(false);
                  setErrors([...errors]);
                  resetContentState();
                  if (errors.length === 0) {
                    await localValidateSpace();
                  }
                  resetLoadingState();
                }
              }}
            >
              Remove Entire DemAI System
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default SettingsContent;
