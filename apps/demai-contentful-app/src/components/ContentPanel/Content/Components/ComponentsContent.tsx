import React, { useEffect, useState } from "react";
import { Flex } from "@contentful/f36-components";
import LoadingIcon from "../../../LoadingIcon";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import CompDetailContent, {
  COMP_DETAIL_NAVIGATION,
} from "./panels/CompDetailContent";
import tokens from "@contentful/f36-tokens";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import { AIPromptEngineID } from "../../../../ai/AIState/AIStateTypes";
import getEntryStatus from "../../../utils/entryStatus";

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
    if (!contentState.css || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("css", forceReload);
    }
  }, [invalidated]);

  const isLoading =
    loadingState.components === true ||
    loadingState.ai === true ||
    loadingState.contentTypes === true ||
    loadingState.css === true;

  if (route?.componentId) {
    return <CompDetailContent />;
  }

  return (
    <>
      <ContentPanelHeader title="Components" invalidate />
      <Flex
        flexDirection="column"
        style={{ overflowY: "auto", padding: `0 ${tokens.spacingM}` }}
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
                return a.fields?.title.localeCompare(b.fields?.title);
              }) // Sort by title
              .map((comp: any) => (
                <DmaiContentRow
                  key={`comp-${comp.sys.id}`}
                  onClick={() => {
                    setRoute({
                      navigation: "components",
                      componentId: comp.sys.id,
                      componentFocusId: COMP_DETAIL_NAVIGATION.DEFINITION,
                      aiStateEngines: [AIPromptEngineID.OPEN],
                    });
                  }}
                  title={comp.fields.title && comp.fields.title}
                  id={comp.sys.id}
                  description={
                    comp.fields.description && comp.fields.description
                  }
                  status={getEntryStatus(comp)}
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
