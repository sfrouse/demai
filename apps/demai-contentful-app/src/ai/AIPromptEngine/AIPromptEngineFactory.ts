import { AIPromptEngine } from "./AIPromptEngine";
import { CreateContentTypeEngine } from "./promptEngines/contentful/CreateContentTypeEngine";
import { CreateEntryEngine } from "./promptEngines/contentful/CreateEntryEngine";
import { ChangeTokenColorSetEngine } from "./promptEngines/designSystem/ChangeTokenColorSetEngine";
import { CreateComponentDefinitionEngine } from "./promptEngines/designSystem/CreateComponentDefinitionEngine";
import { EditComponentEngine } from "./promptEngines/designSystem/EditComponentEngine";
import { SaveBrandColorsEngine } from "./promptEngines/research/SaveBrandColorsEngine";
import { StylesFromWebSiteEngine } from "./promptEngines/research/StylesFromWebSiteEngine";
import { ContentfulOpenToolingEngine } from "./promptEngines/contentful/ContentfulOpenToolingEngine";
import { CreateBindingEngine } from "./promptEngines/designSystem/CreateBindingEngine";
import { EditContentTypeEngine } from "./promptEngines/contentful/EditContentTypeEngine";
import { CreateWebComponentEngine } from "./promptEngines/designSystem/CreateWebComponentEngine";
import { ResearchFromWebSiteEngine } from "./promptEngines/research/ResearchFromWebSiteEngine";
import { AIPromptConfig, AIPromptEngineID } from "./AIPromptEngineTypes";

export default function createAIPromptEngine(
  actionName: AIPromptEngineID,
  config: AIPromptConfig
): AIPromptEngine {
  switch (actionName) {
    case AIPromptEngineID.CONTENT_MODEL: {
      return new CreateContentTypeEngine(config);
    }
    case AIPromptEngineID.ENTRIES: {
      return new CreateEntryEngine(config);
    }
    case AIPromptEngineID.DESIGN_TOKENS: {
      return new ChangeTokenColorSetEngine(config);
    }
    case AIPromptEngineID.COMPONENT_DEFINITIONS: {
      return new CreateComponentDefinitionEngine(config);
    }
    case AIPromptEngineID.WEB_COMPONENTS: {
      return new CreateWebComponentEngine(config);
    }
    case AIPromptEngineID.EDIT_CONTENT_TYPE: {
      return new EditContentTypeEngine(config);
    }
    case AIPromptEngineID.BINDING: {
      return new CreateBindingEngine(config);
    }
    case AIPromptEngineID.CONTENTFUL_OPEN_TOOL: {
      return new ContentfulOpenToolingEngine(config);
    }
    case AIPromptEngineID.RESEARCH_STYLES: {
      return new StylesFromWebSiteEngine(config);
    }
    case AIPromptEngineID.RESEARCH_BRAND: {
      return new ResearchFromWebSiteEngine(config);
    }
    case AIPromptEngineID.UPDATE_BRAND_COLORS: {
      return new SaveBrandColorsEngine(config);
    }
    case AIPromptEngineID.EDIT_COMPONENT: {
      return new EditComponentEngine(config);
    }
    default: {
      return new AIPromptEngine(config); // OpenEndedAIAction;
    }
  }
}
