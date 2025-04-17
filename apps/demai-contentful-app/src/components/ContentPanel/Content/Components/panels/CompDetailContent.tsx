import { Button, Flex, IconButton, Tabs } from "@contentful/f36-components";
import { useContentStateSession } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import ContentPanelHeader from "../../../ContentPanelHeader";
import { NAVIGATION } from "../../../../MainNav";
import tokens from "@contentful/f36-tokens";
import { useSDK } from "@contentful/react-apps-toolkit";
import * as icons from "@contentful/f36-icons";
import { useCallback, useEffect, useState } from "react";
import useAIState from "../../../../../contexts/AIStateContext/useAIState";
import saveComponent from "./utils/saveComponent";
import validateComponent, { ValidationResult } from "./utils/validateComponent";
import { PageAppSDK } from "@contentful/app-sdk";
import PreviewPanel from "./tabPanels/PreviewPanel";
import CompDefinitionPanel from "./tabPanels/CompDefinitionPanel";
import WebComponentPanel from "./tabPanels/WebComponentPanel";
import BindingsPanel from "./tabPanels/BindingsPanel";
import createCTypeFromCDef from "../../../../../ai/mcp/designSystemMCP/functions/utils/createCTypeFromCDef/createCTypeFromCDef";
import { EditComponentAction } from "../../../../../ai/AIAction/actions/designSystem/EditComponentAction";

export enum COMP_DETAIL_NAVIGATION {
    DEFINITION = "definition",
    WEB_COMP = "web-comp",
    BINDINGS = "bindings",
    PREVIEW = "preview",
}

export default function CompDetailContent() {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty } = useContentStateSession();
    const { setRoute, route, aiAction } = useAIState();
    const [comp, setComp] = useState<any>(); // typings are getting CMA and Contentful confused...
    const [localCDef, setLocalCDef] = useState<string>("");
    const [localJavaScript, setLocalJavaScript] = useState<string>("");
    const [localBindings, setLocalBindings] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [validationResults, setValidationResults] =
        useState<ValidationResult>();

    const validate = () => {
        return validateComponent(localCDef, localBindings, localJavaScript);
    };

    useEffect(() => {
        console.log("LOADING");
        if (contentState.components) {
            const newComp = contentState.components?.find(
                (comp) => comp.sys.id === route?.componentId,
            );
            setComp(newComp as any);
            if (newComp) {
                setLocalCDef(
                    newComp.fields.componentDefinition &&
                        JSON.stringify(
                            newComp.fields.componentDefinition,
                            null,
                            2,
                        ),
                );
                setLocalJavaScript(
                    newComp.fields.javascript && newComp.fields.javascript,
                );
                setLocalBindings(
                    newComp.fields.bindings &&
                        JSON.stringify(newComp.fields.bindings, null, 2),
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

    const save = useCallback(async () => {
        const validation = validate();
        setValidationResults(validation);
        if (validation.valid) {
            setIsSaving(true);
            await saveComponent(
                sdk,
                comp,
                localCDef,
                localBindings,
                localJavaScript,
            );
            await loadProperty("components", true);
            setIsSaving(false);
        }
    }, [localBindings, localCDef, localJavaScript, sdk, comp]);

    const cancel = () => {
        // just revert everything...
        if (!comp) return;
        setLocalCDef(
            comp.fields.componentDefinition &&
                JSON.stringify(comp.fields.componentDefinition, null, 2),
        );
        setLocalJavaScript((comp.fields.javascript as unknown as string) || "");
        setLocalBindings(
            comp.fields.bindings &&
                JSON.stringify(comp.fields.bindings, null, 2),
        );
        setIsSaving(false);

        validate();
    };

    if (!comp) {
        return null;
    }

    return (
        <Flex flexDirection="column" style={{ flex: 1 }}>
            <ContentPanelHeader
                title={(comp?.fields?.title as unknown as string) || "Loading"}
                invalidate
                goBack={() => {
                    setRoute({
                        navigation: "components",
                        // aiStateEngines: NAVIGATION["components"].aiStateEngines,
                        // aiStateEngineFocus: 0,
                        aiActions: NAVIGATION["components"].aiActions,
                        aiActionFocus: 0,
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
                <Tabs
                    currentTab={`${route?.componentFocusId}`}
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                    onTabChange={(tab: string) => {
                        // const index = parseInt(tab);
                        setRoute({
                            navigation: "components",
                            componentId: comp.sys.id,
                            componentFocusId: tab as COMP_DETAIL_NAVIGATION,
                            aiActions: [EditComponentAction],
                            aiActionFocus: 0,
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

                    <Flex
                        flexDirection="row"
                        style={{ width: "100%", height: "100%" }}
                    >
                        <CompDefinitionPanel
                            localCDef={localCDef}
                            setLocalCDef={setLocalCDef}
                            onSave={save}
                        />
                        <WebComponentPanel
                            localJavaScript={localJavaScript}
                            setLocalJavaScript={setLocalJavaScript}
                            onSave={save}
                        />
                        <BindingsPanel
                            localBindings={localBindings}
                            setLocalBindings={setLocalBindings}
                            onSave={save}
                        />
                        <PreviewPanel
                            javascript={localJavaScript}
                            componentDefinition={localCDef}
                            bindings={localBindings}
                        />
                    </Flex>
                </Tabs>
            </Flex>

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
                <Button
                    variant="secondary"
                    onClick={async () => {
                        setIsSaving(true);
                        const cdef = JSON.parse(localCDef);
                        if (aiAction && cdef) {
                            await createCTypeFromCDef(
                                aiAction.config.cma,
                                aiAction.config.spaceId,
                                aiAction.config.environmentId,
                                cdef,
                            );
                        }
                        setIsSaving(false);
                    }}
                    isDisabled={isSaving}
                >
                    Update C.Type
                </Button>
                {validationResults && (
                    <Flex
                        flexDirection="row"
                        flexWrap="wrap"
                        style={{
                            padding: `${tokens.spacingXs} ${tokens.spacingL}`,
                            color: tokens.colorNegative,
                            fontSize: tokens.fontSizeSHigh,
                        }}
                    >
                        {!validationResults.cdef.success && (
                            <span>
                                <b>Component Definition</b> error:{" "}
                                {validationResults.cdef.error}
                            </span>
                        )}
                        {!validationResults.javascript.success && (
                            <span>
                                <b>Javascript</b> error:{" "}
                                {validationResults.javascript.error}
                            </span>
                        )}
                        {!validationResults.bindings.success && (
                            <span>
                                <b>Bindings</b> error:{" "}
                                {validationResults.bindings.error}
                            </span>
                        )}
                        {validationResults.valid && (
                            <span style={{ color: tokens.colorPositive }}>
                                Component is valid
                            </span>
                        )}
                    </Flex>
                )}
                <div style={{ flex: 1 }}></div>
                <Button
                    variant="secondary"
                    onClick={cancel}
                    isDisabled={isSaving}
                >
                    Revert
                </Button>
                <Button
                    variant="secondary"
                    isDisabled={isSaving}
                    onClick={() => {
                        setValidationResults(validate());
                    }}
                >
                    Validate
                </Button>
                <Button variant="primary" isLoading={isSaving} onClick={save}>
                    Save
                </Button>
            </Flex>
        </Flex>
    );
}
