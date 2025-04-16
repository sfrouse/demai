import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { ContentType, Entry } from "contentful-management";
import * as contentful from "contentful";
import React, { createContext, useContext, useReducer, useState } from "react";
import getLatestTokens from "./services/getLatestTokens";
import getComponents from "./services/getComponents";
import { AppInstallationParameters } from "../../locations/config/ConfigScreen";
import { IMCPClientValidation } from "../../ai/mcp/MCPClient";
import { DesignSystemMCPClient } from "../../ai/mcp/designSystemMCP/DesignSystemMCPClient";
import { ResearchMCP } from "../../ai/mcp/researchMCP/ResearchMCP";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../ai/mcp/researchMCP/validate/ctypes/demaiResearchCType";
import getContentTypes from "./services/getContentTypes";
import getEntries from "./services/getEntries";
import { useError } from "../ErrorContext/ErrorContext";

// Define the shape of your session data
export interface ContentState {
    contentTypes?: ContentType[];
    contentType?: ContentType;
    tokens?: any;
    css?: string;
    ai?: string;
    components?: Entry[];
    component?: Entry;
    entries?: Entry[];
    research?: {
        fields: ContentStateResearch;
        contentTypeId: string;
    };
}

export interface ContentStateResearch {
    prospect: string;
    solutionEngineerDescription: string;
    mainWebsite: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    description: string;
    products: string;
    style: string;
    tone: string;
}

// Define action types for updating session contentState
type Action =
    | { type: "SET_PROPERTY"; key: keyof ContentState; payload: any }
    | { type: "RESET_STATE" };

// Initial session contentState
const initialState: ContentState = {};

// Reducer to update only the property that is requested
const sessionReducer = (
    contentState: ContentState,
    action: Action,
): ContentState => {
    switch (action.type) {
        case "SET_PROPERTY":
            return { ...contentState, [action.key]: action.payload };
        case "RESET_STATE":
            return initialState;
        default:
            return contentState;
    }
};

// Create the context
const ContentStateContext = createContext<
    | {
          contentState: ContentState;
          getContentState: () => ContentState;
          loadProperty: (
              key: keyof ContentState,
              forceRefresh?: boolean,
          ) => void;
          loadingState: { [key in keyof ContentState]?: boolean };
          resetLoadingState: () => void;
          spaceStatus: IMCPClientValidation | undefined;
          validateSpace: () => Promise<void>;
          setContentType: (ctypeId: string | undefined) => Promise<void>;
          setComponent: (compId: string | undefined) => Promise<void>;
          cpa: string;
          setCPA: (val: string) => void;
          resetContentState: () => void;
      }
    | undefined
>(undefined);

