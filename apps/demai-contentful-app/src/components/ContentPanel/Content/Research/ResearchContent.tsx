import React, { useEffect, useState } from "react";
import { Flex, Heading, Paragraph } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import Divider from "../../../Divider";
import { propHeader, renderChip } from "./../DesignSystem/DSysTokensContent";
import LoadingPage from "../../../Loading/LoadingPage";

const ResearchContent = () => {
  const { contentState, loadProperty, loadingState, cpa, spaceStatus } =
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

  const isLoading = loadingState.research === true || !spaceStatus?.valid;

  const research = contentState.research;
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
          research &&
          research.fields && (
            <>
              <Heading>{research.fields.prospect}</Heading>
              {propHeader(`Your Description`)}
              <Paragraph>
                {research.fields.solutionEngineerDescription}
              </Paragraph>
              {propHeader(`Brand Colors`)}
              <Flex
                flexDirection="row"
                style={{ padding: `${tokens.spacingL} 0` }}
              >
                {renderColor("Primary", research.fields.primaryColor)}
                {renderColor("Secondary", research.fields.secondaryColor)}
                {renderColor("Tertiary", research.fields.tertiaryColor)}
              </Flex>
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
    <Flex gap={tokens.spacingS} flexDirection="row" style={{ flex: 1 }}>
      {propHeader(`${name}`)}
      {renderChip(name, color)}
    </Flex>
  );
}

export default ResearchContent;
