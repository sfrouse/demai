import { Flex, IconButton } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import LoadingIcon from "../../Loading/LoadingIcon";
import { DoneIcon, IconVariant } from "@contentful/f36-icons";
import { AIAction } from "../../../ai/AIAction/AIAction";
import {
    AIActionPhase,
    AIActionSnapshot,
} from "../../../ai/AIAction/AIActionTypes";
import useAIState from "../../../contexts/AIStateContext/useAIState";
import * as icons from "@contentful/f36-icons";

const AIActionDescriptionToolbar = ({
    aiAction,
    aiActionSnapshot,
}: {
    aiAction: AIAction;
    aiActionSnapshot: AIActionSnapshot;
}) => {
    const { setInspectedAIAction } = useAIState();
    let bgColor = aiActionSnapshot.isRunning ? tokens.green100 : tokens.gray100;
    let foreColor = tokens.gray800;
    let iconVariant: IconVariant = "muted";

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
        <div>
            <Flex
                flexDirection="row"
                alignContent="center"
                style={{
                    backgroundColor: bgColor,
                    color: foreColor,
                    padding: `${tokens.spacingS} ${tokens.spacingL}`,
                    height: 54,
                }}
            >
                {getStats(aiAction, aiActionSnapshot, foreColor, iconVariant)}
                <div style={{ flex: 1, minWidth: 30 }}></div>
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
        </div>
    );
};

const getStats = (
    aiAction: AIAction,
    aiActionSnapshot: AIActionSnapshot,
    foreColor: string,
    iconVariant: IconVariant,
) => {
    return (
        <Flex
            style={{
                color: foreColor,
                font: tokens.fontStackPrimary,
                fontSize: 10,
            }}
            flexDirection="row"
            alignItems="center"
            gap={tokens.spacing2Xs}
        >
            {aiActionSnapshot.isRunning ? (
                <LoadingIcon />
            ) : (
                <DoneIcon variant={iconVariant} />
            )}
            <span>
                {aiAction.constructor.name}, "{aiActionSnapshot.phase}",{" "}
                {aiActionSnapshot.isRunning ? "running" : "stopped"}
                {aiActionSnapshot.runTime &&
                    `, run: ${(aiActionSnapshot.runTime / 1000).toFixed(2)}s`}
                {aiActionSnapshot.executeRunTime &&
                    `, exe: ${(aiActionSnapshot.executeRunTime / 1000).toFixed(
                        2,
                    )}s`}
            </span>
        </Flex>
    );
};

export default AIActionDescriptionToolbar;
