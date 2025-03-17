import type { StorybookConfig } from "@storybook/web-components-webpack5";

const config: StorybookConfig = {
  stories: [
    // "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../dist/cdef/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
  ],
  framework: {
    name: "@storybook/web-components-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
