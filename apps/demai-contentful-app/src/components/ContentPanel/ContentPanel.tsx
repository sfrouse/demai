import tokens from "@contentful/f36-tokens";
import { NAVIGATION, PromptAreas } from "../PromptAreaNavList";
import { Flex, Heading } from "@contentful/f36-components";
import Divider from "../Divider";
import { PageAppSDK } from "@contentful/app-sdk";
import ContentTypesContent from "./Content/ContentTypesContent";
import { AIActionState } from "../../ai/AIAction/AIActionTypes";

interface ContentPanelProps {
  navFocus: PromptAreas;
  sdk: PageAppSDK;
  aiActionState: AIActionState | undefined;
  invalidated: number; // increments after CTF content update
}

const ContentPanel = ({
  navFocus,
  sdk,
  aiActionState,
  invalidated,
}: ContentPanelProps) => {
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
      <Heading
        style={{
          paddingLeft: tokens.spacingXs,
          paddingRight: tokens.spacingXs,
          marginBottom: 0,
        }}
      >
        {NAVIGATION[navFocus]?.label || "Unknown"}
      </Heading>
      <Divider />
      {navFocus === "content_model" ? (
        <ContentTypesContent sdk={sdk} invalidated={invalidated} />
      ) : null}
    </Flex>
  );
};

export default ContentPanel;
