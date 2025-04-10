import {
  Badge,
  EntityStatus,
  EntityStatusBadge,
  Flex,
  IconButton,
  Text,
} from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import Divider from "../Divider";
import styles from "./DmaiContentRow.module.css";
import * as icons from "@contentful/f36-icons";

interface DmaiContentRowProps {
  title: string;
  id?: string;
  status?: EntityStatus | "none";
  description?: string;
  onClick?: () => void;
  badges?: { text: string; variant: "primary" | "secondary" }[];
  editOnClick?: () => void;
}

export default function DmaiContentRow({
  title,
  id,
  status,
  description,
  onClick,
  badges,
  editOnClick,
}: DmaiContentRowProps) {
  return (
    <Flex
      flexDirection="column"
      onClick={() => onClick && onClick()}
      className={styles.row}
      style={{}}
    >
      <Flex
        flexDirection="column"
        className={`${styles.content} ${onClick ? styles.isClick : ""}`}
        style={{
          padding: `${tokens.spacingS}`,
        }}
      >
        <Flex flexDirection="row" gap="spacingS">
          <Flex flexDirection="column" style={{ flex: 1 }}>
            <Flex flexDirection="row" alignItems="center">
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  height: 20, // ick
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: tokens.gray800,
                    fontSize: tokens.fontSizeL,
                  }}
                >
                  {title}
                </div>
              </div>
              {status && status !== "none" && (
                <EntityStatusBadge
                  key={`comp-badge-${id}`}
                  size="small"
                  style={{ marginLeft: 6 }}
                  entityStatus={status}
                />
              )}
            </Flex>
            {id && (
              <span
                key={`comp-id-${id}`}
                style={{
                  fontSize: 11,
                  color: tokens.gray600,
                }}
              >
                {" "}
                {id}
              </span>
            )}{" "}
            {description && (
              <Text
                fontSize="fontSizeS"
                style={{
                  color: tokens.gray700,
                  marginBottom: 4,
                }}
              >
                {description}
              </Text>
            )}
            {badges && (
              <Flex gap={tokens.spacingXs}>
                {badges.map((badge) => (
                  <Badge key={`${badge.text}-${id}`} variant={badge.variant}>
                    {badge.text}
                  </Badge>
                ))}
              </Flex>
            )}
          </Flex>
          {editOnClick && (
            <IconButton
              variant="transparent"
              aria-label="Open"
              size="small"
              onClick={(e: React.MouseEvent) => {
                editOnClick();
                e.stopPropagation();
              }}
              icon={<icons.EditIcon />}
            />
          )}
        </Flex>
      </Flex>
      <Divider />
    </Flex>
  );
}
