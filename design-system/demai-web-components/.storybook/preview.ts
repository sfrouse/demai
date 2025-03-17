import type { Preview } from "@storybook/web-components";
// import '../dist/tokens/dmo/css/tokens.css';
import '../dist/tokens/tokens.css';
import '../dist/index';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
