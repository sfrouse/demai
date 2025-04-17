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
import { AIActionExecuteResults, AIActionPhase } from "../AIActionTypes";

export default async function runExeAIAction(
    aiAction: AIAction,
    contentState: ContentState,
    addError: (err: AppError) => void,
): Promise<AIActionExecuteResults> {
    // There are no tools in web search...
    if (aiAction.toolType === "WebSearch") {
        return {
            success: true,
            result: "Ran web search",
            // errors: ["Web search engine has no tool features."],
            toolCalls: [],
            toolResults: [],
        };
    }

    let aiArg: OpenAIChatCompletionsProps | undefined;
    try {
        aiAction.updateSnapshot({
            startExecutionRunTime: Date.now(),
            isRunning: true,
        });
        // API CHAT COMPLETETIONS
        let tools = await aiAction.getTools(aiAction.toolFilters);
        aiArg = {
            model: aiAction.model,
            openAIClient: aiAction.openAIClient,
            systemPrompt: aiAction.system,
            userPrompt: {
                role: "user",
                content: `
Please figure out a tool and all the appropriate properties that fulfills aiAction:

${aiAction.response}`,
            },
            prevMessages: [
                {
                    role: "user",
                    content: `${aiAction.request}`,
                },
            ],
            // prevMessages: prevState,
            max_tokens: OPEN_AI_MAX_TOKENS,
        };

        // TOOL DECISIONS
        aiArg = {
            ...aiArg,
            top_p: OPEN_AI_TOP_P,
            temperature: OPEN_AI_TEMPERATURE,
            tools,
            tool_choice: tools ? "required" : undefined,
        };

        // RUN
        const result = await openAIChatCompletions(aiArg);

        aiAction.updateSnapshot({
            runExeAIArg: aiArg,
            runExeAIResults: result,
        });

        const toolResults: any[] = [];
        if (result.toolCalls) {
            for (const toolCallRaw of result.toolCalls) {
                const processedToolCall = aiAction.preprocessToolRequest(
                    toolCallRaw,
                    addError,
                );
                const mcpClient =
                    aiAction.toolType === "DemAIDesignSystem"
                        ? aiAction.designSystemCMPClient
                        : aiAction.toolType === "Research"
                        ? aiAction.researchMCP
                        : aiAction.contentfulMCP;

                try {
                    // API CHAT COMPLETETIONS
                    const exeResult = await mcpClient?.callFunction(
                        processedToolCall.function.name,
                        JSON.parse(processedToolCall.function.arguments),
                    );
                    toolResults.push(exeResult);
                } catch (err) {
                    addError({
                        service: "AI/MCP Tool Execution",
                        message:
                            "Something went wrong while trying to execute the tool in the MCP.",
                        details: `
    Tool: ${JSON.stringify(processedToolCall, null, 2)}
                  
    Error: ${err}
    `,
                    });
                    aiAction.updateSnapshot({
                        executeRunTime:
                            Date.now() - aiAction.startExecutionRunTime!,
                        isRunning: false,
                        executionResponse: "Error",
                        phase: AIActionPhase.executed,
                        errors: [`${err}`],
                    });
                    await aiAction.postExeDataUpdates();
                    return {
                        success: false,
                        errors: [`${err}`],
                        toolCalls: [processedToolCall.function.name],
                        toolResults: [],
                    };
                }
            }
        }

        aiAction.updateSnapshot({
            executeRunTime: Date.now() - aiAction.startExecutionRunTime!,
            isRunning: false,
            phase: AIActionPhase.executed,
            executionResponse: `Executed: ${
                result.toolCalls
                    ? result.toolCalls
                          .map((toolCall) => toolCall.function.name)
                          .join(", ")
                    : "no tools called"
            }`,
            errors: [],
        });
        await aiAction.postExeDataUpdates();
        return {
            success: true,
            result: aiAction.executionResponse,
            toolCalls: result.toolCalls
                ? result.toolCalls.map((toolCall) => toolCall.function.name)
                : [],
            toolResults,
        };
    } catch (err) {
        console.error("AIAction: ", err);
        let aiArgStr = "Failed to parse";
        try {
            aiArgStr = JSON.stringify(aiArgStr, null, 2);
        } catch (err) {}
        addError({
            service: "AI Service runExe",
            showDialog: true,
            message: `AIAction:runExe (ToolType: ${aiAction.toolType})`,
            details: `
    Error: ${err}
    
    Request: ${aiArgStr}
    `,
        });
        aiAction.updateSnapshot({
            executeRunTime: Date.now() - aiAction.startExecutionRunTime!,
            isRunning: false,
            executionResponse: "Error",
            phase: AIActionPhase.executed,
            errors: [`${err}`],
        });
        await aiAction.postExeDataUpdates();
        return {
            success: false,
            errors: [`${err}`],
            toolCalls: [],
            toolResults: [],
        };
    }
}
