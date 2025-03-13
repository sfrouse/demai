import React, { useCallback, useState, useEffect } from "react";
import { ConfigAppSDK } from "@contentful/app-sdk";
import {
  Heading,
  Form,
  Flex,
  TextInput,
  FormControl,
} from "@contentful/f36-components";
import { css } from "emotion";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";

export interface AppInstallationParameters {
  cma: string;
  openai: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    cma: "",
    openai: "",
  });
  const sdk = useSDK<ConfigAppSDK>();

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();
    console.log("parameters", parameters);
    return {
      // Parameters to be persisted as the app configuration.
      parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null =
        await sdk.app.getParameters();

      console.log("currentParameters", currentParameters);
      if (currentParameters) {
        setParameters(currentParameters);
      }

      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex
      flexDirection="column"
      className={css({ margin: "80px", maxWidth: "800px" })}
    >
      <Form>
        <Heading>App Config</Heading>
        <FormControl isRequired isInvalid={!parameters.cma}>
          <FormControl.Label>CMA</FormControl.Label>
          <TextInput
            name="cmaToken"
            id="cmaToken"
            value={parameters.cma}
            onChange={(e) =>
              setParameters({ ...parameters, cma: e.target.value })
            }
            type="text"
          />
        </FormControl>
        <FormControl isRequired isInvalid={!parameters.openai}>
          <FormControl.Label>OpenAI</FormControl.Label>
          <TextInput
            name="openAI"
            id="openAI"
            value={parameters.openai}
            onChange={(e) =>
              setParameters({ ...parameters, openai: e.target.value })
            }
            type="password"
          />
        </FormControl>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
