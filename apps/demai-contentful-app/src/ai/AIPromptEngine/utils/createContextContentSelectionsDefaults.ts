import { AIPromptContentPrefix } from "../../AIPromptEngine/AIPromptEngineTypes";

export default function createContextContentSelectionsDefaults(
  contentPrefixes: AIPromptContentPrefix,
  selections: { [key: string]: string } = {}
): { [key: string]: string } {
  contentPrefixes.forEach((item) => {
    if (typeof item === "string") {
      return; // Skip plain strings
    }

    // Store default value for the select item
    selections[item.id] = item.defaultValue;

    // Recursively process paths if they exist
    if (item.paths) {
      item.paths.forEach((path) => {
        createContextContentSelectionsDefaults(path, selections);
      });
    }
  });

  return selections;
}
