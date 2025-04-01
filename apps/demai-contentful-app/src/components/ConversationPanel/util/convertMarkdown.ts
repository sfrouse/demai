import { marked } from "marked";

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
    link(link: any) {
      const titleAttr = link.title ? ` title="${escapeHTML(link.title)}"` : "";
      return `<a href="${escapeHTML(
        link.href
      )}"${titleAttr} target="_blank" rel="noopener noreferrer">${
        link.text
      }</a>`;
    },
  };

  // Configure marked with the custom renderer
  marked.use({ renderer });
  return marked.parse(addHTMLColorChips(markdown), { async: false });
}

function escapeHTML(html: string) {
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// function addHTMLColorChips(text: string) {
//   // Regex to match hex color codes (#RGB, #RRGGBB)
//   const hexRegex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

//   return text.replace(hexRegex, (match) => {
//     return `<span style="
//                     display: inline-block;
//                     width: 14px;
//                     height: 14px;
//                     border-radius: 3px;
//                     background-color: ${match};
//                     margin: 0 4px;
//                     border: 1px solid #aaa;
//                     vertical-align: middle;" title="${match}">
//                 </span> ${match}`;
//   });
// }

function addHTMLColorChips(text: string) {
  const hexRegex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  const codeBlockRegex = /(```[\s\S]*?```|`[^`]*?`)/g;
  const segments: string[] = [];
  let lastIndex = 0;

  const renderColorChip = (hex: string) => `
        <span style="
            display: inline-block;
            width: 14px;
            height: 14px;
            border-radius: 3px;
            background-color: ${hex};
            margin: 0 4px;
            border: 1px solid #aaa;
            vertical-align: middle;"
            title="${hex}">
        </span> ${hex}`;

  const matches = Array.from(text.matchAll(codeBlockRegex));

  for (const match of matches) {
    const [code, index] = [match[0], match.index!];

    // Handle the segment before the code block
    const beforeCode = text.slice(lastIndex, index);
    const processed = beforeCode.replace(hexRegex, renderColorChip);
    segments.push(processed);

    // Keep code block unchanged
    segments.push(code);
    lastIndex = index + code.length;
  }

  // Handle any remaining text
  const rest = text.slice(lastIndex).replace(hexRegex, renderColorChip);
  segments.push(rest);

  const final = segments.join("");

  // Now the inline code version
  const hexInBackticksRegex = /`(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))`/g;
  return final.replace(hexInBackticksRegex, (match) => {
    return `<span style="
                      display: inline-block;
                      width: 14px;
                      height: 14px;
                      border-radius: 3px;
                      background-color: ${match.substring(1, match.length - 1)};
                      margin: 0 4px;
                      border: 1px solid #aaa;
                      vertical-align: middle;" title="${match.substring(
                        1,
                        match.length - 1
                      )}"></span>${match}`;
  });
}
