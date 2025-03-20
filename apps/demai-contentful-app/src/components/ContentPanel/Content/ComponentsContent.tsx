import React, { useEffect, useState } from "react";
import {
  Badge,
  EntityStatusBadge,
  Flex,
  IconButton,
  Text,
} from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import { PageAppSDK } from "@contentful/app-sdk";
import LoadingIcon from "../../LoadingIcon";
import ContentPanelHeader from "../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import Divider from "../../Divider";
import { useContentStateSession } from "../../../contexts/ContentStateContext/ContentStateContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useAIState } from "../../../contexts/AIStateContext/AIStateContext";

const ComponentsContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadProperty, loadingState } = useContentStateSession();
  const { invalidated } = useAIState();
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

  return (
    <>
      <ContentPanelHeader title="Components" invalidate />
      <Flex flexDirection="column" style={{ overflowY: "auto" }}>
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
                <Flex
                  key={comp.sys.id}
                  flexDirection="column"
                  style={{
                    padding: `${tokens.spacingS} ${tokens.spacingXs}`,
                  }}
                >
                  <Flex flexDirection="row" alignItems="center">
                    <Text
                      fontSize="fontSizeL"
                      style={{
                        color: tokens.gray800,
                      }}
                    >
                      {comp.fields.title && comp.fields.title["en-US"]}{" "}
                      <span
                        style={{
                          fontSize: 11,
                          color: tokens.gray600,
                        }}
                      >
                        {comp.sys.id}
                      </span>{" "}
                      <EntityStatusBadge
                        size="small"
                        entityStatus={
                          comp.sys.archivedAt
                            ? "archived"
                            : comp.sys.publishedAt
                            ? "published"
                            : "draft"
                        }
                      />
                    </Text>
                    <div style={{ flex: 1 }}></div>
                    <IconButton
                      variant="transparent"
                      aria-label="Open"
                      size="small"
                      onClick={async () => {
                        await sdk.navigator.openEntry(comp.sys.id, {
                          slideIn: true,
                        });
                      }}
                      icon={<icons.EditIcon />}
                    />
                  </Flex>
                  <Text
                    fontSize="fontSizeS"
                    style={{
                      color: tokens.gray700,
                      marginBottom: 4,
                    }}
                  >
                    {comp.fields.description &&
                      comp.fields.description["en-US"]}
                  </Text>
                  <Flex gap={tokens.spacingXs}>
                    <Badge
                      variant={
                        comp.fields.componentDefinition
                          ? "primary"
                          : "secondary"
                      }
                    >
                      Definition
                    </Badge>
                    <Badge
                      variant={comp.fields.javascript ? "primary" : "secondary"}
                    >
                      Web Comp
                    </Badge>
                    <Badge
                      variant={comp.fields.bindings ? "primary" : "secondary"}
                    >
                      Bindings
                    </Badge>
                  </Flex>
                  <Divider style={{ marginBottom: 0 }} />
                </Flex>
              ))}
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default ComponentsContent;
