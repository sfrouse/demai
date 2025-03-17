import esbuild from "./esbuild.mjs";
import { distPath, srcPath } from "./config.mjs";

(async () => {
  const config = {
    distPath: `${distPath}`,
    srcPath,
    entryPoints: [
      `${srcPath}/index.ts`,
      // `${srcPath}/dmo-button/DMOButton.ts`,
      // `${srcPath}/dmo-container/DMOContainer.ts`,
      // `${srcPath}/dmo-text/DMOText.ts`,
    ],
    sassIncludePaths: [
        // `./dist/tokens/scss`, 
        `./dist/tokens/scss`,
    ],
  };

  await esbuild(config);

  // const serverConfig = {
  //   distPath: `${distPath}`,
  //   srcPath,
  //   entryPoints: [
  //     `${srcPath}/index.ts`,
  //     // `${srcPath}/dmo-button/DMOButton.ts`
  //   ],
  //   sassIncludePaths: [ 
  //       `./dist/tokens`,
  //   ],
  // };

  await esbuild(config, true);

})()
