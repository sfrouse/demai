import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import createPageController from "../../../../mcp/designSystemMCP/tools/createPageController";
import { AIAction } from "../../../AIAction";
import { AIActionConfig, AIActionSnapshot } from "../../../AIActionTypes";

export class CreatePageControllerTool extends AIAction {
    static label = "Create Layout";

    async loadNeededData() {
        await this.loadProperty("contentTypes");
        await this.loadProperty("components");
        await this.loadProperty("research");
        await this.loadProperty("entries");
        await this.loadProperty("pageControllers");
    }

    async postExeDataUpdates(): Promise<void> {
        // await this.loadProperty("tokens", true);
    }

    constructor(
        config: AIActionConfig,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, getContentState, loadProperty, snapshotOverrides);

        this.system = {
            role: "system",
            content: `
You are a tool that creates “page controllers”—structured configurations used to define the layout, content, and design of web pages in a demo environment. These controllers are used by Sales Engineers (SEs) to quickly generate working pages that combine layout views, design system components, and Contentful content.

Each page controller includes:
	•	An id, name, slug, and description
	•	A view representing a layout or component to render
	•	A modelBindings list of content entry IDs from Contentful
	•	A recursive list of children page controllers (up to 4 levels deep)

You must understand:
	•	Design systems: Use common UI components like grids, cards, and sections. Choose layouts that follow modern responsive design principles and allow for clean content presentation.
	•	Contentful: Content is stored in entries with specific content types. Choose entries appropriate for the selected view and bind them using modelBindings. Only reference existing content IDs.
	•	Web layout patterns: Organize controllers in a logical flow—e.g., hero > feature highlights > testimonials > call to action. Use nested controllers to break pages into reusable or modular sections.

Your goal is to produce configurations that are complete, clean, and can be passed directly to a frontend for rendering. Be concise but thorough. Ensure the configuration supports a handoff-ready demo experience.

If unsure about a binding or structure, provide your best-guess default. Avoid placeholders unless necessary. Always aim to create something SEs can immediately build on or deploy.
            `,
        };
        this.toolType = "DemAIDesignSystem";
        this.toolFilters = [createPageController.toolName];

        // CONTENT CONTEXT
        this.contextContent = () => [
            "Create a",
            {
                id: "pageType",
                options: [
                    "landing page",
                    "blog page",
                    "product page",
                    "product list page",
                    "about page",
                    "faq page",
                    "login page",
                    "dashboard page",
                    "portfolio page",
                ],
                defaultValue: "landing page",
            },
        ];

        // CONTENT
        this.content = (contentState: ContentState) => {
            const extra = [];
            const components = contentState.components;
            if (components) {
                const compDescriptions = components.map(
                    (comp) =>
                        `{"id": "${comp.sys.id}", "title": "${comp.fields.title}", "description": "${comp.fields.description}"}`,
                );
                extra.push(`
These are the available views. Do not invent any new views, just use these views. Do the best that you can with these.
${compDescriptions.join("\n\n")}
                    `);
            }

            return `${this.userContent}. ${extra.join("\n\n")}`;
        };

        this.introMessage = "Let's create a layout. What where you thinking?";

        this.executionPrompt = "Creating your page...";
        this.placeholder = "Add any extra descriptions of your new layout.";
    }
}
