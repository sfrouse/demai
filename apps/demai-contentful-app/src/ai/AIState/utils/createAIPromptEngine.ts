import { AIPromptEngine } from "../AIPromptEngine/AIPromptEngine";
import { ContentfulOpenToolingEngine } from "../AIPromptEngine/promptEngines/contentful/ContentfulOpenToolingEngine";
import { CreateContentTypeEngine } from "../AIPromptEngine/promptEngines/contentful/CreateContentTypeEngine";
import { EditContentTypeEngine } from "../AIPromptEngine/promptEngines/contentful/EditContentTypeEngine";
import { ChangeTokenColorSetEngine } from "../AIPromptEngine/promptEngines/designSystem/ChangeTokenColorSetEngine";
import { CreateBindingEngine } from "../AIPromptEngine/promptEngines/designSystem/CreateBindingEngine";
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
  BINDING = "binding",
  SPACE = "space",
  OPEN = "open",
  CONTENTFUL_OPEN_TOOL = "contentful",
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
    case AIPromptEngineID.BINDING: {
      return new CreateBindingEngine(aiState);
    }
    case AIPromptEngineID.CONTENTFUL_OPEN_TOOL: {
      return new ContentfulOpenToolingEngine(aiState);
    }
    default: {
      return new AIPromptEngine(aiState); // OpenEndedAIAction;
    }
  }
}
