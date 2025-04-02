import React, { useEffect, useState } from "react";
import { Flex, Paragraph } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import LoadingIcon from "../../../LoadingIcon";
import Divider from "../../../Divider";
import { propHeader, renderChip } from "./../DesignSystem/DSysTokensContent";

const ResearchContent = () => {
  const { contentState, loadProperty, loadingState, cpa } =
    useContentStateSession();
  const { invalidated } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);

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

  const isLoading =
    loadingState.contentTypes === true && loadingState.tokens === true;

  const research = contentState.research;
  return (
    <>
      <ContentPanelHeader title="Research"></ContentPanelHeader>
      <Flex
        flexDirection="column"
        style={{ overflowY: "auto", flex: 1, padding: tokens.spacingL }}
        alignContent="stretch"
      >
        {isLoading ? (
          <LoadingIcon />
        ) : (
          research &&
          research.fields && (
            <>
              {renderColor("Primary", research.fields.primaryColor)}
              {renderColor("Secondary", research.fields.secondaryColor)}
              {renderColor("Tertiary", research.fields.tertiaryColor)}
              {propHeader(`Description`)}
              <Paragraph>{research.fields.description}</Paragraph>
              {propHeader(`Products`)}
              <Paragraph>{research.fields.products}</Paragraph>
              {propHeader(`Style`)}
              <Paragraph>{research.fields.style}</Paragraph>
              {propHeader(`Tone`)}
              <Paragraph>{research.fields.tone}</Paragraph>
            </>
          )
        )}
      </Flex>
    </>
  );
};

function renderColor(name: string, color: string) {
  return (
    <Flex gap={tokens.spacingXs} flexDirection="column">
      {propHeader(`${name} Color`)}
      {renderChip(name, color)}
      <Divider />
    </Flex>
  );
}

export default ResearchContent;
