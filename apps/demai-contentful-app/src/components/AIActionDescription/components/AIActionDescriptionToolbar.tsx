import { Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import LoadingIcon from "../../Loading/LoadingIcon";
import { DoneIcon, IconVariant } from "@contentful/f36-icons";
import Divider from "../../Divider";
import { AIAction } from "../../../ai/AIAction/AIAction";
import {
    AIActionPhase,
    AIActionSnapshot,
} from "../../../ai/AIAction/AIActionTypes";

const AIActionDescriptionToolbar = ({
    aiAction,
    aiActionSnapshot,
}: {
    aiAction: AIAction;
    aiActionSnapshot: AIActionSnapshot;
}) => {
    let bgColor = tokens.gray100;
    let foreColor = tokens.gray800;
    let iconVariant: IconVariant = "muted";

    switch (aiActionSnapshot.phase) {
        case AIActionPhase.describing: {
            bgColor = aiActionSnapshot.isRunning
                ? tokens.green100
                : tokens.blue100;
            break;
        }
        case AIActionPhase.executing: {
            bgColor = tokens.green100;
            break;
        }
        case AIActionPhase.answered: {
            bgColor = tokens.orange100;
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
                    padding: `${tokens.spacingM} ${tokens.spacingL}`,
                    height: 54,
                }}
            >
                {getStats(aiAction, aiActionSnapshot, foreColor, iconVariant)}
                <div style={{ flex: 1, minWidth: 30 }}></div>
            </Flex>
            <Divider style={{ margin: 0 }} />
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
                    `, ${(aiActionSnapshot.runTime / 1000).toFixed(2)}s`}
                {aiActionSnapshot.executeRunTime &&
                    ` / ${(aiActionSnapshot.executeRunTime / 1000).toFixed(
                        2,
                    )}s`}
            </span>
        </Flex>
    );
};

export default AIActionDescriptionToolbar;
