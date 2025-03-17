
export default function previewTemplate(
  previewJS,
  jsPath,
  cssPath,
  cdefPath
) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Contentful Live Preview Demo</title>
    <style>
      /* RESETS */
      html, body { padding: 0px; margin: 0px; }
      #env {
        position: fixed;
        bottom: 10px; right: 10px;
        font-size: 10px;
        color: #aaa;
        font-family: sans-serif;
      }
    </style>
    <script type="module">
      /* CONTENTFUL PREVIEW JS */
      globalThis.cdefPath = '${cdefPath}';
      ${previewJS}
    </script>
    <script src="${jsPath}" type="module"></script>
    ${cssPath ? `<link rel="stylesheet" href="${cssPath}" />` : ``}
  </head>
  <body >
    <div id="web-component"></div>
    <script>
      if (
        document.location.hostname === '127.0.0.1' ||
        document.location.hostname === 'localhost'
      ) {
        document.write('<div id="env">localhost</div>');
      }
    </script>
  </body>
</html>`;
}