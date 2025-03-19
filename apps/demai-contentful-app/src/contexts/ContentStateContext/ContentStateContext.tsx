import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import {
  Collection,
  ContentType,
  ContentTypeProps,
  createClient,
  Entry,
} from "contentful-management";
import React, { createContext, useContext, useReducer, useState } from "react";
import getLatestTokens from "./services/getLatestTokens";
import getComponents from "./services/getComponents";
import { AppInstallationParameters } from "../../locations/config/ConfigScreen";
import validateDemAIContentModel, {
  DEMAI_VALID,
} from "../../ai/mcp/designSystemMCP/contentTypes/validateDemAIContentModel";

// Define the shape of your session data
export interface ContentState {
  // spaceStatus?: DEMAI_VALID;
  contentTypes?: Collection<ContentType, ContentTypeProps>;
  tokens?: any;
  css?: string;
  components?: Entry[];
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
      spaceStatus: DEMAI_VALID | undefined;
      validateSpace: () => Promise<void>;
    }
  | undefined
>(undefined);

export const ContentStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sdk = useSDK<PageAppSDK>();
  const [contentState, dispatch] = useReducer(sessionReducer, initialState);
  const [spaceStatus, setSpaceStatus] = useState<DEMAI_VALID | undefined>(); // Separate state for validation
  const [loadingState, setLoadingState] = useState<{
    [key in keyof ContentState]?: boolean;
  }>({});

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

    const params = sdk.parameters.installation as AppInstallationParameters;
    setLoadingState((prev) => ({ ...prev, [key]: true })); // Mark as loading

    switch (key) {
      case "contentTypes": {
        const client = createClient({
          accessToken: params.cma,
        });
        const space = await client.getSpace(sdk.ids.space);
        const environment = await space.getEnvironment(sdk.ids.environment);
        const contentTypes = await environment.getContentTypes();
        dispatch({ type: "SET_PROPERTY", key, payload: contentTypes });
        break;
      }
      case "tokens": {
        const tokens = await getLatestTokens(
          params.cma,
          sdk.ids.space,
          sdk.ids.environment,
          "jsonNested"
        );
        dispatch({ type: "SET_PROPERTY", key, payload: tokens });
        break;
      }
      case "css": {
        const tokens = await getLatestTokens(
          params.cma,
          sdk.ids.space,
          sdk.ids.environment,
          "css"
        );
        dispatch({ type: "SET_PROPERTY", key, payload: tokens });
        break;
      }
      case "components": {
        const components = await getComponents(
          params.cma,
          sdk.ids.space,
          sdk.ids.environment
        );
        dispatch({ type: "SET_PROPERTY", key, payload: components });
        break;
      }
      default:
        console.error(`Unknown property: ${key}`);
        return;
    }

    setLoadingState((prev) => ({ ...prev, [key]: false })); // Mark as not loading
  };

  // Separate function to validate space model
  const validateSpace = async () => {
    try {
      const params = sdk.parameters.installation as AppInstallationParameters;
      const validationResult = await validateDemAIContentModel(
        params.cma,
        sdk.ids.space,
        sdk.ids.environment
      );
      setSpaceStatus(validationResult);
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
