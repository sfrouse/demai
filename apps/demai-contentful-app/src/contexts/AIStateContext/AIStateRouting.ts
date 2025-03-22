import { AIPromptEngineID } from "../../ai/AIState/utils/createAIPromptEngine";
import { PromptAreas } from "../../components/MainNav";

export type AIStateRoute = {
  navigation: PromptAreas;
  contentTypeId?: string;
  componentId?: string;
  componentFocusId?: number;
  // ...
  aiStateEngines: AIPromptEngineID[];
  aiStateEngineFocus?: number;
};
