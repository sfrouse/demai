import { CreateContentTypeAIAction } from "../../../ai/AIAction/actions/CreateContentTypeAIAction";
import { OpenEndedAIAction } from "../../../ai/AIAction/actions/OpenEndedAIAction";
import { OpenEndedToolAIAction } from "../../../ai/AIAction/actions/OpenEndedToolAIAction";
import { PublishContentTypeAIAction } from "../../../ai/AIAction/actions/PublishContentTypesAIAction";

export enum AIActionName {
  RESEARCH = "research",
  CONTENT_MODEL = "content_model",
  PUBLISH_CONTENT_MODEL = "publish_content_model",
  ENTRIES = "entries",
  PERSONALIZATION = "personalization",
  DESIGN_TOKENS = "design_tokens",
  COMPONENTS = "components",
  SPACE = "space",
}

export function findAIAction(actionName: AIActionName) {
  switch (actionName) {
    case AIActionName.CONTENT_MODEL: {
      return CreateContentTypeAIAction;
    }
    case AIActionName.PUBLISH_CONTENT_MODEL: {
      return PublishContentTypeAIAction;
    }
    default: {
      return OpenEndedToolAIAction; // OpenEndedAIAction;
    }
  }
}
