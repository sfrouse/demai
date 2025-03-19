import { NavList } from "@contentful/f36-navlist";
import React from "react";
import Divider from "./Divider";
import tokens from "@contentful/f36-tokens";
import { Heading, SectionHeading } from "@contentful/f36-components";
import { AIPromptEngineID } from "../ai/AIState/utils/createAIPromptEngine";
import { useContentStateSession } from "../contexts/ContentStateContext/ContentStateContext";
import { useAIState } from "../contexts/AIStateContext/AIStateContext";

type NAVIGATION_ENTRY = {
  label: string;
  header?: string;
  end?: boolean;
  aiStateEngines: AIPromptEngineID[];
};

export const NAVIGATION: { [key: string]: NAVIGATION_ENTRY } = {
  research: {
    label: "Research",
    header: "Prospect Research",
    end: true,
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
  content_model: {
    label: "Content Types",
    header: "Space Actions",
    aiStateEngines: [AIPromptEngineID.CONTENT_MODEL],
  },
  entries: {
    label: "Entries / Content",
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
  personalization: {
    label: "Personalization",
    end: true,
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
  design_tokens: {
    label: "Design Tokens",
    header: "Design System",
    aiStateEngines: [AIPromptEngineID.DESIGN_TOKENS, AIPromptEngineID.OPEN],
  },
  components: {
    label: "Components",
    end: true,
    aiStateEngines: [
      AIPromptEngineID.COMPONENT_DEFINITIONS,
      AIPromptEngineID.WEB_COMPONENTS,
      AIPromptEngineID.COMPONENT_BINDING,
    ],
  },
  space: {
    label: "Space",
    header: "Configuration",
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
} as const;

export type PromptAreas = keyof typeof NAVIGATION;

const PromptAreaNavList = () => {
  const { spaceStatus } = useContentStateSession();
  const { route, setRoute } = useAIState();
  const navEntries = Object.entries(NAVIGATION) as [
    PromptAreas,
    { label: string; header?: string; end?: boolean }
  ][];

  return (
    <NavList
      aria-label="Prompt Area Navigation Sidebar"
      style={{
        flex: 1,
        maxWidth: 250,
        padding: 20,
        borderRight: `1px solid ${tokens.gray200}`,
      }}
    >
      <Heading
        style={{
          paddingLeft: tokens.spacingXs,
          paddingRight: tokens.spacingXs,
          marginBottom: 0,
        }}
      >
        DemAI
      </Heading>
      <Divider />
      {navEntries.map(([key, { label, end, header }], index) => {
        if (key === "settings") return;
        return (
          <React.Fragment key={key}>
            {header && (
              <SectionHeading style={{ marginBottom: tokens.spacingXs }}>
                {header}
              </SectionHeading>
            )}
            <NavList.Item
              onClick={() => {
                setRoute({
                  navigation: key,
                  aiStateEngines: NAVIGATION[key]
                    .aiStateEngines as unknown as AIPromptEngineID[],
                  aiStateEngineFocus: 0,
                });
              }}
              isActive={route?.navigation === key}
              isDisabled={spaceStatus?.valid === false}
            >
              {label}
            </NavList.Item>
            {end && <Divider />}
          </React.Fragment>
        );
      })}
      <div style={{ flex: 1 }}></div>
    </NavList>
  );
};

export default PromptAreaNavList;
