import { marked } from "marked";
import addHTMLColorChips from "./addHTMLColorChips";

export default function convertMarkdown(markdown: string, styles: any) {
  const renderer = {
    codespan(code: any) {
      return `<code class="${styles["inline-code"]}">${escapeHTML(
        code.text
      )}</code>`;
    },
    code(code: any) {
      return `<code class="${styles["multi-line-code"]}">${escapeHTML(
        code.text
      )}</code>`;
    },
  };

  // Configure marked with the custom renderer
  marked.use({ renderer });
  return marked.parse(addHTMLColorChips(markdown));
}

function escapeHTML(html: string) {
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
