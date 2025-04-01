import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { ContentType, createClient, Entry } from "contentful-management";
import * as contentful from "contentful";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import getLatestTokens from "./services/getLatestTokens";
import getComponents from "./services/getComponents";
import { AppInstallationParameters } from "../../locations/config/ConfigScreen";
import { IMCPClientValidation } from "../../ai/mcp/MCPClient";
import { DesignSystemMCPClient } from "../../ai/mcp/designSystemMCP/DesignSystemMCPClient";
import { ResearchMCP } from "../../ai/mcp/researchMCP/ResearchMCP";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../ai/mcp/researchMCP/validate/ctypes/demaiResearchCType";

// Define the shape of your session data
export interface ContentState {
  contentTypes?: ContentType[]; // Collection<ContentType, ContentTypeProps>;
  contentType?: ContentType;
  tokens?: any;
  css?: string;
  ai?: string;
  components?: Entry[];
  research?: {
    fields: {
      primaryColor: string;
      secondaryColor: string;
      tertiaryColor: string;
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
  const [cpa, setCpa] = useState<string>("");

  useEffect(() => {
    (async () => {
      const params = sdk.parameters.installation as AppInstallationParameters;
      const client = createClient({
        accessToken: params.cma,
      });
      const space = await client.getSpace(sdk.ids.space);
      const previewKeys = await space.getPreviewApiKeys();
      if (
        previewKeys &&
        previewKeys.items &&
        previewKeys.items[0] &&
        previewKeys.items[0].accessToken
      ) {
        setCpa(previewKeys.items[0].accessToken);
      } else {
        console.error("NO CPA KEY");
      }
    })();
  }, []);

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
    const params = sdk.parameters.installation as AppInstallationParameters;
    setLoadingState((prev) => ({ ...prev, [key]: true })); // Mark as loading

    const previewClient = cpa
      ? contentful.createClient({
          space: sdk.ids.space,
          environment: sdk.ids.environment,
          accessToken: cpa,
          host: "preview.contentful.com",
        })
      : undefined;

    switch (key) {
      case "contentTypes": {
        const client = createClient({
          accessToken: params.cma,
        });
        const space = await client.getSpace(sdk.ids.space);
        const environment = await space.getEnvironment(sdk.ids.environment);
        const contentTypes = await environment.getContentTypes();
        payload = contentTypes.items.sort((a, b) =>
          a.sys.id.localeCompare(b.sys.id)
        );
        break;
      }
      case "tokens": {
        // TODO: migrate to previewClient
        const tokens = await getLatestTokens(
          params.cma,
          sdk.ids.space,
          sdk.ids.environment,
          "jsonNested"
        );
        payload = tokens;
        break;
      }
      case "css": {
        // TODO: migrate to previewClient
        const css = await getLatestTokens(
          params.cma,
          sdk.ids.space,
          sdk.ids.environment,
          "css"
        );
        payload = css;
        break;
      }
      case "ai": {
        // TODO: migrate to previewClient
        const css = await getLatestTokens(
          params.cma,
          sdk.ids.space,
          sdk.ids.environment,
          "ai"
        );
        payload = css;
        break;
      }
      case "components": {
        // TODO: migrate to previewClient
        const components = await getComponents(
          params.cma,
          sdk.ids.space,
          sdk.ids.environment
        );
        payload = components;
        break;
      }
      case "research": {
        if (!previewClient) {
          payload = undefined;
        } else {
          const researchEntry = await previewClient.getEntry(
            DEMAI_RESEARCH_SINGLETON_ENTRY_ID
          );
          payload = researchEntry;
        }
        break;
      }
      default:
        console.error(`Unknown property: ${key}`);
        return;
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
        sdk.ids.environment
      );
      const dSysValidResult = await designSysMCP.validate();

      const researchMCP = new ResearchMCP(
        params.cma,
        sdk.ids.space,
        sdk.ids.environment
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
