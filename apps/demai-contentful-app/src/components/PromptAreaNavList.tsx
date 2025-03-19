import { NavList } from "@contentful/f36-navlist";
import React from "react";
import Divider from "./Divider";
import tokens from "@contentful/f36-tokens";
import { Heading, SectionHeading } from "@contentful/f36-components";
import { AIPromptEngineID } from "../ai/AIState/utils/createAIPromptEngine";
import { useContentStateSession } from "../contexts/ContentStateContext/ContentStateContext";

export const NAVIGATION = {
  research: {
    label: "Research",
    header: "Prospect Research",
    end: true,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  content_model: {
    label: "Content Types",
    header: "Space Actions",
    aiStateEngine: AIPromptEngineID.CONTENT_MODEL,
  },
  entries: {
    label: "Entries / Content",
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  personalization: {
    label: "Personalization",
    end: true,
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  design_tokens: {
    label: "Design Tokens",
    header: "Design System",
    aiStateEngine: AIPromptEngineID.DESIGN_TOKENS,
  },
  components: {
    label: "Components",
    end: true,
    aiStateEngine: AIPromptEngineID.COMPONENTS,
  },
  space: {
    label: "Space",
    header: "Configuration",
    aiStateEngine: AIPromptEngineID.OPEN,
  },
  settings: {
    label: "Settings",
    header: "Settings",
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
  const { contentState } = useContentStateSession();
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
              onClick={() => setNavFocus(key)}
              isActive={navFocus === key}
              isDisabled={contentState.spaceStatus?.valid === false}
            >
              {label}
            </NavList.Item>
            {end && <Divider />}
          </React.Fragment>
        );
      })}
      <div style={{ flex: 1 }}></div>
      <NavList.Item
        onClick={() => setNavFocus("settings")}
        isActive={navFocus === "settings"}
      >
        Settings
      </NavList.Item>
    </NavList>
  );
};

export default PromptAreaNavList;
