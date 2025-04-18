import { ImageGenerateParams } from "openai/resources/images.mjs";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../contexts/ErrorContext/ErrorContext";
import openAIChatCompletions, {
    OpenAIChatCompletionsProps,
} from "../../openAI/openAIChatCompletions";
import {
    AIModels,
    OPEN_AI_MAX_TOKENS,
    OPEN_AI_TEMPERATURE,
    OPEN_AI_TOP_P,
} from "../../openAI/openAIConfig";
import { AIAction } from "../AIAction";
import {
    AIActionPhase,
    AIActionRunResults,
    AIActionSnapshot,
} from "../AIActionTypes";

export default async function runAIAction(
    aiAction: AIAction,
    contentState: ContentState,
    addError: (err: AppError) => void,
    snapshotOverrides: Partial<AIActionSnapshot> = {},
): Promise<AIActionRunResults> {
    let aiArg: OpenAIChatCompletionsProps | undefined;
    try {
        aiAction.updateSnapshot(snapshotOverrides);
        aiAction.updateSnapshot({
            startRunTime: Date.now(),
            isRunning: true,
            request: aiAction.createRequest(
                contentState,
                aiAction.ignoreContextContent,
            ),
        });

        if (aiAction.model === AIModels.dalle3) {
            return runImages(aiAction, contentState);
        } else {
            // API CHAT COMPLETETIONS
            let tools = await aiAction.getTools(aiAction.toolFilters);
            aiArg = {
                model: aiAction.model,
                openAIClient: aiAction.openAIClient,
                systemPrompt: aiAction.system,
                userPrompt: {
                    role: "user",
                    content: `${aiAction.request}`,
                },
                // prevMessages: prevState,
                max_tokens: OPEN_AI_MAX_TOKENS,
            };
            if (aiAction.toolType !== "WebSearch") {
                aiArg = {
                    ...aiArg,
                    top_p: OPEN_AI_TOP_P,
                    temperature: OPEN_AI_TEMPERATURE,
                    tools,
                    tool_choice: tools ? "none" : undefined,
                };
            } else {
                aiArg = {
                    ...aiArg,
                    web_search_options: {},
                };
            } // RUN
            const aiResults = await openAIChatCompletions(aiArg);
            aiAction.updateSnapshot({
                runAIArg: aiArg,
                runAIResults: aiResults,
                runTime: Date.now() - aiAction.startRunTime!,
                isRunning: false,
                phase:
                    aiAction.toolType === "none"
                        ? AIActionPhase.answered
                        : AIActionPhase.describing,
                errors: [],
                response: aiAction.responseContent(
                    `${aiResults.description}`,
                    contentState,
                ),
            });
            return {
                success: true,
                result: `${aiResults.description}`,
            };
        }
    } catch (err) {
        addError({
            service: "AI Service Run",
            showDialog: true,
            message: `AIAction:run (ToolType: ${aiAction.toolType})`,
            details: `
    Error: ${err}
    
    Request: ${aiArg || "no aiArg"}
    `,
        });
        console.error(err);
        aiAction.updateSnapshot({
            runTime: Date.now() - aiAction.startRunTime!,
            isRunning: false,
            phase: AIActionPhase.prompting,
            errors: [`${err}`],
            response: aiAction.responseContent(`Error.`, contentState),
        });
        return {
            success: false,
            errors: [`${err}`],
        };
    }
}

async function runImages(
    aiAction: AIAction,
    contentState: ContentState,
): Promise<AIActionRunResults> {
    const imgArgs: ImageGenerateParams = {
        model: aiAction.model,
        prompt: `${aiAction.request}`,
        n: 1,
        size: "1024x1024",
        response_format: "url",
    };
    const aiResults = await aiAction.openAIClient.images.generate(imgArgs);

    const result = `
Created asset.

<img src="${aiResults?.data[0].url}" alt="${aiResults?.data[0].revised_prompt}" width="200" height="200"/>
    
Revised prompt: ${aiResults?.data[0].revised_prompt}

`;
    aiAction.updateSnapshot({
        runAIArg: imgArgs,
        runAIResults: aiResults as any,
        runTime: Date.now() - aiAction.startRunTime!,
        isRunning: false,
        phase: AIActionPhase.describing,
        errors: [],
        response: aiAction.responseContent(result, contentState),
    });
    return {
        success: true,
        result,
    };
}
