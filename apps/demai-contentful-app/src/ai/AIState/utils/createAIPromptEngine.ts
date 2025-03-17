import { AIPromptEngine } from "../AIPromptEngine/AIPromptEngine";
import { CreateContentTypeEngine } from "../AIPromptEngine/promptEngines/contentful/CreateContentTypeEngine";
import { ChangeTokenColorSetEngine } from "../AIPromptEngine/promptEngines/designSystem/ChangeTokenColorSetEngine";
import AIState from "../AIState";

export enum AIPromptEngineID {
  RESEARCH = "research",
  CONTENT_MODEL = "content_model",
  PUBLISH_CONTENT_MODEL = "publish_content_model",
  ENTRIES = "entries",
  PERSONALIZATION = "personalization",
  DESIGN_TOKENS = "design_tokens",
  COMPONENTS = "components",
  SPACE = "space",
  OPEN = "open",
  OPEN_TOOL = "open_tool",
}

export default function createAIPromptEngine(
  actionName: AIPromptEngineID,
  aiState: AIState
): AIPromptEngine {
  switch (actionName) {
    case AIPromptEngineID.CONTENT_MODEL: {
      return new CreateContentTypeEngine(aiState);
    }
    case AIPromptEngineID.DESIGN_TOKENS: {
      return new ChangeTokenColorSetEngine(aiState);
    }
    default: {
      return new AIPromptEngine(aiState); // OpenEndedAIAction;
    }
  }
}
