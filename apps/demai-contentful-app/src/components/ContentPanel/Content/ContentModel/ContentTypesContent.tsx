import React, { useEffect, useState } from "react";
import { Flex } from "@contentful/f36-components";
import { ContentType } from "contentful-management";
import { PageAppSDK } from "@contentful/app-sdk";
import LoadingIcon from "../../../Loading/LoadingIcon";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import tokens from "@contentful/f36-tokens";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import { AIPromptEngineID } from "../../../../ai/AIState/AIStateTypes";
import LoadingPage from "../../../Loading/LoadingPage";

const ContentTypesContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadProperty, loadingState, setContentType } =
    useContentStateSession();
  const { invalidated, setRoute } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.contentTypes || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("contentTypes", forceReload);
    }
  }, [invalidated]);

  const isLoading = loadingState.contentTypes === true;

  return (
    <>
      <ContentPanelHeader title="Content Types" invalidate />
      <Flex
        flexDirection="column"
        style={{
          overflowY: "auto",
          padding: `0 ${tokens.spacingM}`,
          flex: 1,
          position: "relative",
        }}
      >
        {isLoading ? (
          <LoadingPage />
        ) : (
          <>
            {contentState.contentTypes?.map((contentType: ContentType) => (
              <DmaiContentRow
                key={`ctype-${contentType.sys.id}`}
                onClick={async () => {
                  await setContentType(contentType.sys.id);
                  setRoute({
                    navigation: "content_model",
                    contentTypeId: contentType.sys.id,
                    aiStateEngines: [AIPromptEngineID.EDIT_CONTENT_TYPE],
                  });
                }}
                editOnClick={() => {
                  window.open(
                    `https://app.contentful.com/spaces/${sdk.ids.space}/environments/${sdk.ids.environment}/content_types/${contentType.sys.id}/fields`,
                    "_blank"
                  );
                }}
                title={contentType.name}
                id={contentType.sys.id}
                description={contentType.description}
                status={
                  contentType.sys.publishedCounter === 0 ? "draft" : "none"
                }
              />
            ))}
          </>
        )}
      </Flex>
    </>
  );
};

export default ContentTypesContent;
