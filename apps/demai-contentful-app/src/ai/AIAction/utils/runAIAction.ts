import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../contexts/ErrorContext/ErrorContext";
import openAIChatCompletions, {
    OpenAIChatCompletionsProps,
} from "../../openAI/openAIChatCompletions";
import {
    OPEN_AI_MAX_TOKENS,
    OPEN_AI_TEMPERATURE,
    OPEN_AI_TOP_P,
} from "../../openAI/openAIConfig";
import { AIAction } from "../AIAction";
import { AIActionPhase, AIActionRunResults } from "../AIActionTypes";

export default async function runAIAction(
    aiAction: AIAction,
    contentState: ContentState,
    ignoreContextContent: boolean = false,
    addError: (err: AppError) => void,
    chain: boolean = false,
): Promise<AIActionRunResults> {
    let aiArg: OpenAIChatCompletionsProps | undefined;
    try {
        aiAction.updateSnapshot({
            startRunTime: Date.now(),
            isRunning: true,
            request: aiAction.createRequest(
                aiAction.userContent,
                aiAction.contextContentSelections,
                contentState,
                ignoreContextContent,
            ),
        });

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
        }

        // RUN
        console.log(`run[start][${aiAction.toolType}]:`, aiArg, tools);
        const aiResults = await openAIChatCompletions(aiArg);
        console.log(`run[end][${aiAction.toolType}]:`, aiResults, tools);

        aiAction.updateSnapshot({
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
    } catch (err) {
        addError({
            service: "AI Service Run",
            showDialog: true,
            message: `AIPromptEngine:run (ToolType: ${aiAction.toolType})`,
            details: `
    Error: ${err}
    
    Request: ${aiArg || "no aiArg"}
    `,
        });
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
