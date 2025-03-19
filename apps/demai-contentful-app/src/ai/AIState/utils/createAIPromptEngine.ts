import { AIPromptEngine } from "../AIPromptEngine/AIPromptEngine";
import { CreateContentTypeEngine } from "../AIPromptEngine/promptEngines/contentful/CreateContentTypeEngine";
import { EditContentTypeEngine } from "../AIPromptEngine/promptEngines/contentful/EditContentTypeEngine";
import { ChangeTokenColorSetEngine } from "../AIPromptEngine/promptEngines/designSystem/ChangeTokenColorSetEngine";
import { CreateComponentBindingEngine } from "../AIPromptEngine/promptEngines/designSystem/CreateComponentBindingEngine";
import { CreateComponentDefinitionEngine } from "../AIPromptEngine/promptEngines/designSystem/CreateComponentDefinitionEngine";
import { CreateWebComponentEngine } from "../AIPromptEngine/promptEngines/designSystem/CreateWebComponentEngine";
import AIState from "../AIState";

export enum AIPromptEngineID {
  RESEARCH = "research",
  CONTENT_MODEL = "content_model",
  EDIT_CONTENT_TYPE = "edit_content_type",
  PUBLISH_CONTENT_MODEL = "publish_content_model",
  ENTRIES = "entries",
  PERSONALIZATION = "personalization",
  DESIGN_TOKENS = "design_tokens",
  COMPONENT_DEFINITIONS = "component_definitions",
  WEB_COMPONENTS = "web_components",
  COMPONENT_BINDING = "component_binding",
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
    case AIPromptEngineID.COMPONENT_DEFINITIONS: {
      return new CreateComponentDefinitionEngine(aiState);
    }
    case AIPromptEngineID.WEB_COMPONENTS: {
      return new CreateWebComponentEngine(aiState);
    }
    case AIPromptEngineID.EDIT_CONTENT_TYPE: {
      return new EditContentTypeEngine(aiState);
    }
    case AIPromptEngineID.COMPONENT_BINDING: {
      return new CreateComponentBindingEngine(aiState);
    }
    default: {
      return new AIPromptEngine(aiState); // OpenEndedAIAction;
    }
  }
}
