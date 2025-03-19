import { AIPromptEngineID } from "../../ai/AIState/utils/createAIPromptEngine";
import { PromptAreas } from "../../components/PromptAreaNavList";

export type AIStateRoute = {
  navigation: PromptAreas;
  contentTypeId?: string;
  componentId?: string;
  // ...
  aiStateEngines: AIPromptEngineID[];
  aiStateEngineFocus?: number;
};
