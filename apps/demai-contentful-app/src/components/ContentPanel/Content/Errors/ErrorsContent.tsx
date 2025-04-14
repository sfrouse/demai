import React from "react";
import { Button, Flex } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
import { useError } from "../../../../contexts/ErrorContext/ErrorContext";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { CONTENT_PANEL_MAX_WIDTH } from "../../../../constants";

const ErrorsContent = () => {
  const sdk = useSDK<PageAppSDK>();
  const { errors, clearErrors } = useError();

  return (
    <>
      <ContentPanelHeader title="Errors">
        <Button
          onClick={() => {
            clearErrors();
          }}
        >
          Clear Errors
        </Button>
      </ContentPanelHeader>
      <Flex
        flexDirection="column"
        style={{
          overflowY: "auto",
          flex: 1,
          padding: `${tokens.spacingL} ${tokens.spacing2Xl}`,
          position: "relative",
          gap: tokens.spacingXs,
        }}
        alignItems="center"
      >
        {errors.length === 0 && <div>No Errors</div>}
        {errors.map((error) => {
          return (
            <Flex
              flexDirection="row"
              style={{
                maxWidth: CONTENT_PANEL_MAX_WIDTH,
                width: "100%",
                borderRadius: tokens.borderRadiusSmall,
                padding: tokens.spacingM,
                border: `1px solid ${tokens.red200}`,
                backgroundColor: tokens.red100,
              }}
            >
              <Flex flexDirection="column" style={{ flex: 1 }}>
                <div style={{ fontSize: tokens.fontSizeM }}>
                  {error.service}
                </div>
                <div style={{ fontSize: tokens.fontSizeS }}>
                  {error.message}
                </div>
              </Flex>
              <Button
                variant="negative"
                size="small"
                onClick={() => {
                  sdk.dialogs.openAlert({
                    title: `${error.service}`,
                    message: `${error.message}: ${error.details}`,
                    confirmLabel: "OK",
                  });
                }}
              >
                See Details
              </Button>
            </Flex>
          );
        })}
      </Flex>
    </>
  );
};

export default ErrorsContent;
