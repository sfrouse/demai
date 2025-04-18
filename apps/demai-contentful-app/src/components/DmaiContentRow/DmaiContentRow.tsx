import {
    Badge,
    EntityStatus,
    EntityStatusBadge,
    Flex,
    IconButton,
    Menu,
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
    imageUrl?: string;
    onClick?: () => void;
    badges?: { text: string; variant: "primary" | "secondary" }[];
    editOnClick?: () => void;
    deleteOnClick?: () => void;
    publishOnClick?: () => void;
    otherMenuItems?: React.ReactElement<typeof Menu.Item>[];
}

export default function DmaiContentRow({
    title,
    id,
    status,
    description,
    imageUrl,
    onClick,
    badges,
    editOnClick,
    deleteOnClick,
    publishOnClick,
    otherMenuItems = [],
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
                        <Flex
                            flexDirection="row"
                            alignItems="center"
                            style={{ gap: tokens.spacingXs }}
                        >
                            <Flex
                                flexDirection="column"
                                style={{
                                    flex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                    }}
                                >
                                    &nbsp;
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
                            </Flex>
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 3,
                                    }}
                                />
                            )}
                            {status && status !== "none" && (
                                <EntityStatusBadge
                                    key={`comp-badge-${id}`}
                                    size="small"
                                    style={{
                                        marginLeft: 6,
                                        minWidth: 68,
                                        justifyContent: "center",
                                    }}
                                    entityStatus={status}
                                />
                            )}
                        </Flex>

                        {badges && (
                            <Flex gap={tokens.spacingXs}>
                                {badges.map((badge) => (
                                    <Badge
                                        key={`${badge.text}-${id}`}
                                        variant={badge.variant}
                                    >
                                        {badge.text}
                                    </Badge>
                                ))}
                            </Flex>
                        )}
                    </Flex>
                    <Menu>
                        <Menu.Trigger>
                            <IconButton
                                variant="transparent"
                                size="small"
                                aria-label="Select the date"
                                style={{ maxHeight: 32 }}
                                icon={<icons.MoreHorizontalIcon />}
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                }}
                            />
                        </Menu.Trigger>
                        <Menu.List>
                            {editOnClick && (
                                <Menu.Item
                                    key={"edit"}
                                    onClick={(e: React.MouseEvent) => {
                                        editOnClick();
                                        e.stopPropagation();
                                    }}
                                >
                                    Edit
                                </Menu.Item>
                            )}
                            {deleteOnClick && (
                                <Menu.Item
                                    key={"delete"}
                                    onClick={(e: React.MouseEvent) => {
                                        deleteOnClick();
                                        e.stopPropagation();
                                    }}
                                >
                                    Delete
                                </Menu.Item>
                            )}
                            {publishOnClick && (
                                <Menu.Item
                                    key={"publish"}
                                    onClick={(e: React.MouseEvent) => {
                                        publishOnClick();
                                        e.stopPropagation();
                                    }}
                                >
                                    Publish
                                </Menu.Item>
                            )}
                            {otherMenuItems}
                        </Menu.List>
                    </Menu>
                </Flex>
            </Flex>
            <Divider />
        </Flex>
    );
}
