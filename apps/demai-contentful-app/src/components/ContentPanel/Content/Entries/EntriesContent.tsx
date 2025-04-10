import React, { useEffect, useState } from "react";
import { Flex, Select, Text } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import LoadingIcon from "../../../Loading/LoadingIcon";
import DmaiContentRow from "../../../DmaiContentRow/DmaiContentRow";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import getEntryStatus from "../../../utils/entryStatus";
import LoadingPage from "../../../Loading/LoadingPage";
import Divider from "../../../Divider";

const EntriesContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadProperty, loadingState } = useContentStateSession();
  const { invalidated } = useAIState();
  const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);
  const [selectedContentType, setSelectedContentType] = useState<string>("all");

  useEffect(() => {
    const forceReload = localInvalidated !== invalidated;
    if (!contentState.entries || !contentState.contentTypes || forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
      loadProperty("contentTypes", forceReload);
      loadProperty("entries", forceReload);
    }
    if (forceReload) {
      if (!forceReload) setLocalInvalidated(invalidated);
    }
  }, [invalidated]);

  const isLoading =
    loadingState.entries === true || loadingState.contentTypes === true;

  const filteredEntries = contentState.entries?.filter((entry) => {
    if (
      selectedContentType === "all" ||
      entry.sys.contentType.sys.id === selectedContentType
    ) {
      return true;
    }
    return false;
  });

  return (
    <>
      <ContentPanelHeader title="Entries" invalidate />
      <Flex flexDirection="column" style={{ position: "relative", flex: 1 }}>
        {isLoading ? (
          <LoadingPage />
        ) : (
          <Flex
            flexDirection="column"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Flex
              style={{
                padding: `${tokens.spacingM} ${tokens.spacingL}`,
              }}
              flexDirection="row"
              alignItems="baseline"
              gap={tokens.spacingS}
            >
              <Text>filter:</Text>
              <Select
                style={{ flex: 1, width: "100%" }}
                value={selectedContentType}
                onChange={(event) => {
                  setSelectedContentType(event.target.value);
                }}
              >
                <Select.Option value="all">All Content Types</Select.Option>
                {contentState.contentTypes?.map((contentType) => {
                  return (
                    <Select.Option
                      value={contentType.sys.id}
                      key={`${contentType.sys.id}`}
                    >
                      {contentType.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Flex>
            <Divider style={{ margin: 0 }} />
            <Flex
              flexDirection="column"
              alignItems="center"
              style={{
                overflowY: "auto",
                flex: 1,
                position: "relative",
                padding: `${tokens.spacingM} ${tokens.spacingL} 0 ${tokens.spacingL}`,
              }}
            >
              {filteredEntries?.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: tokens.gray500,
                  }}
                >
                  no entries found
                </div>
              )}
              <Flex
                flexDirection="column"
                style={{ maxWidth: 800, width: "100%" }}
              >
                {filteredEntries?.map((entry) => {
                  const contentType = contentState.contentTypes?.find(
                    (ctype) => ctype.sys.id === entry.sys.contentType.sys.id
                  );
                  let title = entry.sys.id;
                  if (contentType?.displayField) {
                    title = entry.fields[contentType.displayField] || title;
                  }
                  return (
                    <DmaiContentRow
                      key={`ctype-${entry.sys.id}`}
                      editOnClick={() => {
                        sdk.navigator.openEntry(entry.sys.id, {
                          slideIn: true,
                        });
                      }}
                      title={title}
                      id={`${contentType?.name} - ${entry.sys.id}`}
                      status={getEntryStatus(entry)}
                    />
                  );
                })}
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default EntriesContent;
