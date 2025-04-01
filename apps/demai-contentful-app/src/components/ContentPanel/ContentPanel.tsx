import tokens from "@contentful/f36-tokens";
import { Flex } from "@contentful/f36-components";
import ContentTypesContent from "./Content/ContentModel/ContentTypesContent";
import SpaceContent from "./Content/SpaceContent";
import ComponentsContent from "./Content/Components/ComponentsContent";
import useAIState from "../../contexts/AIStateContext/useAIState";
import EntriesContent from "./Content/Entries/EntriesContent";
import DSysTokensContent from "./Content/DesignSystem/DSysTokensContent";
import ResearchContent from "./Content/Research/ResearchContent";
import ContentTypeDetailContent from "./Content/ContentModel/ContentTypeDetailContent";

const ContentPanel = () => {
  const { route } = useAIState();
  return (
    <Flex
      aria-label="Content Panel"
      flexDirection="column"
      style={{
        flex: 1,
        // padding: 20,
        borderRight: `1px solid ${tokens.gray200}`,
      }}
    >
      {route?.navigation === "content_model" ? (
        route?.contentTypeId ? (
          <ContentTypeDetailContent />
        ) : (
          <ContentTypesContent />
        )
      ) : null}
      {route?.navigation === "design_tokens" ? <DSysTokensContent /> : null}
      {route?.navigation === "components" ? <ComponentsContent /> : null}
      {route?.navigation === "space" ? <SpaceContent /> : null}
      {route?.navigation === "entries" ? <EntriesContent /> : null}
      {route?.navigation === "research" ? <ResearchContent /> : null}
    </Flex>
  );
};

export default ContentPanel;
