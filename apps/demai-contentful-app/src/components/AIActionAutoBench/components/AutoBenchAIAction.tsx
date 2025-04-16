import { Flex, IconButton } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { AIAction, useAIAction } from "../../../ai/AIAction/AIAction";
import { AIActionPhase } from "../../../ai/AIAction/AIActionTypes";
import LoadingIcon from "../../Loading/LoadingIcon";
import * as icons from "@contentful/f36-icons";
import useAIState from "../../../contexts/AIStateContext/useAIState";

const AutoBenchAIAction = ({ aiAction }: { aiAction: AIAction }) => {
    const { setInspectedAIAction } = useAIState();
    const aiActionSnapshot = useAIAction(aiAction);

    if (!aiActionSnapshot) return null;

    let bgColor = aiActionSnapshot.isRunning ? tokens.green100 : tokens.gray200;
    let foreColor = tokens.gray800;
    let iconVariant: icons.IconVariant = "muted";

    switch (aiActionSnapshot.phase) {
        case AIActionPhase.describing: {
            bgColor = aiActionSnapshot.isRunning
                ? tokens.green100
                : tokens.blue100;
            break;
        }
        case AIActionPhase.answered: {
            bgColor = aiActionSnapshot.isRunning
                ? tokens.green100
                : tokens.orange100;
            break;
        }
        case AIActionPhase.executed: {
            bgColor =
                aiActionSnapshot.errors.length > 0
                    ? tokens.colorWarning
                    : tokens.gray500;
            foreColor = tokens.colorWhite;
            iconVariant = "white";
            break;
        }
    }

    return (
        <Flex
            flexDirection="row"
            alignItems="center"
            key={aiAction.key}
            style={{
                padding: `${tokens.spacingS} ${tokens.spacingXs} ${tokens.spacingS} ${tokens.spacingM}`,
                borderRadius: tokens.borderRadiusSmall,
                color: foreColor,
                backgroundColor: bgColor,
                gap: tokens.spacingS,
            }}
        >
            <Flex flexDirection="column" style={{ flex: 1 }}>
                <div
                    style={{
                        flex: 1,
                        fontSize: tokens.fontSizeS,
                        lineHeight: tokens.lineHeightS,
                        fontWeight: tokens.fontWeightDemiBold,
                    }}
                >
                    {(aiAction.constructor as typeof AIAction).label}
                </div>
                {aiActionSnapshot.request && (
                    <div style={{ position: "relative", height: 12 }}>
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                fontSize: 11,
                                lineHeight: 1.2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: foreColor,
                            }}
                        >
                            {aiActionSnapshot.request}
                        </div>
                    </div>
                )}
            </Flex>
            <div style={{ fontSize: 10 }}>
                {aiActionSnapshot.isRunning ? (
                    <LoadingIcon />
                ) : (
                    aiActionSnapshot.phase
                )}
            </div>
            <IconButton
                size="small"
                variant="transparent"
                aria-label="Select the date"
                icon={<icons.InfoCircleIcon variant={iconVariant} />}
                onClick={() => {
                    setInspectedAIAction(aiAction);
                }}
            />
        </Flex>
    );
};

export default AutoBenchAIAction;
