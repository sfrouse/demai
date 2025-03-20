import React, { useEffect, useState } from "react";
import {
  EntityStatusBadge,
  Flex,
  Text,
  Caption,
  IconButton,
} from "@contentful/f36-components";
import { ContentType } from "contentful-management";
import * as icons from "@contentful/f36-icons";
import { PageAppSDK } from "@contentful/app-sdk";
import tokens from "@contentful/f36-tokens";
import Divider from "../../../Divider";
import LoadingIcon from "../../../LoadingIcon";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { useAIState } from "../../../../contexts/AIStateContext/AIStateContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AIPromptEngineID } from "../../../../ai/AIState/utils/createAIPromptEngine";

const ContentModelContent = () => {
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
      <Flex flexDirection="column" style={{ overflowY: "auto" }}>
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <>
            {contentState.contentTypes?.map((contentType: ContentType) => (
              <Flex
                key={contentType.sys.id}
                flexDirection="column"
                style={{
                  padding: `${tokens.spacingS} ${tokens.spacingXs}`,
                  cursor: "hand",
                }}
              >
                <Flex flexDirection="row" alignItems="center">
                  <Text
                    fontSize="fontSizeL"
                    style={{
                      color: tokens.gray800,
                    }}
                  >
                    {contentType.name}{" "}
                    <span
                      style={{
                        fontSize: 11,
                        color: tokens.gray600,
                      }}
                    >
                      {contentType.sys.id}
                    </span>{" "}
                    {contentType.sys.publishedCounter === 0 ? (
                      <EntityStatusBadge entityStatus="draft" />
                    ) : null}
                  </Text>
                  <div style={{ flex: 1 }}></div>
                  <IconButton
                    variant="transparent"
                    aria-label="Open in Contentful"
                    size="small"
                    onClick={async () => {
                      window.open(
                        `https://app.contentful.com/spaces/${sdk.ids.space}/environments/${sdk.ids.environment}/content_types/${contentType.sys.id}/fields`,
                        "_blank"
                      );
                    }}
                    icon={<icons.EntryIcon />}
                  />
                  <IconButton
                    variant="transparent"
                    aria-label="Edit in DemAI"
                    isDisabled={contentType.name.indexOf("demai-") === 0}
                    size="small"
                    onClick={async () => {
                      await setContentType(contentType.sys.id);
                      setRoute({
                        navigation: "content_model",
                        contentTypeId: contentType.sys.id,
                        aiStateEngines: [AIPromptEngineID.EDIT_CONTENT_TYPE],
                      });
                    }}
                    icon={<icons.EditIcon />}
                  />
                </Flex>
                <Caption
                  style={{
                    color: tokens.gray600,
                  }}
                >
                  {contentType.sys.id}
                </Caption>
                <Text
                  fontSize="fontSizeS"
                  style={{
                    color: tokens.gray700,
                  }}
                >
                  {contentType.description}
                </Text>
                <Divider style={{ marginBottom: 0 }} />
              </Flex>
            ))}
          </>
        )}
      </Flex>
    </>
  );
};

export default ContentModelContent;
