import { Flex, Tabs } from "@contentful/f36-components";
import { COMP_DETAIL_NAVIGATION } from "../CompDetailContent";
import tokens from "@contentful/f36-tokens";
import EditablePage from "../EditablePage";
import useAIState from "../../../../../../contexts/AIStateContext/useAIState";

export default function CompDefinitionPanel(props: {
  localCDef: string;
  setLocalCDef: (e: string) => void;
  onSave?: () => void;
}) {
  const { localCDef, setLocalCDef, onSave } = props;
  const { route } = useAIState();
  return (
    <Tabs.Panel
      id={COMP_DETAIL_NAVIGATION.DEFINITION}
      forceMount
      style={{
        flex: 1,
        position: `relative`,
        display:
          route?.componentFocusId === COMP_DETAIL_NAVIGATION.DEFINITION
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
            language="json"
            value={localCDef}
            onChange={(e: string) => {
              setLocalCDef(e);
            }}
            onSave={onSave}
          />
        </div>
      </Flex>
    </Tabs.Panel>
  );
}
