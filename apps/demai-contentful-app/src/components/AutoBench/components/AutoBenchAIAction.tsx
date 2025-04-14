import { Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { AIAction, useAIAction } from "../../../ai/AIAction/AIAction";
import { AIActionPhase } from "../../../ai/AIAction/AIActionTypes";
import LoadingIcon from "../../Loading/LoadingIcon";

const AutoBenchAIAction = ({ aiAction }: { aiAction: AIAction }) => {
    const aiActionSnapshot = useAIAction(aiAction);
    return (
        <Flex
            flexDirection="column"
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
            }}
        >
            <Flex flexDirection="row" alignItems="center">
                <div
                    style={{
                        flex: 1,
                        fontSize: tokens.fontSizeS,
                        lineHeight: tokens.lineHeightS,
                        fontWeight: tokens.fontWeightDemiBold,
                    }}
                >
                    {aiAction.name}
                </div>
                <div style={{ fontSize: 10 }}>
                    {aiActionSnapshot.isRunning ? (
                        <LoadingIcon />
                    ) : (
                        aiActionSnapshot.phase
                    )}
                </div>
            </Flex>
            <div style={{ fontSize: 11, lineHeight: 1.2 }}>
                {aiActionSnapshot.response.substring(0, 100)}
                {aiActionSnapshot.response.length > 100 ? "..." : ""}
            </div>
        </Flex>
    );
};

export default AutoBenchAIAction;
