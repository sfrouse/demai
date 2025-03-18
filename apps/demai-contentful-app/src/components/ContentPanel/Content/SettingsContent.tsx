import React, { useEffect, useState } from "react";
import { Button, Flex, Text } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../locations/config/ConfigScreen";
import LoadingIcon from "../../LoadingIcon";
import ContentPanelHeader from "../ContentPanelHeader";
import validateDemAIContentModel from "../../../ai/mcp/designSystemMCP/contentTypes/validateDemAIContentModel";
import updateDemAIContentModel from "../../../ai/mcp/designSystemMCP/contentTypes/updateDemAIContentModel";
import tokens from "@contentful/f36-tokens";
import revertDemAITokensSingletonEntry from "../../../ai/mcp/designSystemMCP/contentTypes/tokenSingleton/revertDemAITokensSingletonEntry";

interface SettingsContentProps {
  sdk: PageAppSDK;
  invalidated: number; // increments after CTF content update
  invalidate: () => void;
  setSpaceIsValid: (val: boolean) => void;
}

function generateErrorMessage(
  validationResult: Record<string, any>
): (string | null)[] {
  const issues = Object.entries(validationResult)
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

  return issues.length > 0 ? issues : ["No errors found."];
}

const SettingsContent: React.FC<SettingsContentProps> = ({
  sdk,
  invalidated,
  invalidate,
  setSpaceIsValid,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<(string | null)[]>([]);

  const validateSpace = async () => {
    setIsLoading(true);
    setErrors([]);
    const params = sdk.parameters.installation as AppInstallationParameters;
    const isValid = await validateDemAIContentModel(
      params.cma,
      sdk.ids.space,
      sdk.ids.environment
    );
    if (isValid.valid === false) {
      setErrors(generateErrorMessage(isValid));
    }
    setIsLoading(false);
    setSpaceIsValid(isValid.valid);
  };

  useEffect(() => {
    (async () => {
      await validateSpace();
    })();
  }, [invalidated]);

  return (
    <>
      <ContentPanelHeader title="Settings"></ContentPanelHeader>
      <Flex
        flexDirection="column"
        style={{ overflowY: "auto" }}
        alignContent="stretch"
      >
        <Flex flexDirection="column" gap={tokens.spacingM}>
          <Button
            onClick={async () => {
              await validateSpace();
            }}
          >
            Validate Content Model
          </Button>
          <Button
            onClick={async () => {
              setIsLoading(true);
              setErrors([]);
              const params = sdk.parameters
                .installation as AppInstallationParameters;
              const errors = await updateDemAIContentModel(
                params.cma,
                sdk.ids.space,
                sdk.ids.environment
              );
              setIsLoading(false);
              setErrors(errors);
              if (errors.length === 0) {
                await validateSpace();
              }
            }}
          >
            Create Content Model
          </Button>
          <Button
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
                invalidate();
              }
            }}
          >
            Revert Tokens
          </Button>
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

export default SettingsContent;
