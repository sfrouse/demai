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

// Define the shape of your session data
export interface ContentState {
  contentTypes?: ContentType[]; // Collection<ContentType, ContentTypeProps>;
  contentType?: ContentType;
  tokens?: any;
  css?: string;
  ai?: string;
  components?: Entry[];
  entries?: Entry[];
  research?: {
    fields: {
      prospect: string;
      solutionEngineerDescription: string;
      primaryColor: string;
      secondaryColor: string;
      tertiaryColor: string;
      description: string;
      products: string;
      style: string;
      tone: string;
    };
    contentTypeId: string;
  };
}

// Define action types for updating session contentState
type Action = { type: "SET_PROPERTY"; key: keyof ContentState; payload: any };

// Initial session contentState
const initialState: ContentState = {};

// Reducer to update only the property that is requested
const sessionReducer = (
  contentState: ContentState,
  action: Action
): ContentState => {
  switch (action.type) {
    case "SET_PROPERTY":
      return { ...contentState, [action.key]: action.payload };
    default:
      return contentState;
  }
};

// Create the context
const ContentStateContext = createContext<
  | {
      contentState: ContentState;
      loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void;
      loadingState: { [key in keyof ContentState]?: boolean };
      spaceStatus: IMCPClientValidation | undefined;
      validateSpace: () => Promise<void>;
      setContentType: (ctypeId: string | undefined) => Promise<void>;
      cpa: string;
      setCPA: (val: string) => void;
    }
  | undefined
>(undefined);

export const ContentStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sdk = useSDK<PageAppSDK>();
  const [contentState, dispatch] = useReducer(sessionReducer, initialState);
  const [spaceStatus, setSpaceStatus] = useState<
    IMCPClientValidation | undefined
  >();
  const [loadingState, setLoadingState] = useState<{
    [key in keyof ContentState]?: boolean;
  }>({});
  const [cpa, setCPA] = useState<string>("");

  // Function to fetch only one property on demand, preventing duplicate calls
  const loadProperty = async (
    key: keyof ContentState,
    forceRefresh: boolean = false
  ) => {
    if (loadingState[key]) {
      return;
    }
    if (contentState[key] !== undefined && forceRefresh === false) {
      return;
    }

    let payload: any;
    setLoadingState((prev) => ({ ...prev, [key]: true })); // Mark as loading

    const previewClient = cpa
      ? contentful.createClient({
          space: sdk.ids.space,
          environment: sdk.ids.environment,
          accessToken: cpa,
          host: "preview.contentful.com",
        })
      : undefined;

    if (!previewClient) {
      payload = undefined;
    } else {
      switch (key) {
        case "contentTypes": {
          payload = await getContentTypes(sdk);
          break;
        }
        case "entries": {
          payload = await getEntries(previewClient);
          break;
        }
        case "tokens": {
          payload = await getLatestTokens(previewClient, "jsonNested");
          break;
        }
        case "css": {
          payload = await getLatestTokens(previewClient, "css");
          break;
        }
        case "ai": {
          payload = await getLatestTokens(previewClient, "ai");
          break;
        }
        case "components": {
          payload = await getComponents(previewClient);
          break;
        }
        case "research": {
          payload = await previewClient.getEntry(
            DEMAI_RESEARCH_SINGLETON_ENTRY_ID
          );
          break;
        }
        default:
          console.error(`Unknown property: ${key}`);
          return;
      }
    }

    dispatch({ type: "SET_PROPERTY", key, payload });
    setLoadingState((prev) => ({ ...prev, [key]: false }));
    return payload;
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
      (ctype) => ctype.sys.id === contentTypeId
    );
    dispatch({
      type: "SET_PROPERTY",
      key: "contentType",
      payload: contentType,
    });
  };

  // Separate function to validate space model
  const validateSpace = async () => {
    try {
      const params = sdk.parameters.installation as AppInstallationParameters;
      const designSysMCP = new DesignSystemMCPClient(
        params.cma,
        sdk.ids.space,
        sdk.ids.environment,
        cpa
      );
      const dSysValidResult = await designSysMCP.validate();

      const researchMCP = new ResearchMCP(
        params.cma,
        sdk.ids.space,
        sdk.ids.environment,
        cpa
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
      console.error("Error validating space:", error);
      setSpaceStatus(undefined);
    }
  };

  return (
    <ContentStateContext.Provider
      value={{
        contentState,
        loadProperty,
        loadingState,
        spaceStatus,
        validateSpace,
        setContentType,
        cpa,
        setCPA,
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
