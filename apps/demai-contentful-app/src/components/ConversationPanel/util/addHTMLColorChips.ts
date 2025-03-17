export default function addHTMLColorChips(text: string) {
  // Regex to match hex color codes (#RGB, #RRGGBB)
  const hexRegex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

  return text.replace(hexRegex, (match) => {
    return `<span style="
                    display: inline-block; 
                    width: 14px; 
                    height: 14px; 
                    border-radius: 3px; 
                    background-color: ${match}; 
                    margin: 0 4px; 
                    border: 1px solid #aaa;
                    vertical-align: middle;" title="${match}">
                </span> ${match}`;
  });
}
