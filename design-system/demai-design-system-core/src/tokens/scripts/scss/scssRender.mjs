import tokensToScss from './tokensToScss.mjs';

export default function scssRender(
    dest, writeFileArr, defaultTokensWithCssProps, prefix
) {
    const scssDir = `${dest}/scss`;
    const allScss = [];
    Object.entries(defaultTokensWithCssProps).map(entry => {
        const name = entry[0];
        const value = entry [1];
        const prefixStr = prefix ? `${prefix}-` : '';
        const scssArr = tokensToScss(value, `${prefixStr}${name}`);
        allScss.push(scssArr.join('\n'));
    });
    // ALL CSS TOGETHER
    writeFileArr.push({
        name: 'scss',
        path: `${scssDir}/tokens.scss`,
        content: `${allScss.join('\n')}`
    })
}