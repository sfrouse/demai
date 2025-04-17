const test = {
    id: "landing-page",
    title: "Landing Page",
    slug: "/landing-page",
    description:
        "A comprehensive landing page with a hero section, feature highlights, and a call to action.",
    view: "demai-page",
    modelBindings: [],
    children: [
        {
            id: "hero-section",
            title: "Hero Section",
            slug: "/landing-page/hero",
            description:
                "A prominent hero section to capture attention with key messaging.",
            view: "demai-hero",
            modelBindings: [],
            children: [],
        },
        {
            id: "feature-highlights-section",
            title: "Feature Highlights Section",
            slug: "/landing-page/features",
            description:
                "A section using cards to present features or services.",
            view: "demai-section",
            modelBindings: [],
            children: [
                {
                    id: "feature-card-1",
                    title: "Feature Card 1",
                    slug: "/landing-page/features/card-1",
                    description:
                        "A card highlighting a specific feature or service.",
                    view: "demai-card",
                    modelBindings: [],
                    children: [],
                },
                {
                    id: "feature-card-2",
                    title: "Feature Card 2",
                    slug: "/landing-page/features/card-2",
                    description:
                        "A card highlighting a specific feature or service.",
                    view: "demai-card",
                    modelBindings: [],
                    children: [],
                },
            ],
        },
        {
            id: "call-to-action-section",
            title: "Call to Action Section",
            slug: "/landing-page/call-to-action",
            description:
                "A section with a button to encourage user interaction.",
            view: "demai-section",
            modelBindings: [],
            children: [
                {
                    id: "cta-button",
                    title: "CTA Button",
                    slug: "/landing-page/call-to-action/button",
                    description:
                        "A button to trigger user actions and maintain consistent visual language.",
                    view: "demai-button",
                    modelBindings: [],
                    children: [],
                },
            ],
        },
    ],
};

export default test;
