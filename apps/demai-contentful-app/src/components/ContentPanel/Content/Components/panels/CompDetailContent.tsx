import { Button, Flex, IconButton, Tabs } from "@contentful/f36-components";
import { useContentStateSession } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import ContentPanelHeader from "../../../ContentPanelHeader";
import { NAVIGATION } from "../../../../MainNav";
import tokens from "@contentful/f36-tokens";
import LoadingIcon from "../../../../LoadingIcon";
import { useSDK } from "@contentful/react-apps-toolkit";
import * as icons from "@contentful/f36-icons";
import precompiledCode from "../../../../../precompiled/packages";
import transformExports from "./utils/transformExports";
import generateWebCompInstance from "./utils/generateWebCompInstance";
import EditablePage from "./EditablePage";
import { useEffect, useState } from "react";
import { Entry } from "contentful-management";
import useAIState from "../../../../../contexts/AIStateContext/useAIState";
import { AIPromptEngineID } from "../../../../../ai/AIState/AIStateTypes";

export enum COMP_DETAIL_NAVIGATION {
  DEFINITION = "definition",
  WEB_COMP = "web-comp",
  BINDINGS = "bindings",
  PREVIEW = "preview",
}

export default function CompDetailContent() {
  const sdk = useSDK();
  const { contentState, loadingState } = useContentStateSession();
  const { setRoute, route } = useAIState();
  const [comp, setComp] = useState<Entry | undefined>();
  const [localCDef, setLocalCDef] = useState<string>("");
  const [localJavaScript, setLocalJavaScript] = useState<string>("");
  const [localBindings, setLocalBindings] = useState<string>("");

  const isLoading =
    loadingState.components === true ||
    loadingState.ai === true ||
    loadingState.contentTypes === true;

  useEffect(() => {
    if (contentState.components) {
      const newComp = contentState.components?.find(
        (comp) => comp.sys.id === route?.componentId
      );
      setComp(newComp);
      if (newComp) {
        setLocalCDef(
          newComp.fields.componentDefinition &&
            JSON.stringify(newComp.fields.componentDefinition["en-US"], null, 2)
        );
        setLocalJavaScript(
          newComp.fields.javascript && newComp.fields.javascript["en-US"]
        );
        setLocalBindings(
          newComp.fields.bindings &&
            JSON.stringify(newComp.fields.bindings["en-US"], null, 2)
        );
      }
    }
  }, [
    contentState,
    setComp,
    setLocalCDef,
    setLocalJavaScript,
    setLocalBindings,
  ]);

  if (!comp) {
    return null;
  }

  return (
    <>
      <ContentPanelHeader
        title={comp.fields.title["en-US"] || "Loading"}
        invalidate
        goBack={() => {
          setRoute({
            navigation: "components",
            aiStateEngines: NAVIGATION["components"].aiStateEngines,
            aiStateEngineFocus: 0,
          });
        }}
      >
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
      </ContentPanelHeader>
      {isLoading ? (
        <LoadingIcon />
      ) : (
        <Tabs
          currentTab={`${route?.componentFocusId}`}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
          onTabChange={(tab: string) => {
            // const index = parseInt(tab);
            setRoute({
              navigation: "components",
              componentId: comp.sys.id,
              componentFocusId: tab as COMP_DETAIL_NAVIGATION,
              aiStateEngines: [AIPromptEngineID.OPEN],
            });
          }}
        >
          <Tabs.List>
            <Tabs.Tab panelId={COMP_DETAIL_NAVIGATION.DEFINITION}>
              Definition
            </Tabs.Tab>
            <Tabs.Tab panelId={COMP_DETAIL_NAVIGATION.WEB_COMP}>
              Web Comp
            </Tabs.Tab>
            <Tabs.Tab panelId={COMP_DETAIL_NAVIGATION.BINDINGS}>
              Bindings
            </Tabs.Tab>
            <Tabs.Tab panelId={COMP_DETAIL_NAVIGATION.PREVIEW}>
              Preview
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel
            id={COMP_DETAIL_NAVIGATION.DEFINITION}
            forceMount
            style={{
              flex: 1,
              position: `relative`,
              display:
                route?.componentFocusId === COMP_DETAIL_NAVIGATION.DEFINITION
                  ? "block"
                  : "none",
            }}
          >
            <Flex
              flexDirection="column"
              style={{
                backgroundColor: tokens.gray900,
                color: tokens.colorWhite,
                fontSize: tokens.fontSizeS,
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <div style={{ flex: 1 }}>
                <EditablePage
                  value={localCDef}
                  onChange={(e: string) => {
                    setLocalCDef(e);
                  }}
                />
              </div>
              <Flex
                flexDirection="row"
                justifyContent="flex-end"
                gap={tokens.spacingXs}
                style={{
                  borderTop: `1px solid ${tokens.gray100}`,
                  padding: `${tokens.spacingS} ${tokens.spacingM}`,
                  backgroundColor: tokens.colorWhite,
                }}
              >
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Save</Button>
              </Flex>
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel
            id={COMP_DETAIL_NAVIGATION.PREVIEW}
            forceMount
            style={{
              flex: 1,
              position: `relative`,
              overflow: "hidden",
              display:
                route?.componentFocusId === COMP_DETAIL_NAVIGATION.PREVIEW
                  ? "block"
                  : "none",
            }}
          >
            <iframe
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              srcDoc={`
<html>
  <head>
    <script type='module'>
      ${transformExports(
        new TextDecoder().decode(
          Uint8Array.from(atob(precompiledCode), (c) => c.charCodeAt(0))
        )
      )}
      ${
        comp.fields.javascript &&
        comp.fields.javascript["en-US"].replace(/import/g, "// import")
      }
    </script>
    <style>
      html, body { padding: 0; margin: 0; }
      ${contentState.css}
    </style>
  </head>
  <body>
    ${generateWebCompInstance(
      comp.fields.componentDefinition &&
        comp.fields.componentDefinition["en-US"]
    )}
    <pre style="white-space: pre-wrap;">${generateWebCompInstance(
      comp.fields.componentDefinition &&
        comp.fields.componentDefinition["en-US"],
      true
    )}</pre>
  </body>
</html>`}
            />
          </Tabs.Panel>
          <Tabs.Panel
            id={COMP_DETAIL_NAVIGATION.WEB_COMP}
            forceMount
            style={{
              flex: 1,
              position: `relative`,
              display:
                route?.componentFocusId === COMP_DETAIL_NAVIGATION.WEB_COMP
                  ? "block"
                  : "none",
            }}
          >
            <Flex
              flexDirection="column"
              style={{
                backgroundColor: tokens.gray900,
                color: tokens.colorWhite,
                fontSize: tokens.fontSizeS,
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <div style={{ flex: 1 }}>
                <EditablePage
                  value={localJavaScript}
                  onChange={(e: string) => {
                    setLocalJavaScript(e);
                  }}
                />
              </div>
              <Flex
                flexDirection="row"
                justifyContent="flex-end"
                gap={tokens.spacingXs}
                style={{
                  borderTop: `1px solid ${tokens.gray100}`,
                  padding: `${tokens.spacingS} ${tokens.spacingM}`,
                  backgroundColor: tokens.colorWhite,
                }}
              >
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Save</Button>
              </Flex>
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel
            id={COMP_DETAIL_NAVIGATION.BINDINGS}
            forceMount
            style={{
              flex: 1,
              position: `relative`,
              display:
                route?.componentFocusId === COMP_DETAIL_NAVIGATION.BINDINGS
                  ? "block"
                  : "none",
            }}
          >
            <Flex
              flexDirection="column"
              style={{
                backgroundColor: tokens.gray900,
                color: tokens.colorWhite,
                fontSize: tokens.fontSizeS,
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <div style={{ flex: 1 }}>
                <EditablePage
                  value={localBindings}
                  onChange={(e: string) => {
                    setLocalBindings(e);
                  }}
                />
              </div>
              <Flex
                flexDirection="row"
                justifyContent="flex-end"
                gap={tokens.spacingXs}
                style={{
                  borderTop: `1px solid ${tokens.gray100}`,
                  padding: `${tokens.spacingS} ${tokens.spacingM}`,
                  backgroundColor: tokens.colorWhite,
                }}
              >
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Save</Button>
              </Flex>
            </Flex>
          </Tabs.Panel>
        </Tabs>
      )}
    </>
  );
}
