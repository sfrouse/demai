import React, { useEffect, useState } from "react";
import {
  EntityStatusBadge,
  Flex,
  Text,
  Caption,
} from "@contentful/f36-components";
import {
  Collection,
  ContentType,
  ContentTypeProps,
  createClient,
} from "contentful-management";
import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../locations/config/ConfigScreen";
import tokens from "@contentful/f36-tokens";
import Divider from "../../Divider";
import LoadingIcon from "../../LoadingIcon";
import ContentPanelHeader from "../ContentPanelHeader";

interface ContentTypesProps {
  sdk: PageAppSDK;
  invalidated: number; // increments after CTF content update
  invalidate: () => void;
}

const ContentTypesContent: React.FC<ContentTypesProps> = ({
  sdk,
  invalidated,
  invalidate,
}) => {
  const [contentTypes, setContentTypes] =
    useState<Collection<ContentType, ContentTypeProps>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const params = sdk.parameters.installation as AppInstallationParameters;
      const client = createClient({
        accessToken: params.cma,
      });

      const space = await client.getSpace(sdk.ids.space);
      const environment = await space.getEnvironment(sdk.ids.environment);
      const contentTypes = await environment.getContentTypes();

      setContentTypes(contentTypes);

      setIsLoading(false);
    })();
  }, [invalidated]);

  return (
    <>
      <ContentPanelHeader title="Content Types" invalidate={invalidate} />
      <Flex flexDirection="column" style={{ overflowY: "auto" }}>
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <>
            {contentTypes?.items
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((contentType: ContentType) => (
                <Flex
                  key={contentType.sys.id}
                  flexDirection="column"
                  style={{
                    padding: `${tokens.spacingS} ${tokens.spacingXs}`,
                  }}
                >
                  <Text
                    fontSize="fontSizeXl"
                    style={{
                      color: tokens.gray800,
                      marginBottom: tokens.spacing2Xs,
                    }}
                  >
                    {contentType.name}{" "}
                    {contentType.sys.publishedCounter === 0 ? (
                      <EntityStatusBadge entityStatus="draft" />
                    ) : null}
                  </Text>
                  <Caption
                    style={{
                      color: tokens.gray600,
                    }}
                  >
                    {contentType.sys.id}
                  </Caption>
                  <Text
                    fontSize="fontSizeM"
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

export default ContentTypesContent;
