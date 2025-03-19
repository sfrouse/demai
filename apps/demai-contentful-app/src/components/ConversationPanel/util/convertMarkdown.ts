import { marked } from "marked";
import addHTMLColorChips from "./addHTMLColorChips";

export default function convertMarkdown(markdown: string, styles: any) {
  const renderer = {
    codespan(code: any) {
      return `<code class="${styles["inline-code"]}">${code.text}</code>`;
    },
    code(code: any) {
      return `<code class="${styles["multi-line-code"]}">${code.text}</code>`;
    },
  };

  // Configure marked with the custom renderer
  marked.use({ renderer });
  return marked.parse(addHTMLColorChips(markdown));
}
