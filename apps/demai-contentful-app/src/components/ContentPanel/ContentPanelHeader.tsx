import tokens from "@contentful/f36-tokens";
import { Flex, Heading, IconButton } from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import { ReactNode } from "react";
import Divider from "../Divider";

interface ContentPanelHeaderProps {
  title: string;
  invalidate: () => void;
  children?: ReactNode;
}

const ContentPanelHeader = ({
  title,
  invalidate,
  children,
}: ContentPanelHeaderProps) => {
  return (
    <>
      <Flex flexDirection="row">
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
        <IconButton
          variant="transparent"
          aria-label="Select the date"
          icon={<icons.CycleIcon />}
          onClick={invalidate}
        />
      </Flex>
      <Divider />
    </>
  );
};

export default ContentPanelHeader;
