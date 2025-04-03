import { Button, Flex, IconButton, Tabs } from "@contentful/f36-components";
import { useContentStateSession } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import ContentPanelHeader from "../../../ContentPanelHeader";
import { NAVIGATION } from "../../../../MainNav";
import tokens from "@contentful/f36-tokens";
import { useSDK } from "@contentful/react-apps-toolkit";
import * as icons from "@contentful/f36-icons";
import precompiledCode from "../../../../../precompiled/packages";
import transformExports from "./utils/transformExports";
import generateWebCompInstance from "./utils/generateWebCompInstance";
import EditablePage from "./EditablePage";
import { useEffect, useState } from "react";
import useAIState from "../../../../../contexts/AIStateContext/useAIState";
import { AIPromptEngineID } from "../../../../../ai/AIState/AIStateTypes";
import LoadingPage from "../../../../Loading/LoadingPage";
import LoadingIcon from "../../../../Loading/LoadingIcon";
import Divider from "../../../../Divider";
import saveComponent from "./utils/saveComponent";
import validateComponent, { ValidationResult } from "./utils/validateComponent";
import { PageAppSDK } from "@contentful/app-sdk";
import PreviewPanel from "./tabPanels/PreviewPanel";

export enum COMP_DETAIL_NAVIGATION {
  DEFINITION = "definition",
  WEB_COMP = "web-comp",
  BINDINGS = "bindings",
  PREVIEW = "preview",
}

export default function CompDetailContent() {
  const sdk = useSDK<PageAppSDK>();
  const { contentState, loadingState } = useContentStateSession();
  const { setRoute, route, setInvalidated } = useAIState();
  const [comp, setComp] = useState<any>(); // typings are getting CMA and Contentful confused...
  const [localCDef, setLocalCDef] = useState<string>("");
  const [localJavaScript, setLocalJavaScript] = useState<string>("");
  const [localBindings, setLocalBindings] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationResults, setValidationResults] =
    useState<ValidationResult>();

  const isLoading =
    loadingState.components === true ||
    loadingState.ai === true ||
    loadingState.contentTypes === true;

  useEffect(() => {
    if (contentState.components) {
      const newComp = contentState.components?.find(
        (comp) => comp.sys.id === route?.componentId
      );
      setComp(newComp as any);
      if (newComp) {
        setLocalCDef(
          newComp.fields.componentDefinition &&
            JSON.stringify(newComp.fields.componentDefinition, null, 2)
        );
        setLocalJavaScript(
          newComp.fields.javascript && newComp.fields.javascript
        );
        setLocalBindings(
          newComp.fields.bindings &&
            JSON.stringify(newComp.fields.bindings, null, 2)
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

  const cancel = () => {
    // just revert everything...
    if (!comp) return;
    setLocalCDef(
      comp.fields.componentDefinition &&
        JSON.stringify(comp.fields.componentDefinition, null, 2)
    );
    setLocalJavaScript((comp.fields.javascript as unknown as string) || "");
    setLocalBindings(
      comp.fields.bindings && JSON.stringify(comp.fields.bindings, null, 2)
    );
    setIsSaving(false);

    validate();
  };

  const validate = () => {
    return validateComponent(localCDef, localBindings, localJavaScript);
  };

  return (
    <Flex flexDirection="column" style={{ flex: 1 }}>
      <ContentPanelHeader
        title={(comp?.fields?.title as unknown as string) || "Loading"}
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
      <Flex style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
          <LoadingPage />
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
                    language="json"
                    value={localCDef}
                    onChange={(e: string) => {
                      setLocalCDef(e);
                    }}
                  />
                </div>
              </Flex>
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
                    language="javascript"
                    value={localJavaScript}
                    onChange={(e: string) => {
                      setLocalJavaScript(e);
                    }}
                  />
                </div>
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
                    language="json"
                    value={localBindings}
                    onChange={(e: string) => {
                      setLocalBindings(e);
                    }}
                  />
                </div>
              </Flex>
            </Tabs.Panel>
            <PreviewPanel comp={comp} />
          </Tabs>
        )}
      </Flex>
      {validationResults && (
        <Flex flexDirection="column">
          <Flex
            flexDirection="column"
            style={{
              padding: `${tokens.spacingXs} ${tokens.spacingL}`,
              color: tokens.colorNegative,
              fontSize: tokens.fontSizeSHigh,
            }}
          >
            {!validationResults.cdef.success && (
              <div>
                <b>Component Definition</b> error: $
                {validationResults.cdef.error}
              </div>
            )}
            {!validationResults.javascript.success && (
              <div>
                <b>Javascript</b> error: ${validationResults.javascript.error}
              </div>
            )}
            {!validationResults.bindings.success && (
              <div>
                <b>Bindings</b> error: ${validationResults.bindings.error}
              </div>
            )}
            {validationResults.valid && (
              <div style={{ color: tokens.colorPositive }}>
                Component is valid
              </div>
            )}
          </Flex>
          <Divider style={{ margin: 0 }} />
        </Flex>
      )}
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
        {isSaving && <LoadingIcon />}
        <div style={{ flex: 1 }}></div>
        <Button variant="secondary" onClick={cancel}>
          Revert
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setValidationResults(validate());
          }}
        >
          Validate
        </Button>
        <Button
          variant="primary"
          onClick={async () => {
            const validation = validate();
            setValidationResults(validation);
            if (validation.valid) {
              setIsSaving(true);
              await saveComponent(
                sdk,
                comp,
                localCDef,
                localBindings,
                localJavaScript
              );
              setIsSaving(false);
              setInvalidated((p) => p + 1);
            }
          }}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
}
