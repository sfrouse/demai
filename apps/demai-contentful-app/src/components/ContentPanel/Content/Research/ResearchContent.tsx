import React, { useEffect, useState } from "react";
import { Flex, Heading, Paragraph } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import {
  ContentStateResearch,
  useContentStateSession,
} from "../../../../contexts/ContentStateContext/ContentStateContext";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import scrollBarStyles from "../../../utils/ScrollBarMinimal.module.css";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../../locations/config/ConfigScreen";
import { createClient } from "contentful-management";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../../../ai/mcp/researchMCP/validate/ctypes/demaiResearchCType";
import { useSDK } from "@contentful/react-apps-toolkit";
import EditableResearchField from "./ResearchContent/EditableResearchField";
import ContentSectionHeader from "../../ContentSectionHeader/ContentSectionHeader";
import ColorTokensContent from "../DesignSystem/sections/ColorTokensContent";

const ResearchContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadProperty, loadingState, cpa, spaceStatus } =
    useContentStateSession();
  const { invalidated, setInvalidated } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);
  const [fieldInEditMode, setFieldInEditMode] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [localResearch, setLocalResearch] = useState<
    ContentStateResearch | undefined
  >();

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.research || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("research", forceReload);
    }
    if (!contentState.tokens || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("tokens", forceReload);
    }
  }, [invalidated, cpa]);

  useEffect(() => {
    const research = contentState.research;
    setLocalResearch({
      ...(research?.fields as any),
    });
  }, [contentState.research]);

  const isLoading = loadingState.research === true || !spaceStatus?.valid;

  const research = contentState.research;

  const saveResearch = async (id: string) => {
    setIsSaving(true);
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

    entry.fields[id] = {
      "en-US": localResearch![id as keyof ContentStateResearch],
    };

    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    sdk.notifier.success("Research saved!");

    setIsSaving(false);
    setInvalidated((p) => p + 1);
    setFieldInEditMode("");
  };

  return (
    <>
      <ContentPanelHeader
        title="Research"
        invalidate
        showMoney
      ></ContentPanelHeader>
      <Flex
        flexDirection="column"
        className={scrollBarStyles["scrollbar-minimal"]}
        style={{
          overflowY: "auto",
          flex: 1,
          padding: `${tokens.spacingL} ${tokens.spacing2Xl} 400px ${tokens.spacing2Xl}`,
          backgroundColor: isLoading ? tokens.gray100 : tokens.colorWhite,
          position: "relative",
        }}
        alignContent="stretch"
      >
        {research && research.fields && (
          <>
            {research.fields.prospect && (
              <Heading>{research.fields.prospect}</Heading>
            )}
            {research.fields.solutionEngineerDescription && (
              <>
                <ContentSectionHeader title={"Description"} />
                <Paragraph>
                  {research.fields.solutionEngineerDescription}
                </Paragraph>
              </>
            )}
            {(research.fields.primaryColor ||
              research.fields.secondaryColor ||
              research.fields.tertiaryColor) && (
              <ContentSectionHeader title="Brand Colors" />
            )}
            <Flex
              flexDirection="row"
              style={{ padding: `${tokens.spacingL} 0` }}
            >
              {renderColor("primary", research.fields.primaryColor)}
              {renderColor("secondary", research.fields.secondaryColor)}
              {renderColor("tertiary", research.fields.tertiaryColor)}
            </Flex>
            {["description", "products", "style", "tone"].map((id) => (
              <EditableResearchField
                id={id}
                key={`research-field-${id}`}
                fieldInEditMode={fieldInEditMode}
                setFieldInEditMode={setFieldInEditMode}
                localResearch={localResearch}
                setLocalResearch={setLocalResearch}
                research={research.fields}
                isSaving={isSaving}
                saveResearch={saveResearch}
              />
            ))}
          </>
        )}
      </Flex>
    </>
  );
};

function renderColor(name: string, color: string) {
  if (!color) return null;
  return (
    <Flex gap={tokens.spacingS} flexDirection="column" style={{ flex: 1 }}>
      <ColorTokensContent
        dsysTokens={{ color: { [name]: color } }}
        useCssVars={false}
      />
    </Flex>
  );
}

export default ResearchContent;
