import React, { useEffect, useState } from "react";
import { Flex } from "@contentful/f36-components";
import LoadingIcon from "../../../LoadingIcon";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { useAIState } from "../../../../contexts/AIStateContext/AIStateContext";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import { AIPromptEngineID } from "../../../../ai/AIState/utils/createAIPromptEngine";
import CompDetailContent from "./panels/CompDetailContent";
import tokens from "@contentful/f36-tokens";

const ComponentsContent = () => {
  const { contentState, loadProperty, loadingState } = useContentStateSession();
  const { invalidated, setRoute, route } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.components || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("components", forceReload);
    }
    if (!contentState.ai || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("ai", forceReload);
    }
    if (!contentState.contentTypes || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("contentTypes", forceReload);
    }
  }, [invalidated]);

  const isLoading =
    loadingState.components === true ||
    loadingState.ai === true ||
    loadingState.contentTypes === true;

  if (route?.componentId) {
    return <CompDetailContent />;
  }

  return (
    <>
      <ContentPanelHeader title="Components" invalidate />
      <Flex
        flexDirection="column"
        style={{ overflowY: "auto", padding: tokens.spacingM }}
      >
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <Flex flexDirection="column">
            {contentState.components
              ?.slice() // Make a shallow copy to avoid mutating the original array
              .sort((a, b) => {
                if (!a.fields?.title || !b.fields?.title) {
                  return 0;
                }
                return a.fields?.title["en-US"].localeCompare(
                  b.fields?.title["en-US"]
                );
              }) // Sort by title
              .map((comp: any) => (
                <DmaiContentRow
                  key={`comp-${comp.sys.id}`}
                  onClick={() => {
                    console.log("Open component", comp.sys.id);
                    setRoute({
                      navigation: "components",
                      componentId: comp.sys.id,
                      componentFocusId: 0,
                      aiStateEngines: [AIPromptEngineID.OPEN],
                    });
                  }}
                  title={comp.fields.title && comp.fields.title["en-US"]}
                  id={comp.sys.id}
                  description={
                    comp.fields.description && comp.fields.description["en-US"]
                  }
                  status={
                    comp.sys.archivedAt
                      ? "archived"
                      : comp.sys.publishedAt
                      ? "published"
                      : "draft"
                  }
                  badges={[
                    {
                      text: "Definition",
                      variant: comp.fields.componentDefinition
                        ? "primary"
                        : "secondary",
                    },
                    {
                      text: "C.Type",
                      variant: "secondary",
                    },
                    {
                      text: "Web Comp",
                      variant: comp.fields.javascript ? "primary" : "secondary",
                    },
                    {
                      text: "Bindings",
                      variant: comp.fields.bindings ? "primary" : "secondary",
                    },
                  ]}
                />
              ))}
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default ComponentsContent;
