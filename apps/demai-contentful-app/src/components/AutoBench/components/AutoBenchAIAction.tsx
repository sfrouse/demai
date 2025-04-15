import { Flex, IconButton } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { AIAction, useAIAction } from "../../../ai/AIAction/AIAction";
import { AIActionPhase } from "../../../ai/AIAction/AIActionTypes";
import LoadingIcon from "../../Loading/LoadingIcon";
import * as icons from "@contentful/f36-icons";

const AutoBenchAIAction = ({ aiAction }: { aiAction: AIAction }) => {
    const aiActionSnapshot = useAIAction(aiAction);

    if (!aiActionSnapshot) return null;
    return (
        <Flex
            flexDirection="row"
            alignItems="center"
            key={aiAction.key}
            style={{
                padding: `${tokens.spacingXs} ${tokens.spacingS}`,
                borderRadius: tokens.borderRadiusSmall,
                color:
                    aiActionSnapshot.phase === AIActionPhase.done
                        ? tokens.colorWhite
                        : tokens.gray700,
                backgroundColor:
                    aiActionSnapshot.errors.length > 0
                        ? tokens.red200
                        : aiActionSnapshot.isRunning
                        ? tokens.blue200
                        : aiActionSnapshot.phase === AIActionPhase.prompting
                        ? tokens.gray200
                        : aiActionSnapshot.phase === AIActionPhase.done
                        ? tokens.blue900
                        : tokens.gray100,
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
                        }}
                    >
                        {aiActionSnapshot.response}
                    </div>
                </div>
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
                icon={<icons.InfoCircleIcon />}
            />
        </Flex>
    );
};

export default AutoBenchAIAction;
