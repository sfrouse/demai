import React, { useMemo } from "react";
import { locations } from "@contentful/app-sdk";
import ConfigScreen from "./locations/config/ConfigScreen";
import Field from "./locations/other/Field";
import EntryEditor from "./locations/other/EntryEditor";
import Dialog from "./locations/other/Dialog";
import Sidebar from "./locations/other/Sidebar";
import Home from "./locations/other/Home";
import { useSDK } from "@contentful/react-apps-toolkit";
import Page from "./locations/page/Page";

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

  return Component ? <Component /> : null;
};

export default App;
