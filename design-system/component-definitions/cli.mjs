#!/usr/bin/env node
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import previewTemplate from './scripts/previewTemplate.mjs';
import parseCDefs from './scripts/cdef/parseCDefs.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [,, ...args] = process.argv;

/**
 * Main Entry Point
 * @return {void}
 */
async function main() {

  if (args.indexOf('lint') === 0) {
    console.log('lint');
    return;
  }

  if (args.indexOf('build') === 0) {
    let source = '', dest = '', cssUrl = '', jsUrl = '', tokenLookupUrl = ''
    args.map(arg => {
      if (arg.indexOf('--source=') === 0) {
        source = arg.split('=')[1];
      }
      if (arg.indexOf('--dest=') === 0) {
        dest = arg.split('=')[1];
      }
      if (arg.indexOf('--css-url=') === 0) {
        cssUrl = arg.split('=')[1];
      }
      if (arg.indexOf('--js-url=') === 0) {
        jsUrl = arg.split('=')[1];
      }
      if (arg.indexOf('--token-lookup-url=') === 0) {
        tokenLookupUrl = arg.split('=')[1];
      }
    });
    if (!source || !dest) {
      console.error('two arguments needed, --source, --dest');
      return;
    }
    await parseCDefs(source, dest, jsUrl, cssUrl, tokenLookupUrl);
    return;
  }

  if (args.indexOf('preview') === 0) {
    let jsPath = '',
      cssPath = '',
      filePath = './dist/preview/index.html',
      cdefPath = '';
    args.map(arg => {
      if (arg.indexOf('--js') === 0) {
        jsPath = arg.split('=')[1];
      }else if (arg.indexOf('--css') === 0) {
        cssPath = arg.split('=')[1];
      }else if (arg.indexOf('--file') === 0) {
        filePath = arg.split('=')[1];
      }else if (arg.indexOf('--cdef') === 0) {
        cdefPath = arg.split('=')[1];
      }
    });

    const previewJs = `${__dirname}/dist/previewSingleFileBundle/preview.js`;
    if (!fs.existsSync(previewJs)) {
      console.error(`no ${previewJs} file`);
      return;
    }

    // const contentfulPreviewCss = `${__dirname}/node_modules/@contentful/live-preview/dist/style.css`;
    // if (!fs.existsSync(contentfulPreviewCss)) {
    //   console.error(`no ${contentfulPreviewCss} file`);
    //   return;
    // }
  
    const previewJSContent = fs.readFileSync(previewJs, {encoding: 'utf8'});
    // const contentfulPreviewCssContent = fs.readFileSync(contentfulPreviewCss, {encoding: 'utf8'});
    const previewHTML = previewTemplate(
      previewJSContent,
      jsPath,
      cssPath,
      cdefPath
    );

    if (!fs.existsSync(dirname(filePath))) {
      fs.mkdirSync(dirname(filePath), { recursive: true});
    }
    fs.writeFileSync(filePath, previewHTML);
  }

}

main();
