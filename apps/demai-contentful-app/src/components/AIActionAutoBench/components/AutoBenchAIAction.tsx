import { Flex, IconButton } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { AIAction, useAIAction } from "../../../ai/AIAction/AIAction";
import { AIActionPhase } from "../../../ai/AIAction/AIActionTypes";
import LoadingIcon from "../../Loading/LoadingIcon";
import * as icons from "@contentful/f36-icons";
import useAIState from "../../../contexts/AIStateContext/useAIState";
import Stopwatch from "../../Stopwatch/Stopwatch";

const AutoBenchAIAction = ({
    aiAction,
    corners = true,
}: {
    aiAction: AIAction;
    corners?: boolean;
}) => {
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
            style={{
                padding: `${tokens.spacingS} ${tokens.spacingXs} ${tokens.spacingS} ${tokens.spacingM}`,
                borderRadius: corners ? tokens.borderRadiusSmall : 0,
                color: foreColor,
                backgroundColor: bgColor,
                gap: tokens.spacingS,
            }}
        >
            <Flex flexDirection="column" style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: tokens.fontSizeS,
                        lineHeight: tokens.lineHeightS,
                        fontWeight: tokens.fontWeightDemiBold,
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
                            color: foreColor,
                        }}
                    >
                        {(aiAction.constructor as typeof AIAction).label}{" "}
                        <span style={{ fontSize: 10, fontWeight: "normal" }}>
                            {aiAction.constructor.name}
                        </span>
                    </div>
                </div>
                {aiActionSnapshot.request && (
                    <div
                        key={`${aiAction.key}-request`}
                        style={{
                            fontSize: 11,
                            lineHeight: `14px`,
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
                                color: foreColor,
                            }}
                        >
                            {aiActionSnapshot.request}
                        </div>
                    </div>
                )}
                <div
                    style={{
                        fontSize: 10,
                        lineHeight: `14px`,
                        fontStyle: "italic",
                    }}
                >
                    {aiActionSnapshot.phase}{" "}
                    {aiActionSnapshot.runTime &&
                        `run: ${(aiActionSnapshot.runTime / 1000).toFixed(0)}s`}
                    {aiActionSnapshot.executeRunTime &&
                        `, exe: ${(
                            aiActionSnapshot.executeRunTime / 1000
                        ).toFixed(0)}s`}
                </div>
            </Flex>
            <div>
                {/* <Stopwatch
                    startTime={aiActionSnapshot.startRunTime}
                    finalTime={aiActionSnapshot.runTime}
                /> */}
                {aiActionSnapshot.isRunning ? (
                    <Stopwatch
                        startTime={aiActionSnapshot.startRunTime}
                        finalTime={aiActionSnapshot.runTime}
                    />
                ) : // <LoadingIcon key={`${aiAction.key}-loading`} />
                null}
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
