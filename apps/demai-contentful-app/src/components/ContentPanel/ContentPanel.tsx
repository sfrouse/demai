import tokens from "@contentful/f36-tokens";
import { PromptAreas } from "../PromptAreaNavList";
import { Flex } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import DSysTokensContent from "./Content/DSysTokensContent";
import SettingsContent from "./Content/SettingsContent";
import ComponentsContent from "./Content/ComponentsContent";
import ContentModelContent from "./Content/ContentModel/ContentModelContent";

interface ContentPanelProps {
  navFocus: PromptAreas;
  sdk: PageAppSDK;
}

const ContentPanel = ({ navFocus, sdk }: ContentPanelProps) => {
  return (
    <Flex
      aria-label="Content Panel"
      flexDirection="column"
      style={{
        flex: 1,
        padding: 20,
        borderRight: `1px solid ${tokens.gray200}`,
      }}
    >
      {navFocus === "content_model" ? <ContentModelContent /> : null}
      {navFocus === "design_tokens" ? <DSysTokensContent /> : null}
      {navFocus === "components" ? <ComponentsContent /> : null}
      {navFocus === "settings" ? <SettingsContent /> : null}
    </Flex>
  );
};

export default ContentPanel;
