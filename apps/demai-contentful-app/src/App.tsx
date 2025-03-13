import React, { useMemo } from "react";
import { locations } from "@contentful/app-sdk";
import ConfigScreen from "./locations/ConfigScreen";
import Field from "./locations/Field";
import EntryEditor from "./locations/EntryEditor";
import Dialog from "./locations/Dialog";
import Sidebar from "./locations/Sidebar";
import Home from "./locations/Home";
import { useSDK } from "@contentful/react-apps-toolkit";
import Page from "./locations/page/Page";
import { PromptSessionProvider } from "./ai/_archive/promptSession/PromptSessionContext";

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_ENTRY_FIELD]: Field,
  [locations.LOCATION_ENTRY_EDITOR]: EntryEditor,
  [locations.LOCATION_DIALOG]: Dialog,
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
  [locations.LOCATION_PAGE]: Page,
  [locations.LOCATION_HOME]: Home,
};

const App = () => {
  const sdk = useSDK();

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(
      ComponentLocationSettings
    )) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? (
    <PromptSessionProvider>
      <Component />
    </PromptSessionProvider>
  ) : null;
};

export default App;
