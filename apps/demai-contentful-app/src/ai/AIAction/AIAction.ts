import { useSyncExternalStore } from "react";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import {
    AIActionConfig,
    AIActionContentFunction,
    AIActionContentPrefix,
    AIActionContextContentSelections,
    AIActionExecuteResults,
    AIActionPhase,
    AIActionPrompts,
    AIActionResponseContentFunction,
    AIActionRunResults,
    AIActionSnapshot,
    AIActionSystemPrompt,
} from "./AIActionTypes";
import * as icons from "@contentful/f36-icons";
import { ContentfulMCP } from "../mcp/contentfulMCP/ContentfulMCP";
import { DesignSystemMCPClient } from "../mcp/designSystemMCP/DesignSystemMCPClient";
import { ResearchMCP } from "../mcp/researchMCP/ResearchMCP";
import OpenAI from "openai";
import { AIModels } from "../openAI/openAIConfig";
import getOpeAIClient from "../openAI/getOpenAIClient";
import { AppError } from "../../contexts/ErrorContext/ErrorContext";
import { processContextContent } from "./utils/processContextContent";
import { nanoid } from "nanoid";
import runAIAction from "./utils/runAIAction";
import runExeAIAction from "./utils/runExeAIAction";
import { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";

export class AIAction {
    static label: string = "Open";

    key: string; // Unique key for React lists
    className: string = "AIAction";
    contentChangeEvent: () => void = () => {};
    isLoading: boolean = false;
    getContentState: () => ContentState;
    loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void;

    // --- UI Setup ----------------------------------------------------------------
    contextContent: (contentState: ContentState) => AIActionContentPrefix =
        () => [];
    content: AIActionContentFunction = () => `${this.userContent}`;
    introMessage: string = "Let's do something";
    placeholder: string = "This is an open ended prompt...ask me anything.";
    prompts: AIActionPrompts = {
        cancel: "Nope, Let's Rethink",
        run: "Yes, Create This",
        cancelIcon: icons.DeleteIcon,
        runIcon: icons.StarIcon,
    };
    executionPrompt: string = "";

    // --- AI Setup ----------------------------------------------------------------
    system: AIActionSystemPrompt = {
        role: "system",
        content:
            "You are an expert in Contentful, help this SE learn about Contentful demos.",
    };
    responseContent: AIActionResponseContentFunction = (response: string) =>
        `${response}`;

    // --- UI Content --------------------------------------------------------------
    userContent: string = "";
    request: string = "";
    response: string = "";
    executionResponse: string = "";
    contextContentSelections: AIActionContextContentSelections = {};
    phase: AIActionPhase = AIActionPhase.prompting;
    isRunning: boolean = false;
    errors: string[] = [];
    startRunTime: number | undefined;
    runTime: number | undefined;
    startExecutionRunTime: number | undefined;
    executeRunTime: number | undefined;
    childActions: AIAction[] = [];
    ignoreContextContent: boolean = false;
    autoExecute: boolean = false;

    // --- AI Clients --------------------------------------------------------------
    model: AIModels = AIModels.gpt4o;
    openAIClient: OpenAI;

    // --- TOOL CONFIG -------------------------------------------------------------
    toolType:
        | "DemAIDesignSystem"
        | "Contentful"
        | "WebSearch"
        | "Research"
        | "none" = "none";
    toolFilters: string[] = [];
    // -- MCPs
    contentfulMCP: ContentfulMCP | undefined;
    designSystemCMPClient: DesignSystemMCPClient | undefined;
    researchMCP: ResearchMCP | undefined;
    config: AIActionConfig;

    // --- AI RESULTS -------------------------------------------------------------
    runAIArg: {} | undefined;
    runAIResults:
        | {
              description: string | null;
              toolCalls: ChatCompletionMessageToolCall[] | undefined;
          }
        | undefined;
    runExeAIArg: {} | undefined;
    runExeAIResults:
        | {
              description: string | null;
              toolCalls: ChatCompletionMessageToolCall[] | undefined;
          }
        | undefined;

    // ======= useSyncExternalStore ==========
    private listeners = new Set<() => void>();

    subscribe = (cb: () => void) => {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    };

    protected notify() {
        for (const cb of Array.from(this.listeners)) cb();
    }
    private createSnapshot() {
        return {
            userContent: this.userContent,
            request: this.request,
            response: this.response,
            executionResponse: this.executionResponse,
            contextContentSelections: this.contextContentSelections,
            phase: this.phase,
            isRunning: this.isRunning,
            errors: this.errors,
            startRunTime: this.startRunTime,
            runTime: this.runTime,
            startExecutionRunTime: this.startExecutionRunTime,
            executeRunTime: this.executeRunTime,
            childActions: this.childActions,
            // local global settings
            ignoreContextContent: this.ignoreContextContent,
            autoExecute: this.autoExecute,
            runAIArg: this.runAIArg,
            runAIResults: this.runAIResults,
            runExeAIArg: this.runExeAIArg,
            runExeAIResults: this.runExeAIResults,
            isLoading: this.isLoading,
        };
    }

    updateSnapshot(updates?: Partial<AIActionSnapshot>) {
        if (!updates) return;
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                (this as any)[key] = value;
            }
        }
        this._snapshot = this.createSnapshot();
        this.notify();
    }

    private _snapshot = this.createSnapshot();

    getSnapshot = () => this._snapshot;
    // ======= useSyncExternalStore ==========

    constructor(
        config: AIActionConfig,
        resetContentState: () => void,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        this.key = nanoid();
        this.config = config;
        this.contentChangeEvent = resetContentState;
        this.getContentState = getContentState;
        this.loadProperty = loadProperty;
        this.openAIClient = getOpeAIClient(this.config.openAiApiKey);
        this.designSystemCMPClient = new DesignSystemMCPClient(
            this.config.cma,
            this.config.spaceId,
            this.config.environmentId,
            this.config.cpa,
        );
        this.contentfulMCP = new ContentfulMCP(
            this.config.cma,
            this.config.spaceId,
            this.config.environmentId,
            this.config.cpa,
        );
        this.researchMCP = new ResearchMCP(
            this.config.cma,
            this.config.spaceId,
            this.config.environmentId,
            this.config.cpa,
        );

        if (snapshotOverrides) {
            this.updateSnapshot(snapshotOverrides);
        }

        this._loadNeededData();
    }

    private async _loadNeededData() {
        this.updateSnapshot({
            isLoading: true,
        });
        await this.loadNeededData();

        this.updateSnapshot({
            isLoading: false,
        });
    }

    async loadNeededData() {}

    async run(
        addError: (err: AppError) => void,
        snapshotOverrides: Partial<AIActionSnapshot> = {},
    ) {
        if (
            // forceExecution === true ||
            this.phase === AIActionPhase.describing
        ) {
            return this.runExe(addError);
        } else {
            return this.runAnswerOrDescribe(addError, snapshotOverrides);
        }
    }

    async runAnswerOrDescribe(
        addError: (err: AppError) => void,
        snapshotOverrides: Partial<AIActionSnapshot> = {},
    ): Promise<AIActionRunResults> {
        this.updateSnapshot(snapshotOverrides);
        await this._loadNeededData();
        const contentState = this.getContentState();

        const runResults = await runAIAction(
            this,
            contentState,
            addError,
            snapshotOverrides,
        );
        if (this.autoExecute) {
            if (runResults.success) {
                this.updateSnapshot({
                    response: this.responseContent(
                        `${runResults.result}`,
                        contentState,
                    ),
                });
                const runExeResults = await this.runExe(addError);
                return runExeResults;
            }
            return runResults;
        }
        return runResults;
    }

    async runExe(
        addError: (err: AppError) => void,
        snapshotOverrides: Partial<AIActionSnapshot> = {},
    ): Promise<AIActionExecuteResults> {
        this.updateSnapshot(snapshotOverrides);
        await this._loadNeededData();
        const contentState = this.getContentState();
        const exeResults = await runExeAIAction(this, contentState, addError);
        return exeResults;
    }

    // ==== GROUPS =======================
    addChildActions(childActions: AIAction[]) {
        this.updateSnapshot({
            childActions: [...this.childActions, ...childActions],
        });
    }

    async runChildAction(
        childAIAction: AIAction,
        addError: (err: AppError) => void,
        snapshotOverrides: Partial<AIActionSnapshot> = {},
    ) {
        this.updateSnapshot({
            childActions: [...this.childActions, childAIAction],
        });
        childAIAction.contentChangeEvent = this.contentChangeEvent;
        await childAIAction.runAnswerOrDescribe(addError, snapshotOverrides);
    }

    async runExeChildAction(
        childAIAction: AIAction,
        addError: (err: AppError) => void,
        snapshotOverrides: Partial<AIActionSnapshot> = {},
    ) {
        this.updateSnapshot({
            childActions: [...this.childActions, childAIAction],
        });
        childAIAction.contentChangeEvent = this.contentChangeEvent;
        await childAIAction.runExe(addError, snapshotOverrides);
    }

    async runAllChildren(
        addError: (err: AppError) => void,
        snapshotOverrides: Partial<AIActionSnapshot> = {},
    ) {
        for (const childAIAction of this.childActions) {
            childAIAction.contentChangeEvent = this.contentChangeEvent;
            await childAIAction.runAnswerOrDescribe(
                addError,
                snapshotOverrides,
            );
            this.contentChangeEvent();
        }
    }

    async runExeAllChildren(
        addError: (err: AppError) => void,
        snapshotOverrides: Partial<AIActionSnapshot> = {},
    ) {
        for (const childAIAction of this.childActions) {
            childAIAction.contentChangeEvent = this.contentChangeEvent;
            await childAIAction.runExe(addError, snapshotOverrides);
        }
    }
    // ====== GROUPS ====================

    preprocessToolRequest(
        tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
        addError: (err: AppError) => void,
    ): OpenAI.Chat.Completions.ChatCompletionMessageToolCall {
        return tool;
    }

    createRequest(
        contentState: ContentState,
        ignoreContextContent: boolean = false,
    ): string {
        if (ignoreContextContent) {
            return this.content ? this.content(contentState) : "";
        }

        // Figure out selections, defaults and UI updates
        const defaultSelections =
            this.getContextContentSelectionDefaults(contentState);
        this.updateSnapshot({
            contextContentSelections: {
                ...defaultSelections,
                ...this.contextContentSelections,
            },
        });

        // Get final context prompt
        const contextPrompt = processContextContent(
            this.contextContent(contentState),
            this.contextContentSelections,
        );

        // user prompt can still be augmented...
        const content = this.content ? this.content(contentState) : "";
        return [...contextPrompt, content].join(" ");
    }

    getContextContentSelectionDefaults(
        contentState: ContentState,
        selections: AIActionContextContentSelections = {},
        path?: AIActionContentPrefix,
    ) {
        const contentPrefixes = path || this.contextContent(contentState);
        contentPrefixes.forEach((item) => {
            if (typeof item === "string") {
                return; // Skip plain strings
            }

            // Store default value for the select item
            selections[item.id] = item.defaultValue;

            // Recursively process paths if they exist
            if (item.paths) {
                item.paths.forEach((path) => {
                    this.getContextContentSelectionDefaults(
                        contentState,
                        selections,
                        path,
                    );
                });
            }
        });

        return selections;
    }

    async getTools(toolFilters?: string[]) {
        let tools;
        switch (this.toolType) {
            case "DemAIDesignSystem": {
                tools = await this.designSystemCMPClient!.getToolsForOpenAI();
                break;
            }
            case "Contentful": {
                tools = await this.contentfulMCP!.getToolsForOpenAI();
                break;
            }
            case "Research": {
                tools = await this.researchMCP!.getToolsForOpenAI();
                break;
            }
            case "WebSearch": {
                break;
            }
        }

        if (tools && toolFilters && toolFilters.length > 0) {
            tools = tools.filter((tool) =>
                tool.type === "function" &&
                this.toolFilters.includes(tool.function.name)
                    ? true
                    : false,
            );
        }
        return tools;
    }

    redo() {
        this.updateSnapshot({
            phase: AIActionPhase.prompting,
            isRunning: false,
            executionResponse: "",
            response: "",
            request: "",
            childActions: [],
            errors: [],
        });
    }

    reset() {
        this.updateSnapshot({
            userContent: "",
            contextContentSelections: {},
            phase: AIActionPhase.prompting,
            isRunning: false,
            executionResponse: "",
            response: "",
            request: "",
            childActions: [],
            errors: [],
        });
    }
}

export function useAIAction(aiAction?: AIAction) {
    return useSyncExternalStore(
        aiAction?.subscribe ?? (() => () => {}),
        aiAction?.getSnapshot ?? (() => undefined),
    );
}
