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
import ProspectContent from "./Content/Research/ProspectContent";

const ContentPanel = () => {
  const { route } = useAIState();

  const renderContent = () => {
    switch (route?.navigation) {
      case "content_model":
        return route?.contentTypeId ? (
          <ContentTypeDetailContent />
        ) : (
          <ContentTypesContent />
        );
      case "design_tokens":
        return <DSysTokensContent />;
      case "components":
        return <ComponentsContent />;
      case "space":
        return <SpaceContent />;
      case "entries":
        return <EntriesContent />;
      case "research":
        return <ResearchContent />;
      case "prospect":
        return <ProspectContent />;
      default:
        return (
          <Flex
            style={{ width: "100%", height: "100%" }}
            justifyContent="center"
            alignItems="center"
          >
            no content found
          </Flex>
        );
    }
  };

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
      {renderContent()}
    </Flex>
  );
};

export default ContentPanel;
