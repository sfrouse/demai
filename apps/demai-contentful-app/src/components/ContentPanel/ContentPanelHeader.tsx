import tokens from "@contentful/f36-tokens";
import {
  EntityStatusBadge,
  Flex,
  Heading,
  IconButton,
} from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import { ReactNode } from "react";
import Divider from "../Divider";
import useAIState from "../../contexts/AIStateContext/useAIState";

interface ContentPanelHeaderProps {
  title: string;
  secondaryTitle?: string;
  status?: "archived" | "published" | "draft" | "none";
  invalidate?: boolean;
  goBack?: () => void;
  children?: ReactNode;
}

const ContentPanelHeader = ({
  title,
  secondaryTitle,
  status,
  invalidate = false,
  children,
  goBack,
}: ContentPanelHeaderProps) => {
  const { setInvalidated } = useAIState();
  return (
    <Flex
      flexDirection="column"
      style={{
        height: 64,
        boxSizing: "border-box",
      }}
    >
      <Flex
        flexDirection="row"
        alignItems="center"
        style={{
          padding: `0 ${tokens.spacingM}`,
          paddingBottom: 0,
          height: 66,
        }}
      >
        {goBack ? (
          <IconButton
            variant="transparent"
            aria-label="Select the date"
            icon={<icons.ArrowBackwardIcon />}
            onClick={() => goBack()}
          />
        ) : null}
        <Flex alignItems="baseline" gap={tokens.spacingXs}>
          <Heading
            style={{
              fontSize: "1.15em", // tokens.fontSizeXl,
              paddingLeft: tokens.spacingXs,
              paddingRight: tokens.spacingXs,
              paddingTop: 4,
              marginBottom: 0,
            }}
          >
            {title || "Unknown"}
          </Heading>
          {status && status !== "none" && (
            <EntityStatusBadge size="small" entityStatus={status} />
          )}
          {secondaryTitle && (
            <div style={{ fontSize: "0.8em", color: tokens.gray600 }}>
              {secondaryTitle}
            </div>
          )}
        </Flex>
        <div style={{ flex: 1 }}></div>
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
      <Divider style={{ marginTop: 0 }} />
    </Flex>
  );
};

export default ContentPanelHeader;
