import { AIAction } from "../../ai/AIAction/AIAction";
import { COMP_DETAIL_NAVIGATION } from "../../components/ContentPanel/Content/Components/panels/CompDetailContent";
import { PromptAreas } from "../../components/MainNav";

export type AIActionConstructor = new (...args: any[]) => AIAction;

export type AIStateRoute = {
    navigation: PromptAreas;
    contentTypeId?: string;
    componentId?: string;
    componentFocusId?: COMP_DETAIL_NAVIGATION;
    pageControllerSlug?: string;
    aiActions: AIActionConstructor[];
    aiActionFocus: number;
};
