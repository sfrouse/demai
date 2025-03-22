import { Flex, Tabs } from "@contentful/f36-components";
import { useAIState } from "../../../../../contexts/AIStateContext/AIStateContext";
import { useContentStateSession } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import ContentPanelHeader from "../../../ContentPanelHeader";
import { NAVIGATION } from "../../../../MainNav";
import { AIPromptEngineID } from "../../../../../ai/AIState/utils/createAIPromptEngine";
import tokens from "@contentful/f36-tokens";
import LoadingIcon from "../../../../LoadingIcon";

export default function CompDetailContent() {
  const { contentState, loadProperty, loadingState } = useContentStateSession();
  const { invalidated, setRoute, route } = useAIState();

  const isLoading =
    loadingState.components === true ||
    loadingState.ai === true ||
    loadingState.contentTypes === true;

  const comp = contentState.components?.find(
    (comp) => comp.sys.id === route?.componentId
  );

  console.log("comp", comp);
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
          });
        }}
      />
      {isLoading ? (
        <LoadingIcon />
      ) : (
        <Tabs
          currentTab={`${route?.componentFocusId}`}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
          onTabChange={(tab: string) => {
            const index = parseInt(tab);
            setRoute({
              navigation: "components",
              componentId: comp.sys.id,
              componentFocusId: index,
              aiStateEngines: [AIPromptEngineID.OPEN],
            });
          }}
        >
          <Tabs.List>
            <Tabs.Tab panelId={`${0}`}>Definition</Tabs.Tab>
            <Tabs.Tab panelId={`${2}`}>Web Comp</Tabs.Tab>
            <Tabs.Tab panelId={`${3}`}>Bindings</Tabs.Tab>
            <Tabs.Tab panelId={`${1}`}>Preview</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id={`${0}`} style={{ flex: 1, position: `relative` }}>
            <Flex
              flexDirection="column"
              style={{
                backgroundColor: tokens.gray900,
                color: tokens.colorWhite,
                fontSize: tokens.fontSizeS,
                padding: tokens.spacingM,
                overflowY: "auto",
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <pre>
                {comp.fields.componentDefinition &&
                  JSON.stringify(
                    comp.fields.componentDefinition["en-US"],
                    null,
                    2
                  )}
              </pre>
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel id={`${1}`}>Browser</Tabs.Panel>
          <Tabs.Panel id={`${2}`} style={{ flex: 1, position: `relative` }}>
            <Flex
              flexDirection="column"
              style={{
                backgroundColor: tokens.gray900,
                color: tokens.colorWhite,
                fontSize: tokens.fontSizeS,
                padding: tokens.spacingM,
                overflowY: "auto",
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <pre>
                {comp.fields.javascript && comp.fields.javascript["en-US"]}
              </pre>
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel id={`${3}`} style={{ flex: 1, position: `relative` }}>
            <Flex
              flexDirection="column"
              style={{
                backgroundColor: tokens.gray900,
                color: tokens.colorWhite,
                fontSize: tokens.fontSizeS,
                padding: tokens.spacingM,
                overflowY: "auto",
                position: `absolute`,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <pre>
                {comp.fields.bindings &&
                  JSON.stringify(comp.fields.bindings["en-US"], null, 2)}
              </pre>
            </Flex>
          </Tabs.Panel>
        </Tabs>
      )}
    </>
  );
}
