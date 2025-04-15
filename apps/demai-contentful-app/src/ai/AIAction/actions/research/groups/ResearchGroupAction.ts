import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { ResearchFromWebSiteEngine } from "../../../../AIPromptEngine/promptEngines/research/ResearchFromWebSiteEngine";
import { AIAction } from "../../../AIAction";
import { AIActionPhase, AIActionRunResults } from "../../../AIActionTypes";
import { ResearchFromWebSiteAction } from "../ResearchFromWebSiteAction";

export class ResearchGroupAction extends AIAction {
    static label = "Research Group";

    async runAnswerOrDescribe(
        contentState: ContentState,
        ignoreContextContent: boolean = false,
        addError: (err: AppError) => void,
        autoExecute: boolean = false,
    ): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };

        this.updateSnapshot({
            isRunning: true,
            request: "Run research group",
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        // const results = super.runAnswerOrDescribe(
        //     contentState,
        //     ignoreContextContent,
        //     addError,
        //     autoExecute,
        // );

        await this.runChildAction(
            ResearchFromWebSiteAction,
            {
                contextContentSelections: {
                    [ResearchFromWebSiteEngine.ACTION_RESEARCH_ID]:
                        ResearchFromWebSiteEngine.ACTION_RESEARCH_BRAND_DESCRIPTION,
                },
            },
            contentState,
            {
                ignoreContextContent: false,
                autoExecute: false,
            },
            addError,
            results,
        );

        await this.runChildAction(
            ResearchFromWebSiteAction,
            {
                contextContentSelections: {
                    [ResearchFromWebSiteEngine.ACTION_RESEARCH_ID]:
                        ResearchFromWebSiteEngine.ACTION_RESEARCH_BRAND_PRODUCT,
                },
            },
            contentState,
            {
                ignoreContextContent: false,
                autoExecute: false,
            },
            addError,
            results,
        );

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });
        return results;
    }
}
