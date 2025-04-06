import { Flex, Tabs } from "@contentful/f36-components";
import { COMP_DETAIL_NAVIGATION } from "../CompDetailContent";
import tokens from "@contentful/f36-tokens";
import EditablePage from "../EditablePage";
import useAIState from "../../../../../../contexts/AIStateContext/useAIState";

export default function WebComponentPanel(props: {
  localJavaScript: string;
  setLocalJavaScript: (e: string) => void;
  onSave?: () => void;
}) {
  const { localJavaScript, setLocalJavaScript, onSave } = props;
  const { route } = useAIState();
  return (
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
            onSave={onSave}
          />
        </div>
      </Flex>
    </Tabs.Panel>
  );
}
