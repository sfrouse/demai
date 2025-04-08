import { AIPromptEngineID } from "../../ai/AIPromptEngine/AIPromptEngineTypes";
import { COMP_DETAIL_NAVIGATION } from "../../components/ContentPanel/Content/Components/panels/CompDetailContent";
import { PromptAreas } from "../../components/MainNav";

export type AIStateRoute = {
  navigation: PromptAreas;
  contentTypeId?: string;
  componentId?: string;
  componentFocusId?: COMP_DETAIL_NAVIGATION;
  // ...
  aiStateEngines: AIPromptEngineID[];
  aiStateEngineFocus?: number;
};
