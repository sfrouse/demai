import tokens from "@contentful/f36-tokens";
import { PromptAreas } from "../PromptAreaNavList";
import { Flex } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import ContentTypesContent from "./Content/ContentTypesContent";
import DSysTokensContent from "./Content/DSysTokensContent";

interface ContentPanelProps {
  navFocus: PromptAreas;
  sdk: PageAppSDK;
  invalidated: number; // increments after CTF content update
  invalidate: () => void;
}

const ContentPanel = ({
  navFocus,
  sdk,
  invalidated,
  invalidate,
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
      {navFocus === "content_model" ? (
        <ContentTypesContent
          sdk={sdk}
          invalidated={invalidated}
          invalidate={invalidate}
        />
      ) : null}
      {navFocus === "design_tokens" ? (
        <DSysTokensContent
          sdk={sdk}
          invalidated={invalidated}
          invalidate={invalidate}
        />
      ) : null}
    </Flex>
  );
};

export default ContentPanel;
