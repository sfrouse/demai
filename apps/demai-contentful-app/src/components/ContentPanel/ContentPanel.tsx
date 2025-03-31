import tokens from "@contentful/f36-tokens";
import { Flex } from "@contentful/f36-components";
import DSysTokensContent from "./Content/DSysTokensContent";
import ContentModelContent from "./Content/ContentModel/ContentModelContent";
import ContentTypeContent from "./Content/ContentModel/ContentTypeContent";
import SpaceContent from "./Content/SpaceContent";
import ComponentsContent from "./Content/Components/ComponentsContent";
import useAIState from "../../contexts/AIStateContext/useAIState";
import EntriesContent from "./Content/Entries/EntriesContent";

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
          <ContentTypeContent />
        ) : (
          <ContentModelContent />
        )
      ) : null}
      {route?.navigation === "design_tokens" ? <DSysTokensContent /> : null}
      {route?.navigation === "components" ? <ComponentsContent /> : null}
      {route?.navigation === "space" ? <SpaceContent /> : null}
      {route?.navigation === "entries" ? <EntriesContent /> : null}
    </Flex>
  );
};

export default ContentPanel;
