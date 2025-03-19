import React, { useEffect, useState } from "react";
import { Caption, Flex, Text } from "@contentful/f36-components";
import LoadingIcon from "../../../LoadingIcon";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { useAIState } from "../../../../contexts/AIStateContext/AIStateContext";
import { AIPromptEngineID } from "../../../../ai/AIState/utils/createAIPromptEngine";
import tokens from "@contentful/f36-tokens";
import Divider from "../../../Divider";

const ContentTypeContent = () => {
  const { contentState, loadProperty, loadingState, setContentType } =
    useContentStateSession();
  const { invalidated, findAndSetAISessionManager } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.contentTypes || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("contentTypes", forceReload);
    }
  }, [invalidated]);

  const contentType = contentState.contentType;
  const isLoading = loadingState.contentTypes === true || !contentType;

  return (
    <>
      <ContentPanelHeader
        title={contentType?.name || "Loading"}
        invalidate
        goBack={() => {
          setContentType(undefined);
          findAndSetAISessionManager(AIPromptEngineID.CONTENT_MODEL);
        }}
      />
      <Flex flexDirection="column" style={{ overflowY: "auto" }}>
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <>
            {contentState.contentType?.fields
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((field) => (
                <Flex
                  key={`${contentType.sys.id}-${field.id}`}
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
                      {field.name}{" "}
                    </Text>
                    <div style={{ flex: 1 }}></div>
                  </Flex>
                  <Caption
                    style={{
                      color: tokens.gray600,
                    }}
                  >
                    id: {field.id}, type: {field.type}
                    {", "}
                    {field.linkType ? `linkType: ${field.linkType},` : ""}{" "}
                    localized: {field.localized ? "Yes" : "No"}, required:{" "}
                    {field.required ? "Yes" : "No"}, omitted:{" "}
                    {field.omitted ? "Yes" : "No"}
                  </Caption>
                  <Divider style={{ marginBottom: 0 }} />
                </Flex>
              ))}
          </>
        )}
      </Flex>
    </>
  );
};

export default ContentTypeContent;
