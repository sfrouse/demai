import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Form,
  FormControl,
  Textarea,
  TextInput,
} from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import LoadingPage from "../../../Loading/LoadingPage";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../../locations/config/ConfigScreen";
import { createClient } from "contentful-management";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../../../ai/mcp/researchMCP/validate/ctypes/demaiResearchCType";

const ProspectContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadProperty, loadingState, cpa, spaceStatus } =
    useContentStateSession();
  const { invalidated, setInvalidated } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);
  const [prospectName, setPropsectName] = useState<string>("");
  const [seDescription, setSEDescription] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.research || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("research", forceReload);
    }
  }, [invalidated, cpa]);

  useEffect(() => {
    const research = contentState.research;
    setPropsectName(research?.fields.prospect || "");
    setSEDescription(research?.fields.solutionEngineerDescription || "");
  }, [contentState.research]);

  const saveResearch = async () => {
    const params = sdk.parameters.installation as AppInstallationParameters;
    const client = createClient({
      accessToken: params.cma,
    });
    const space = await client.getSpace(sdk.ids.space);
    const environment = await space.getEnvironment(sdk.ids.environment);

    const entryId = DEMAI_RESEARCH_SINGLETON_ENTRY_ID;
    let entry;
    try {
      entry = await environment.getEntry(entryId);
    } catch (err: any) {
      if (err.name === "NotFound") {
        sdk.notifier.error("Singleton entry not found.");
        return;
      }
      throw err; // rethrow if it's another type of error
    }

    entry.fields.prospect = {
      "en-US": prospectName,
    };

    entry.fields.solutionEngineerDescription = {
      "en-US": seDescription,
    };

    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    sdk.notifier.success("Research saved!");
    setSubmitted(false);

    setInvalidated((p) => p + 1);
  };

  const isLoading = loadingState.research === true || !spaceStatus?.valid;

  return (
    <>
      <ContentPanelHeader title="Research" invalidate></ContentPanelHeader>
      <Flex
        flexDirection="column"
        style={{
          overflowY: "auto",
          flex: 1,
          padding: `${tokens.spacingL} ${tokens.spacing2Xl}`,
          backgroundColor: isLoading ? tokens.gray100 : tokens.colorWhite,
          position: "relative",
        }}
        alignContent="stretch"
      >
        {isLoading ? (
          <LoadingPage />
        ) : (
          <Form
            onSubmit={() => {
              setSubmitted(true);
              saveResearch();
            }}
            style={{ justifyContent: "flex-end" }}
          >
            <FormControl isRequired isInvalid={!prospectName && submitted}>
              <FormControl.Label>Propspect</FormControl.Label>
              <TextInput
                value={prospectName}
                placeholder="'Contentful'"
                onChange={(e) => setPropsectName(e.target.value)}
              />
              <FormControl.HelpText>
                The full name of the prospect
              </FormControl.HelpText>
            </FormControl>
            <FormControl isRequired isInvalid={!seDescription && submitted}>
              <FormControl.Label>Description</FormControl.Label>
              <Textarea
                value={seDescription}
                placeholder="'Headless CMS'"
                onChange={(e) => setSEDescription(e.target.value)}
                style={{ height: 120 }}
              />
              <FormControl.HelpText>
                Provide a short description, just enough to disambiguate the
                name.
              </FormControl.HelpText>
            </FormControl>
            <Flex justifyContent="flex-end" style={{ width: "100%" }}>
              <Button variant="primary" type="submit" isDisabled={submitted}>
                {submitted ? "Saving" : "Save"}
              </Button>
            </Flex>
          </Form>
        )}
      </Flex>
    </>
  );
};

export default ProspectContent;
