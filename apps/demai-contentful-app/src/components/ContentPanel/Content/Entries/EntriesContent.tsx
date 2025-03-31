import React from "react";
import { Flex } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import tokens from "@contentful/f36-tokens";
// import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
// import useAIState from "../../../../contexts/AIStateContext/useAIState";

const EntriesContent = () => {
  // const { contentState, loadProperty, loadingState } = useContentStateSession();
  // const { invalidated, route, setRoute } = useAIState();
  // const [localInvalidated, setLocalInvalidated] = useState<number>(invalidated);

  return (
    <>
      <ContentPanelHeader title="Entries" invalidate />
      <Flex
        flexDirection="column"
        style={{ overflowY: "auto", padding: tokens.spacingL }}
      >
        todo...
      </Flex>
    </>
  );
};

export default EntriesContent;
