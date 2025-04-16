import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import { AIActionPhase, AIActionRunResults } from "../../../AIActionTypes";
import { ResearchFromWebSiteAction } from "../ResearchFromWebSiteAction";
import { StylesFromWebSiteAction } from "../StylesFromWebSiteAction";

export class ResearchGroupAction extends AIAction {
    static label = "Research Group";

    async runAnswerOrDescribe(
        addError: (err: AppError) => void,
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

        this.addChildActions([
            new StylesFromWebSiteAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
            ),
            new ResearchFromWebSiteAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
                {
                    contextContentSelections: {
                        [ResearchFromWebSiteAction.ACTION_RESEARCH_ID]:
                            ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_DESCRIPTION,
                    },
                },
            ),
            new ResearchFromWebSiteAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
                {
                    contextContentSelections: {
                        [ResearchFromWebSiteAction.ACTION_RESEARCH_ID]:
                            ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_PRODUCT,
                    },
                },
            ),
            new ResearchFromWebSiteAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
                {
                    contextContentSelections: {
                        [ResearchFromWebSiteAction.ACTION_RESEARCH_ID]:
                            ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_STYLE,
                    },
                },
            ),
            new ResearchFromWebSiteAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
                {
                    contextContentSelections: {
                        [ResearchFromWebSiteAction.ACTION_RESEARCH_ID]:
                            ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_TONE,
                    },
                },
            ),
        ]);

        await this.runAllChildren(addError, {
            ignoreContextContent: false,
            autoExecute: true, // false,
        });

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });
        return results;
    }
}
