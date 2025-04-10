import React, { useEffect, useState } from "react";
import { Button, Flex, Text } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../locations/config/ConfigScreen";
import ContentPanelHeader from "../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../contexts/ContentStateContext/ContentStateContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import useAIState from "../../../contexts/AIStateContext/useAIState";
import updateDesignSystemMCP from "../../../ai/mcp/designSystemMCP/validate/updateDesignSystemMCP";
import { IMCPClientValidation } from "../../../ai/mcp/MCPClient";
import updateResearchMCP from "../../../ai/mcp/researchMCP/validate/updateResearchMCP";
import LoadingIcon from "../../Loading/LoadingIcon";

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

const SpaceContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { validateSpace, spaceStatus, resetLoadingState } =
    useContentStateSession();
  const { invalidated } = useAIState();
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

  useEffect(() => {
    localValidateSpace();
  }, [invalidated]);

  return (
    <>
      <ContentPanelHeader title="Settings"></ContentPanelHeader>
      <Flex
        flexDirection="column"
        style={{
          overflowY: "auto",
          flex: 1,
          padding: tokens.spacingL,
          position: "relative",
        }}
        alignContent="stretch"
      >
        <Flex flexDirection="column" gap={tokens.spacingM}>
          <Button
            onClick={async () => {
              await localValidateSpace();
            }}
            isDisabled={isLoading}
          >
            Validate Content Model
          </Button>
          <Button
            isDisabled={isLoading}
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
            Install DemAI
          </Button>
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
          {errors.map((error) => (
            <Text fontColor="red500" key={error}>
              {error}
            </Text>
          ))}
          {!isLoading && errors.length === 0 ? (
            <Text fontColor="blue500">Space is valid</Text>
          ) : null}
          {isLoading ? <LoadingIcon /> : null}
        </Flex>
      </Flex>
    </>
  );
};

export default SpaceContent;
