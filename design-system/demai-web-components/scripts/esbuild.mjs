import chalk from 'chalk';
import esbuildOrig from 'esbuild';
import {
  sassPlugin
} from 'esbuild-sass-plugin';
import copy from 'esbuild-plugin-copy';
import {
  logDone,
  logStart
} from './log.mjs';

/**
 * Esbuild
 * @param {boolean} incremental
 * @param {object} config
 * @param {boolean} isServer
 * @return {object}
 */
export default async function esbuild(
  config = {
    sassIncludePaths: []
  },
  isServer = false,
) {

  logStart(`compiling and bundling typscript web comps (esbuild) [${isServer ? 'SERVER' : 'BROWSER'}]`);

  const outdir = isServer ? `${config.distPath}-node` : config.distPath;
  // esbuild them...
  const buildResult = await esbuildOrig.build({
      format: 'esm',
      target: 'es2019', // optional chaining out...
      entryPoints: config.entryPoints,
      bundle: true,
      minify: true, // isServer ? false : true,
      sourcemap: false, // true,
      splitting: isServer ? false : true,
      chunkNames: 'chunks/[name].[hash]',
      external: isServer ? [
        'lit',
        '@lit',
        'lit-html',
        'lit-element',
        'react'
      ] : [
        'react'
      ],
      // incremental,
      define: {
        // Popper.js expects this to be set
        'process.env.NODE_ENV': '"production"',
      },
      outdir,
      plugins: [
        sassPlugin({
          type: 'lit-css',
          loadPaths: config.sassIncludePaths,
          importer: null,
        }),
        copy({
          assets: [
            {
              from: [
                './www/*'
              ],
              to: ['./'],
            }
          ]
        }),
      ],
    })
    .catch((err) => {
      console.error(chalk.red(err));
      process.exit(1);
    });

  logDone(`bundling and compiling typscript: ${outdir}`);

  return buildResult;
};