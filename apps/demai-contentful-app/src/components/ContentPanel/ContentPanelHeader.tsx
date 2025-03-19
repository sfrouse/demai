import tokens from "@contentful/f36-tokens";
import { Flex, Heading, IconButton } from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import { ReactNode } from "react";
import Divider from "../Divider";
import { useAIState } from "../../contexts/AIStateContext/AIStateContext";

interface ContentPanelHeaderProps {
  title: string;
  invalidate?: boolean;
  goBack?: () => void;
  children?: ReactNode;
}

const ContentPanelHeader = ({
  title,
  invalidate = false,
  children,
  goBack,
}: ContentPanelHeaderProps) => {
  const { setInvalidated } = useAIState();
  return (
    <>
      <Flex flexDirection="row" alignItems="center">
        {goBack ? (
          <IconButton
            variant="transparent"
            aria-label="Select the date"
            icon={<icons.ArrowBackwardIcon />}
            onClick={() => goBack()}
          />
        ) : null}
        <Heading
          style={{
            paddingLeft: tokens.spacingXs,
            paddingRight: tokens.spacingXs,
            marginBottom: 0,
            flex: 1,
          }}
        >
          {title || "Unknown"}
        </Heading>
        <Flex flexDirection="row">{children}</Flex>
        {invalidate === true ? (
          <IconButton
            variant="transparent"
            aria-label="Select the date"
            icon={<icons.CycleIcon />}
            onClick={() => setInvalidated((p) => p + 1)}
          />
        ) : null}
      </Flex>
      <Divider />
    </>
  );
};

export default ContentPanelHeader;
