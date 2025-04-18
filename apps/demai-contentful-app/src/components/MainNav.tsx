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
import { CreatePageControllerTool } from "../ai/AIAction/actions/designSystem/layouts/CreatePageControllerAction";
import { CreateAssetForEntryAction } from "../ai/AIAction/actions/contentful/assets/CreateAssetForEntryAction";
import { AssetCreationAction } from "../ai/AIAction/actions/contentful/assets/AssetCreationAction";

type NAVIGATION_ENTRY = {
    label: string;
    section_header?: string;
    end?: boolean;
    aiActions: AIActionConstructor[];
};

export const NAVIGATION: { [key: string]: NAVIGATION_ENTRY } = {
    prospect: {
        label: "Prospect",
        section_header: "Prospect Research",
        aiActions: [ContentfulOpenToolingAction],
    },
    research: {
        label: "Research",
        end: true,
        aiActions: [StylesFromWebSiteAction, ResearchFromWebSiteAction],
    },
    content_model: {
        label: "Content Types",
        section_header: "Contentful",
        aiActions: [CreateContentTypeAction],
    },
    entries: {
        label: "Entries",
        aiActions: [CreateEntryAction],
    },
    assets: {
        label: "Assets",
        end: true,
        aiActions: [CreateAssetForEntryAction, AssetCreationAction],
    },
    // personalization: {
    //     label: "Personalization",
    //     end: true,
    //     aiActions: [ContentfulOpenToolingAction],
    // },
    design_tokens: {
        label: "Design Tokens",
        section_header: "Design System",
        aiActions: [ChangeTokenColorSetAction],
    },
    components: {
        label: "Components",
        end: true,
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
        aiActions: [CreatePageControllerTool],
    },
    // test: {
    //     label: "Testing",
    //     section_header: "Testing",
    //     end: true,
    //     aiActions: [AssetCreationAction],
    // },

    space: {
        label: "Space",
        section_header: "Configuration",
        aiActions: [ContentfulOpenToolingAction],
    },
} as const;

export type PromptAreas = keyof typeof NAVIGATION;

const MainNav = () => {
    const { spaceStatus } = useContentStateSession();
    const { route, setRoute, ignoreStatusWarning } = useAIState();
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

    const isStatusDisabled =
        spaceStatus?.valid === false && !ignoreStatusWarning;

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
                style={{
                    padding: `${tokens.spacingS} ${tokens.spacingL}`,
                }}
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
                                    style={{ marginBottom: 2 }}
                                    onClick={() => {
                                        setRoute({
                                            navigation: key,
                                            aiActions:
                                                NAVIGATION[key].aiActions,
                                            aiActionFocus: 0,
                                        });
                                    }}
                                    isActive={route?.navigation === key}
                                    isDisabled={isStatusDisabled}
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
                                aiActions: [ContentfulOpenToolingAction],
                                aiActionFocus: 0,
                            });
                        }}
                        isActive={route?.navigation === "errors"}
                        isDisabled={isStatusDisabled}
                    >
                        Errors ({errors.length})
                    </NavList.Item>
                }
                <NavList.Item
                    onClick={() => {
                        setRoute({
                            navigation: "space",
                            aiActions: NAVIGATION["space"].aiActions,
                            aiActionFocus: 0,
                        });
                    }}
                    isActive={route?.navigation === "space"}
                    isDisabled={isStatusDisabled}
                >
                    Settings
                </NavList.Item>
            </Flex>
        </NavList>
    );
};

export default MainNav;
