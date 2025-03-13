import tokens from "@contentful/f36-tokens";
import { NAVIGATION, PromptAreas } from "../PromptAreaNavList";
import { Flex, Heading, IconButton } from "@contentful/f36-components";
import Divider from "../Divider";
import { PageAppSDK } from "@contentful/app-sdk";
import ContentTypesContent from "./Content/ContentTypesContent";
import { AIActionState } from "../../ai/AIAction/AIActionTypes";
import * as icons from "@contentful/f36-icons";

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
      <Flex flexDirection="row">
        <Heading
          style={{
            paddingLeft: tokens.spacingXs,
            paddingRight: tokens.spacingXs,
            marginBottom: 0,
            flex: 1,
          }}
        >
          {NAVIGATION[navFocus]?.label || "Unknown"}
        </Heading>
        <IconButton
          variant="transparent"
          aria-label="Select the date"
          icon={<icons.CycleIcon />}
          onClick={invalidate}
        />
      </Flex>
      <Divider />
      {navFocus === "content_model" ? (
        <ContentTypesContent sdk={sdk} invalidated={invalidated} />
      ) : null}
    </Flex>
  );
};

export default ContentPanel;
