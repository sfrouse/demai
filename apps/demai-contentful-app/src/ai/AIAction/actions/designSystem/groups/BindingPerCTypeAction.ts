import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../../../AIActionTypes";
import { CreateBindingAction } from "../CreateBindingAction";

export class BindingPerCTypeAction extends AIAction {
    static label = "Binding Per CType/Comp";

    async loadNeededData() {
        await this.loadProperty("contentTypes");
        await this.loadProperty("components");
    }

    // async postExeDataUpdates(): Promise<void> {
    //     await this.loadProperty("components", true);
    // }

    async run(addError: (err: AppError) => void): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };

        this.updateSnapshot({
            isRunning: true,
            request: "Run contentful group",
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        // need the latest
        const contentState = this.getContentState();
        const ctypes = contentState.contentTypes;
        const comps = contentState.components;

        if (!ctypes || !comps) {
            return results;
        }

        let children: AIAction[] = [];
        let childrenByComp: { [key: string]: AIAction[] } = {};

        if (ctypes) {
            comps.forEach((comp) => {
                const actionsForComp: AIAction[] = [];
                ctypes.forEach((ctype) => {
                    const action = new CreateBindingAction(
                        this.config,
                        this.getContentState,
                        this.loadProperty,
                        {
                            contextContentSelections: {
                                [CreateBindingAction.BINDING_COMPONENT_ACTION]:
                                    comp.sys.id,
                                [CreateBindingAction.BINDING_CTYPE_ACTION]:
                                    ctype.sys.id,
                            },
                        },
                    );

                    actionsForComp.push(action);
                    children.push(action);
                });

                childrenByComp[comp.sys.id] = actionsForComp;
            });
        }

        this.addChildActions(children);

        // ✅ Run each component group in parallel, but ctype actions sequentially
        await Promise.all(
            Object.values(childrenByComp).map(async (group) => {
                for (const action of group) {
                    await action.runAnswerOrDescribe(addError, {
                        ignoreContextContent: false,
                        autoExecute: true,
                    });
                }
            }),
        );

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });
        return results;
    }

    async runAnswerOrDescribe(
        addError: (err: AppError) => void,
    ): Promise<AIActionRunResults> {
        return this.run(addError);
    }

    async runExe(
        addError: (err: AppError) => void,
    ): Promise<AIActionExecuteResults> {
        const runResults = await this.run(addError);
        return {
            ...runResults,
            toolCalls: [],
            toolResults: [],
        };
    }
}
