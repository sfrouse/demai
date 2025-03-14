// import fs from 'fs';
import tsToCss from './tokensToCss.mjs';

export default function cssRender(
    dest, writeFileArr, tokensByMode, prefix, remBase
) {
    const cssDir = `${dest}/css`;
    // if (!fs.existsSync(cssDir)){
    //     fs.mkdirSync(cssDir, { recursive: true });
    // }
    const cssModesDir = `${dest}/css/modes`;
    // if (!fs.existsSync(cssModesDir)){
    //     fs.mkdirSync(cssModesDir, { recursive: true });
    // }
    const allCss = [];

    // extract breakpoints...
    const breakpoints = tokensByMode.default?.breakpoint;

    Object.entries(tokensByMode).map(entry => {
        const modeName = entry[0];
        const modeValue = entry [1];
        const cssArr = tsToCss(modeValue, prefix);
        const selector = getSelector(modeName, prefix, breakpoints);
        let value = `${selector.start}\n${selector.indent}${
                cssArr.join(`\n${selector.indent}`)
            }\n${selector.end}`;
        
        if (modeName === 'default' && remBase) {
            value = `html { font-size: ${remBase}px; }\n\n${value}`;
        }
        allCss.push(value);
        // writeFileArr.push(fs.promises.writeFile(
        //     `${cssModesDir}/${modeName}.css`,
        //     value
        // ));
        writeFileArr.push({
            name: `css${modeName}`,
            path: `${cssModesDir}/${modeName}.css`,
            content: value
        });
    });
    // ALL CSS TOGETHER
    // writeFileArr.push(fs.promises.writeFile(
    //     `${cssDir}/tokens.css`,
    //     `${allCss.join('\n')}`
    // ));
    writeFileArr.push({
        name: 'css',
        path: `${cssDir}/tokens.css`,
        content: `${allCss.join('\n')}`
    });
}


function getSelector(
    modeName, prefix, breakpoints
) {
    const prefixStr = prefix ? `${prefix}-` : '';
    if (modeName === 'default') {
        return {
            start:`:root, .${prefixStr}default {`,
            end: '}',
            indent: '\t'
        }
    }
    if (modeName === 'tablet' && breakpoints?.lg) {
        return {
            start:`@media only screen and (max-width: ${breakpoints.lg}) {\n\t:root {`,
            end: '\t}\n}',
            indent: '\t\t'
        }
    }
    if (modeName === 'mobile' && breakpoints?.md) {
        return {
            start:`@media only screen and (max-width: ${breakpoints.md}) {\n\t:root {`,
            end: '\t}\n}',
            indent: '\t\t'
        }
    }

    return {
        start:`.${prefixStr}${modeName} {`,
        end: '}',
        indent: '\t'
    }
}