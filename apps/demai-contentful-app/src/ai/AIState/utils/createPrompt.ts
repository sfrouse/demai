import AIState from "../AIState";
import { AIStateContentPrefix } from "../AIStateTypes";

export default function createPrompt(aiState: AIState): string {
  if (aiState.ignoreContextContent) {
    return aiState.promptEngine.content
      ? aiState.promptEngine.content(aiState.userContent)
      : "";
  }
  return [
    ..._processContextContent(aiState.contextContent),
    aiState.promptEngine.content
      ? aiState.promptEngine.content(aiState.userContent)
      : "",
  ].join(" ");
}

function _processContextContent(
  contextContent: AIStateContentPrefix,
  output: string[] = []
): string[] {
  contextContent?.map((item) => {
    if (typeof item === "string") {
      output.push(item);
    } else {
      const val = item.value || (item.options[0] as any);
      output.push(val);
      if (item.paths) {
        let path, pathIndex;
        if (item.paths) {
          pathIndex = item.options.indexOf(val);
          pathIndex = pathIndex === -1 ? 0 : pathIndex;
          path = item.paths[pathIndex];
        }
        if (path) {
          _processContextContent(path, output);
        }
      }
    }
  });
  return output;
}
