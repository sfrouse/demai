import esbuild from "./esbuild.mjs";
import { distPath, srcPath } from "./config.mjs";

(async () => {
  let config = {
    distPath: `${distPath}/`,
    srcPath,
    entryPoints: [
      `${srcPath}/index.ts`,
      `${srcPath}/preview/preview.ts`,
      `${srcPath}/linters/*.ts`,
      `${srcPath}/transformers/*.ts`,
    ],
  };
  await esbuild(config);

  config = {
    distPath: `${distPath}/previewSingleFileBundle`,
    srcPath,
    entryPoints: [
      `${srcPath}/preview/preview.ts`
    ],
  };
  await esbuild(config);
})()
