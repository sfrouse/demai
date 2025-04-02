import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import AIState from "../AIState";
import { AIStateContentPrefix } from "../AIStateTypes";

export default function createPrompt(
  aiState: AIState,
  contentState: ContentState
): string {
  if (aiState.ignoreContextContent) {
    return aiState.promptEngine.content
      ? aiState.promptEngine.content(aiState, contentState)
      : "";
  }

  const contextPrompt = _processContextContent(
    aiState.promptEngine.contextContent(contentState),
    aiState.contextContentSelections
  );
  const content = aiState.promptEngine.content
    ? aiState.promptEngine.content(aiState, contentState)
    : "";

  return [...contextPrompt, content].join(" ");
}

function _processContextContent(
  contextContent: AIStateContentPrefix,
  contextContentSelections: { [key: string]: string },
  output: string[] = []
): string[] {
  contextContent?.map((item) => {
    if (typeof item === "string") {
      if (item !== "[BREAK]") {
        output.push(item);
      }
    } else {
      const val =
        contextContentSelections[item.id] ||
        item.defaultValue ||
        (item.options[0] as any);
      output.push(`\`${val}\``);
      if (item.paths) {
        let path, pathIndex;
        if (item.paths) {
          pathIndex = item.options.indexOf(val);
          pathIndex = pathIndex === -1 ? 0 : pathIndex;
          path = item.paths[pathIndex];
        }
        if (path) {
          _processContextContent(path, contextContentSelections, output);
        }
      }
    }
  });
  return output;
}
