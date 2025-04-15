import { NavList } from "@contentful/f36-navlist";
import React from "react";
import Divider from "./Divider";
import tokens from "@contentful/f36-tokens";
import { Flex, SectionHeading } from "@contentful/f36-components";
import { useContentStateSession } from "../contexts/ContentStateContext/ContentStateContext";
import ContentPanelHeader from "./ContentPanel/ContentPanelHeader";
import useAIState from "../contexts/AIStateContext/useAIState";
import { useError } from "../contexts/ErrorContext/ErrorContext";
import { ContentfulOpenToolingAction } from "../ai/AIAction/actions/contentful/ContentfulOpenToolingAction";
import { ResearchFromWebSiteAction } from "../ai/AIAction/actions/research/ResearchFromWebSiteAction";
import { StylesFromWebSiteAction } from "../ai/AIAction/actions/research/StylesFromWebSiteAction";
import { CreateContentTypeAction } from "../ai/AIAction/actions/contentful/CreateContentTypeAction";
import { CreateEntryAction } from "../ai/AIAction/actions/contentful/CreateEntryAction";
import { ChangeTokenColorSetAction } from "../ai/AIAction/actions/designSystem/ChangeTokenColorSetAction";
import { CreateComponentDefinitionAction } from "../ai/AIAction/actions/designSystem/CreateComponentDefinitionAction";
import { CreateWebComponentAction } from "../ai/AIAction/actions/designSystem/CreateWebComponentAction";
import { CreateBindingAction } from "../ai/AIAction/actions/designSystem/CreateBindingAction";
import { AIActionConstructor } from "../contexts/AIStateContext/AIStateRouting";
import { ContentfulGroupAction } from "../ai/AIAction/actions/contentful/groups/ContentfulGroupAction";
import { ResearchGroupAction } from "../ai/AIAction/actions/research/groups/ResearchGroupAction";

type NAVIGATION_ENTRY = {
    label: string;
    section_header?: string;
    end?: boolean;
    // aiStateEngines: AIPromptEngineID[];
    aiActions: AIActionConstructor[];
};

export const NAVIGATION: { [key: string]: NAVIGATION_ENTRY } = {
    prospect: {
        label: "Prospect",
        section_header: "Prospect Research",
        // aiStateEngines: [AIPromptEngineID.OPEN],
        aiActions: [ContentfulOpenToolingAction],
    },
    research: {
        label: "Research",
        end: true,
        // aiStateEngines: [
        //     AIPromptEngineID.RESEARCH_STYLES,
        //     AIPromptEngineID.RESEARCH_BRAND,
        //     AIPromptEngineID.OPEN,
        // ],
        aiActions: [StylesFromWebSiteAction, ResearchFromWebSiteAction],
    },
    content_model: {
        label: "Content Types",
        section_header: "Contentful",
        // aiStateEngines: [
        //     AIPromptEngineID.CONTENT_MODEL,
        //     AIPromptEngineID.CONTENTFUL_OPEN_TOOL,
        // ],
        aiActions: [CreateContentTypeAction],
    },
    entries: {
        label: "Entries / Content",
        // aiStateEngines: [AIPromptEngineID.ENTRIES],
        aiActions: [CreateEntryAction],
    },
    personalization: {
        label: "Personalization",
        end: true,
        // aiStateEngines: [AIPromptEngineID.OPEN],
        aiActions: [ContentfulOpenToolingAction],
    },
    design_tokens: {
        label: "Design Tokens",
        section_header: "Design System",
        // aiStateEngines: [AIPromptEngineID.DESIGN_TOKENS],
        aiActions: [ChangeTokenColorSetAction],
    },
    components: {
        label: "Components",
        end: true,
        // aiStateEngines: [
        //     AIPromptEngineID.COMPONENT_DEFINITIONS,
        //     AIPromptEngineID.WEB_COMPONENTS,
        //     AIPromptEngineID.BINDING,
        //     AIPromptEngineID.OPEN,
        // ],
        aiActions: [
            CreateComponentDefinitionAction,
            CreateWebComponentAction,
            CreateBindingAction,
        ],
    },
    pages: {
        label: "Pages",
        section_header: "Layouts",
        end: true,
        // aiStateEngines: [AIPromptEngineID.OPEN],
        aiActions: [ContentfulOpenToolingAction],
    },
    space: {
        label: "Space",
        section_header: "Configuration",
        // aiStateEngines: [AIPromptEngineID.OPEN],
        aiActions: [ContentfulOpenToolingAction],
    },
} as const;

export type PromptAreas = keyof typeof NAVIGATION;

const MainNav = () => {
    const { spaceStatus } = useContentStateSession();
    const { route, setRoute } = useAIState();
    const { errors } = useError();
    const navEntries = Object.entries(NAVIGATION) as [
        PromptAreas,
        { label: string; section_header?: string; end?: boolean },
    ][];

    const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname.startsWith("192.168.") || // local network
            window.location.hostname === "[::1]"); // IPv6 localhost

    return (
        <NavList
            aria-label="Prompt Area Navigation Sidebar"
            style={{
                flex: 1,
                maxWidth: 250,
                borderRight: `1px solid ${tokens.gray200}`,
            }}
        >
            <ContentPanelHeader
                title={`DemAI`}
                secondaryTitle={isLocalhost ? "localhost" : "beta"}
            />
            <Flex
                flexDirection="column"
                flex="1"
                style={{ padding: `${tokens.spacingS} ${tokens.spacingL}` }}
            >
                {navEntries.map(
                    ([key, { label, end, section_header }], index) => {
                        if (key === "space") return;
                        return (
                            <React.Fragment key={key}>
                                {section_header && (
                                    <SectionHeading
                                        style={{
                                            marginBottom: tokens.spacingXs,
                                        }}
                                    >
                                        {section_header}
                                    </SectionHeading>
                                )}
                                <NavList.Item
                                    onClick={() => {
                                        setRoute({
                                            navigation: key,
                                            // aiStateEngines: NAVIGATION[key]
                                            //     .aiStateEngines as unknown as AIPromptEngineID[],
                                            // aiStateEngineFocus: 0,
                                            aiActions:
                                                NAVIGATION[key].aiActions,
                                            aiActionFocus: 0,
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
                    },
                )}
                <div style={{ flex: 1 }}></div>
                {
                    <NavList.Item
                        style={{
                            color:
                                errors.length > 0
                                    ? tokens.colorWarning
                                    : tokens.gray400,
                        }}
                        onClick={() => {
                            setRoute({
                                navigation: "error",
                                // aiStateEngines: [AIPromptEngineID.OPEN],
                                aiActions: [ContentfulOpenToolingAction],
                                aiActionFocus: 0,
                            });
                        }}
                        isActive={route?.navigation === "errors"}
                        isDisabled={spaceStatus?.valid === false}
                    >
                        Errors ({errors.length})
                    </NavList.Item>
                }
                <NavList.Item
                    onClick={() => {
                        setRoute({
                            navigation: "space",
                            // aiStateEngines: NAVIGATION["space"]
                            //     .aiStateEngines as unknown as AIPromptEngineID[],
                            // aiStateEngineFocus: 0,
                            aiActions: NAVIGATION["space"].aiActions,
                            aiActionFocus: 0,
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
