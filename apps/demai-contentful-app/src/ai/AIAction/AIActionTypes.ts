import { IconComponent, IconProps } from "@contentful/f36-components";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import { AIAction } from "./AIAction";

export type AIActionConfig = {
    cma: string;
    spaceId: string;
    environmentId: string;
    cpa: string;
    openAiApiKey: string;
};

export type AIActionContentFunction = (contentState: ContentState) => string;

export type AIActionContextContentSelections = { [key: string]: string };

export enum AIActionPhase {
    prompting = "prompting",
    answered = "answered",
    describing = "describing",
    executing = "executing",
    executed = "executed",
    done = "done",
}

export type AIActionContentPrefixSelect = {
    id: string;
    options: string[];
    labels?: string[];
    defaultValue: string;
    paths?: AIActionContentPrefix[];
};

export type AIActionContentPrefix = (string | AIActionContentPrefixSelect)[];

export type AIActionSystemPrompt = {
    role: "system";
    content: string;
};

export type AIActionResponseContentFunction = (
    response: string,
    contentState: ContentState,
) => string;

export type AIActionPrompts = {
    cancel?: string;
    run: string;
    cancelIcon?: {
        (props: IconProps<IconComponent>): JSX.Element;
        displayName: string;
    };
    runIcon?: {
        (props: IconProps<IconComponent>): JSX.Element;
        displayName: string;
    };
};

export type AIActionRunResults =
    | { success: true; result: string }
    | { success: false; errors: string[] };

export type AIActionExecuteResults =
    | {
          success: true;
          result: string;
          toolCalls: string[];
          toolResults: any[];
      }
    | {
          success: false;
          errors: string[];
          toolCalls: string[];
          toolResults: any[];
      };

export type AIActionSnapshot = ReturnType<AIAction["createSnapshot"]>;
