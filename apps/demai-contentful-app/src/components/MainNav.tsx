import { NavList } from "@contentful/f36-navlist";
import React from "react";
import Divider from "./Divider";
import tokens from "@contentful/f36-tokens";
import { Flex, SectionHeading } from "@contentful/f36-components";
import { useContentStateSession } from "../contexts/ContentStateContext/ContentStateContext";
import ContentPanelHeader from "./ContentPanel/ContentPanelHeader";
import useAIState from "../contexts/AIStateContext/useAIState";
import { AIPromptEngineID } from "../ai/AIState/AIStateTypes";

type NAVIGATION_ENTRY = {
  label: string;
  section_header?: string;
  end?: boolean;
  aiStateEngines: AIPromptEngineID[];
};

export const NAVIGATION: { [key: string]: NAVIGATION_ENTRY } = {
  prospect: {
    label: "Prospect",
    section_header: "Prospect Research",
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
  research: {
    label: "Research",
    end: true,
    aiStateEngines: [AIPromptEngineID.RESEARCH_STYLES],
  },
  content_model: {
    label: "Content Types",
    section_header: "Contentful",
    aiStateEngines: [
      AIPromptEngineID.CONTENT_MODEL,
      AIPromptEngineID.CONTENTFUL_OPEN_TOOL,
    ],
  },
  entries: {
    label: "Entries / Content",
    aiStateEngines: [AIPromptEngineID.ENTRIES],
  },
  personalization: {
    label: "Personalization",
    end: true,
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
  design_tokens: {
    label: "Design Tokens",
    section_header: "Design System",
    aiStateEngines: [AIPromptEngineID.DESIGN_TOKENS, AIPromptEngineID.OPEN],
  },
  components: {
    label: "Components",
    end: true,
    aiStateEngines: [
      AIPromptEngineID.COMPONENT_DEFINITIONS,
      AIPromptEngineID.WEB_COMPONENTS,
      AIPromptEngineID.BINDING,
      AIPromptEngineID.OPEN,
    ],
  },
  pages: {
    label: "Pages",
    section_header: "Layouts",
    end: true,
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
  space: {
    label: "Space",
    section_header: "Configuration",
    aiStateEngines: [AIPromptEngineID.OPEN],
  },
} as const;

export type PromptAreas = keyof typeof NAVIGATION;

const MainNav = () => {
  const { spaceStatus } = useContentStateSession();
  const { route, setRoute } = useAIState();
  const navEntries = Object.entries(NAVIGATION) as [
    PromptAreas,
    { label: string; section_header?: string; end?: boolean }
  ][];

  return (
    <NavList
      aria-label="Prompt Area Navigation Sidebar"
      style={{
        flex: 1,
        maxWidth: 250,
        borderRight: `1px solid ${tokens.gray200}`,
      }}
    >
      <ContentPanelHeader title="DemAI" />
      <Flex
        flexDirection="column"
        flex="1"
        style={{ padding: `${tokens.spacingS} ${tokens.spacingL}` }}
      >
        {navEntries.map(([key, { label, end, section_header }], index) => {
          if (key === "space") return;
          return (
            <React.Fragment key={key}>
              {section_header && (
                <SectionHeading style={{ marginBottom: tokens.spacingXs }}>
                  {section_header}
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
        <NavList.Item
          onClick={() => {
            setRoute({
              navigation: "space",
              aiStateEngines: NAVIGATION["space"]
                .aiStateEngines as unknown as AIPromptEngineID[],
              aiStateEngineFocus: 0,
            });
          }}
          isActive={route?.navigation === "space"}
          isDisabled={spaceStatus?.valid === false}
        >
          Settings
        </NavList.Item>
      </Flex>
    </NavList>
  );
};

export default MainNav;
