import { PageAppSDK } from "@contentful/app-sdk";
import { DeleteGeneratedContentAction } from "../../../ai/AIAction/actions/contentful/DeleteGeneratedContentAction";
import { DeleteSystemContentAction } from "../../../ai/AIAction/actions/contentful/DeleteSystemContentAction";
import { ContentfulGroupAction } from "../../../ai/AIAction/actions/contentful/groups/ContentfulGroupAction";
import { DeleteAllContentGroupAction } from "../../../ai/AIAction/actions/contentful/groups/DeleteAllContentGroupAction";
import { ResearchGroupAction } from "../../../ai/AIAction/actions/research/groups/ResearchGroupAction";
import { AIAction } from "../../../ai/AIAction/AIAction";
import { AIActionConfig } from "../../../ai/AIAction/AIActionTypes";
import { AIStateRoute } from "../../../contexts/AIStateContext/AIStateRouting";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../contexts/ErrorContext/ErrorContext";
import { NAVIGATION } from "../../MainNav";
import { DesignSystemGroupAction } from "../../../ai/AIAction/actions/designSystem/groups/DesignSystemGroupAction";
import { ContentfulAssetsGroupAction } from "../../../ai/AIAction/actions/contentful/groups/ContentfulAssetsGroupAction";
import { DeleteGeneratedResearch } from "../../../ai/AIAction/actions/research/DeleteGeneratedResearch";

export default async function runGroup(
    groupId: string,
    setRoute: React.Dispatch<React.SetStateAction<AIStateRoute | undefined>>,
    aiActionConfig: AIActionConfig,
    getContentState: () => ContentState,
    loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setLocalAIAction: React.Dispatch<
        React.SetStateAction<AIAction | undefined>
    >,
    validateSpace: () => Promise<void>,
    addError: (err: AppError) => void,
    sdk: PageAppSDK,
) {
    let newLocalAIActionConstructor;
    let notifyFirst = false;
    let validateDemAI = false;
    switch (groupId) {
        case "research":
            notifyFirst = true;
            newLocalAIActionConstructor = ResearchGroupAction;
            setRoute({
                navigation: "research",
                aiActions: NAVIGATION["research"].aiActions,
                aiActionFocus: 0,
            });
            break;
        case "contentful":
            notifyFirst = true;
            newLocalAIActionConstructor = ContentfulGroupAction;
            setRoute({
                navigation: "content_model",
                aiActions: NAVIGATION["content_model"].aiActions,
                aiActionFocus: 0,
            });
            break;
        case "contentfulAssets": {
            newLocalAIActionConstructor = ContentfulAssetsGroupAction;
            setRoute({
                navigation: "assets",
                aiActions: NAVIGATION["assets"].aiActions,
                aiActionFocus: 0,
            });
            break;
        }
        case "designSystem":
            newLocalAIActionConstructor = DesignSystemGroupAction;
            setRoute({
                navigation: "design_tokens",
                aiActions: NAVIGATION["design_tokens"].aiActions,
                aiActionFocus: 0,
            });
            break;
        case "deleteGeneratedResearch":
            notifyFirst = true;
            newLocalAIActionConstructor = DeleteGeneratedResearch;
            break;
        case "deleteGenerated":
            notifyFirst = true;
            newLocalAIActionConstructor = DeleteGeneratedContentAction;
            break;
        case "deleteSystem":
            notifyFirst = true;
            validateDemAI = true;
            newLocalAIActionConstructor = DeleteSystemContentAction;
            break;
        case "deleteAll":
            notifyFirst = true;
            validateDemAI = true;
            newLocalAIActionConstructor = DeleteAllContentGroupAction;
            break;
    }

    if (newLocalAIActionConstructor) {
        const newLocalAIAction = new newLocalAIActionConstructor(
            aiActionConfig,
            getContentState,
            loadProperty,
        );
        if (notifyFirst) {
            const answer = await sdk.dialogs.openConfirm({
                title: "Delete Confirmation",
                message: "This will delete content, are you sure?",
            });
            if (answer === true) {
                setIsLoading(true);
                setLocalAIAction(newLocalAIAction);
                await newLocalAIAction.run(addError);
                if (validateDemAI) {
                    await validateSpace();
                }
                setIsLoading(false);
            }
        } else {
            setIsLoading(true);
            setLocalAIAction(newLocalAIAction);
            await newLocalAIAction.run(addError);
            setIsLoading(false);
        }
    } else {
        console.error("No action found for groupId:", groupId);
        addError({
            service: "runGroup",
            message: `No action found for groupId: ${groupId}`,
        });
    }
}
