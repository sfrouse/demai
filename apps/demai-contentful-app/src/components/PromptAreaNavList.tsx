import { NavList } from "@contentful/f36-navlist";
import React from "react";
import Divider from "./Divider";
import tokens from "@contentful/f36-tokens";
import { Heading, SectionHeading, Text } from "@contentful/f36-components";
import { AIActionName } from "../locations/page/utils/findAIAction";
import { AIPromptEngineID } from "../ai/AIState/utils/createAIPromptEngine";

export const NAVIGATION = {
  research: {
    label: "Research",
    header: "Prospect Research",
    end: true,
    aiAction: AIActionName.RESEARCH,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  content_model: {
    label: "Content Types",
    header: "Space Actions",
    aiAction: AIActionName.CONTENT_MODEL,
    aiStateEngine: AIPromptEngineID.CONTENT_MODEL,
  },
  entries: {
    label: "Entries / Content",
    aiAction: AIActionName.ENTRIES,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  personalization: {
    label: "Personalization",
    end: true,
    aiAction: AIActionName.PERSONALIZATION,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  design_tokens: {
    label: "Design Tokens",
    header: "Design System",
    aiAction: AIActionName.DESIGN_TOKENS,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  components: {
    label: "Components",
    end: true,
    aiAction: AIActionName.COMPONENTS,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  space: {
    label: "Space",
    header: "Configuration",
    aiAction: AIActionName.SPACE,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
} as const;

export type PromptAreas = keyof typeof NAVIGATION;

const PromptAreaNavList = ({
  navFocus,
  setNavFocus,
}: {
  navFocus: PromptAreas;
  setNavFocus: (area: PromptAreas) => void;
}) => {
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
      {navEntries.map(([key, { label, end, header }], index) => (
        <React.Fragment key={key}>
          {header && (
            <SectionHeading style={{ marginBottom: tokens.spacingXs }}>
              {header}
            </SectionHeading>
          )}
          <NavList.Item
            onClick={() => setNavFocus(key)}
            isActive={navFocus === key}
          >
            {label}
          </NavList.Item>
          {end && <Divider />}
        </React.Fragment>
      ))}
    </NavList>
  );
};

export default PromptAreaNavList;
