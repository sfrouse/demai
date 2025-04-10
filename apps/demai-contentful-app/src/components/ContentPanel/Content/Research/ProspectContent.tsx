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
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../../locations/config/ConfigScreen";
import { createClient } from "contentful-management";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../../../ai/mcp/researchMCP/validate/ctypes/demaiResearchCType";
import { CONTENT_PANEL_MAX_WIDTH } from "../../../../constants";
import LoadingStyles from "../../../Loading/LoadingStyles";

const ProspectContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadProperty, loadingState, cpa, spaceStatus } =
    useContentStateSession();
  const { invalidated, setInvalidated } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);
  const [prospectName, setPropsectName] = useState<string>("");
  const [mainWebsite, setMainWebsite] = useState<string>("");
  const [seDescription, setSEDescription] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.research || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("research", forceReload);
    }
    if (!contentState.contentTypes || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("contentTypes", forceReload);
    }
  }, [invalidated, cpa]);

  useEffect(() => {
    const research = contentState.research;
    setPropsectName(research?.fields.prospect || "");
    setSEDescription(research?.fields.solutionEngineerDescription || "");
    setMainWebsite(research?.fields.mainWebsite || "");
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

    entry.fields.mainWebsite = {
      "en-US": mainWebsite,
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

  const handleCancel = () => {
    const research = contentState.research;
    setPropsectName(research?.fields.prospect || "");
    setMainWebsite(research?.fields.mainWebsite || "");
    setSEDescription(research?.fields.solutionEngineerDescription || "");
  };

  const isLoading =
    loadingState.research === true ||
    loadingState.contentTypes === true ||
    !spaceStatus?.valid;

  return (
    <>
      <ContentPanelHeader title="Research" invalidate></ContentPanelHeader>
      <Flex
        flexDirection="column"
        style={{
          overflowY: "auto",
          flex: 1,
          padding: `${tokens.spacingL} ${tokens.spacing2Xl}`,
          ...LoadingStyles(isLoading),
          position: "relative",
        }}
        alignItems="center"
      >
        <Flex
          alignItems="stretch"
          style={{
            maxWidth: CONTENT_PANEL_MAX_WIDTH,
            width: "100%",
          }}
        >
          <Form
            onSubmit={() => {
              setSubmitted(true);
              saveResearch();
            }}
            style={{ justifyContent: "flex-end", width: "100%" }}
          >
            <FormControl isRequired isInvalid={!prospectName && submitted}>
              <FormControl.Label>Prospect</FormControl.Label>
              <TextInput
                value={prospectName}
                placeholder="'Contentful'"
                onChange={(e) => setPropsectName(e.target.value)}
              />
              <FormControl.HelpText>
                The full name of the prospect
              </FormControl.HelpText>
            </FormControl>
            <FormControl isRequired isInvalid={!mainWebsite && submitted}>
              <FormControl.Label>Main Website</FormControl.Label>
              <TextInput
                value={mainWebsite}
                placeholder="'https://www.contentful.com'"
                onChange={(e) => setMainWebsite(e.target.value)}
              />
              <FormControl.HelpText>
                The prospect’s primary website to reference.
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
            <Flex
              justifyContent="flex-end"
              style={{ width: "100%", gap: tokens.spacingS }}
            >
              <Button
                variant="secondary"
                onClick={handleCancel}
                isDisabled={submitted}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={submitted}>
                {submitted ? "Saving" : "Save"}
              </Button>
            </Flex>
          </Form>
        </Flex>
      </Flex>
    </>
  );
};

export default ProspectContent;