export const ContentStateProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const sdk = useSDK<PageAppSDK>();
    const { addError } = useError();
    const [contentState, dispatch] = useReducer(sessionReducer, initialState);
    const contentStateRef = React.useRef(contentState);
    contentStateRef.current = contentState;
    const getContentState = () => contentStateRef.current;
    const [spaceStatus, setSpaceStatus] = useState<
        IMCPClientValidation | undefined
    >();
    const [loadingState, setLoadingState] = useState<{
        [key in keyof ContentState]?: boolean;
    }>({});
    const [cpa, setCPA] = useState<string>("");

    // ContentState Property Requets
    const loadInProgressMap = new Map<keyof ContentState, Promise<any>>();
    const loadProperty = async (
        key: keyof ContentState,
        forceRefresh: boolean = false,
    ) => {
        if (!forceRefresh && getContentState()[key] !== undefined) {
            return getContentState()[key];
        }

        if (loadInProgressMap.has(key)) {
            return loadInProgressMap.get(key);
        }

        setLoadingState((prev) => ({ ...prev, [key]: true }));

        const loadPromise = (async () => {
            let payload: any;

            const previewClient = cpa
                ? contentful.createClient({
                      space: sdk.ids.space,
                      environment: sdk.ids.environment,
                      accessToken: cpa,
                      host: "preview.contentful.com",
                  })
                : undefined;

            if (!previewClient) return undefined;

            try {
                switch (key) {
                    case "contentTypes": {
                        const params = sdk.parameters
                            .installation as AppInstallationParameters;
                        payload = await getContentTypes({
                            cma: params.cma,
                            spaceId: sdk.ids.space,
                            environmentId: sdk.ids.environment,
                            openAiApiKey: params.openai,
                            cpa: "",
                        });
                        break;
                    }
                    case "entries":
                        payload = await getEntries(previewClient, addError);
                        break;
                    case "tokens":
                        payload = await getLatestTokens(
                            previewClient,
                            "jsonNested",
                            addError,
                        );
                        break;
                    case "css":
                        payload = await getLatestTokens(
                            previewClient,
                            "css",
                            addError,
                        );
                        break;
                    case "ai":
                        payload = await getLatestTokens(
                            previewClient,
                            "ai",
                            addError,
                        );
                        break;
                    case "components":
                        payload = await getComponents(previewClient, addError);
                        break;
                    case "research": {
                        payload = await previewClient.getEntry(
                            DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
                        );
                        break;
                    }
                    default:
                        console.error(`Unknown property: ${key}`);
                        return;
                }

                dispatch({ type: "SET_PROPERTY", key, payload });
                return payload;
            } catch (err) {
                addError({
                    service: "Load Property",
                    message: `Error loading property ${key}`,
                    details: String(err),
                });
                return undefined;
            } finally {
                setLoadingState((prev) => ({ ...prev, [key]: false }));
            }
        })();

        loadInProgressMap.set(key, loadPromise);

        try {
            return await loadPromise;
        } finally {
            loadInProgressMap.delete(key);
        }
    };

    const resetLoadingState = () => {
        setLoadingState({});
    };

    const resetContentState = () => {
        resetLoadingState();
        dispatch({ type: "RESET_STATE" });
    };

    const setContentType = async (contentTypeId: string | undefined) => {
        if (!contentTypeId) {
            dispatch({
                type: "SET_PROPERTY",
                key: "contentType",
                payload: undefined,
            });
        }
        let contentTypes = contentState.contentTypes;
        if (!contentTypes) {
            contentTypes = await loadProperty("contentTypes");
        }
        const contentType = contentTypes?.find(
            (ctype) => ctype.sys.id === contentTypeId,
        );
        dispatch({
            type: "SET_PROPERTY",
            key: "contentType",
            payload: contentType,
        });
    };

    const setComponent = async (compId: string | undefined) => {
        if (!compId) {
            dispatch({
                type: "SET_PROPERTY",
                key: "component",
                payload: undefined,
            });
        }
        let components = contentState.components;
        if (!components) {
            components = await loadProperty("components");
        }
        const component = components?.find((comp) => comp.sys.id === compId);
        dispatch({
            type: "SET_PROPERTY",
            key: "component",
            payload: component,
        });
    };

    // Separate function to validate space model
    const validateSpace = async () => {
        try {
            const params = sdk.parameters
                .installation as AppInstallationParameters;
            const designSysMCP = new DesignSystemMCPClient(
                params.cma,
                sdk.ids.space,
                sdk.ids.environment,
                cpa,
            );
            const dSysValidResult = await designSysMCP.validate();

            const researchMCP = new ResearchMCP(
                params.cma,
                sdk.ids.space,
                sdk.ids.environment,
                cpa,
            );
            const researchValidResult = await researchMCP.validate();

            setSpaceStatus({
                valid: dSysValidResult.valid && researchValidResult.valid,
                details: {
                    ...dSysValidResult.details,
                    ...researchValidResult.details,
                },
            });
        } catch (error) {
            addError({
                service: "Validating Space",
                message: "Error trying to validate space",
                details: `${error}`,
            });
            setSpaceStatus(undefined);
        }
    };

    return (
        <ContentStateContext.Provider
            value={{
                contentState,
                getContentState,
                loadProperty,
                loadingState,
                resetLoadingState,
                spaceStatus,
                validateSpace,
                setContentType,
                setComponent,
                cpa,
                setCPA,
                resetContentState,
            }}
        >
            {children}
        </ContentStateContext.Provider>
    );
};

// Hook for components to access session data
export const useContentStateSession = () => {
    const context = useContext(ContentStateContext);
    if (!context) {
        throw new Error("useSession must be used within a ContentStateContext");
    }
    return context;
};
