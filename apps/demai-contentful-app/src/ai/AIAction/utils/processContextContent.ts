import {
    AIActionContentPrefix,
    AIActionContextContentSelections,
} from "../AIActionTypes";

export function processContextContent(
    contextContent: AIActionContentPrefix,
    contextContentSelections: AIActionContextContentSelections,
    output: string[] = [],
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
