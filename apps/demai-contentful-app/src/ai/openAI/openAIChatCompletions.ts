import OpenAI from "openai";
import { AIModels } from "./openAIConfig";

export type OpenAIChatCompletionsProps = {
    openAIClient: OpenAI;
    systemPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam;
    userPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam;
    prevMessages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
    tool_choice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption;
    web_search_options?: OpenAI.Chat.Completions.ChatCompletionCreateParams.WebSearchOptions;
    model?: AIModels;
    max_tokens?: number;
    top_p?: number;
    temperature?: number;
};

export default async function openAIChatCompletions(
    params: OpenAIChatCompletionsProps,
) {
    const {
        openAIClient,
        systemPrompt,
        userPrompt,
        prevMessages = [],
        tools,
        tool_choice,
        model = AIModels.gpt4o,
        max_tokens,
        top_p,
        temperature,
        web_search_options,
    } = params;

    const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
            model,
            max_tokens,
            top_p,
            temperature,
            messages: [systemPrompt, ...prevMessages, userPrompt],
            tools,
            tool_choice,
            web_search_options,
        };

    const { data: stream } = await openAIClient.chat.completions
        .create(body)
        .withResponse();

    const description =
        stream.choices && stream.choices.length > 0
            ? stream.choices[0].message.content
            : "No description";
    const toolCalls =
        stream.choices && stream.choices.length > 0
            ? stream.choices[0].message.tool_calls
            : undefined;

    return {
        description,
        toolCalls,
    };
}
