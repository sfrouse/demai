import {
    AIActionContentPrefix,
    AIActionContextContentSelections,
} from "../AIActionTypes";

export function processContextContent(
    contextContent: AIActionContentPrefix,
    contextContentSelections: AIActionContextContentSelections,
    output: string[] = [],
): string[] {
    contextContent?.forEach((item) => {
        if (typeof item === "string") {
            if (item !== "[BREAK]") {
                output.push(item);
            }
        } else {
            const selectedValue =
                contextContentSelections[item.id] ||
                item.defaultValue ||
                item.options[0];

            let label = selectedValue;

            // Render label instead of raw option
            if (item.labels) {
                const labelIndex = item.options.indexOf(selectedValue);
                if (labelIndex !== -1) {
                    label = item.labels[labelIndex];
                }
            }

            output.push(`\`${label}\``);

            // Handle nested paths
            if (item.paths) {
                const index = item.options.indexOf(selectedValue);
                const path = item.paths[index === -1 ? 0 : index];
                if (path) {
                    processContextContent(
                        path,
                        contextContentSelections,
                        output,
                    );
                }
            }
        }
    });

    return output;
}
