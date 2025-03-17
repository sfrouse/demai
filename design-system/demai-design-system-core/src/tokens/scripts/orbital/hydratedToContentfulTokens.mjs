

export default function hydratedToContentfulTokens(hydratedTokens, prefix) {
    const contentfulTokens = {
        sizing: {},
        spacing: {},
        color: {},
        border: {},
        fontSize: {},
        lineHeight: {},
        letterSpacing: {},
        textColor: {},
        borderRadius: {},
    };

    const LEAF_NAME_DENY_LIST = ['hover', 'pressed', 'selected'];
    const FULL_NAME_DENY_LIST = ['on_surface', 'viewport'];

    for (const tokenName in hydratedTokens) {
        const token = hydratedTokens[tokenName];
        const leafName = token.keys.path.slice(1).join(' ');
        if (LEAF_NAME_DENY_LIST.find(deny => leafName.includes(deny))) continue;
        if (FULL_NAME_DENY_LIST.find(deny => tokenName.includes(deny))) continue;

        if (tokenName.indexOf(`${prefix}_spacing`) === 0) {
            contentfulTokens.spacing[leafName] = token.values.cssProperty;
        }

        if (tokenName.indexOf(`${prefix}_border_radius`) === 0) {
            const finalName = [...token.keys.path].pop();
            contentfulTokens.borderRadius[finalName] = token.values.cssProperty;
        }

        if (tokenName.lastIndexOf(`_size`) === tokenName.length - '_size'.length) {
            const finalName = token.keys.path.slice(0).join(' ').replace(' size', '');
            contentfulTokens.fontSize[finalName] = token.values.cssProperty;
        }

        if (tokenName.lastIndexOf(`_lineheight`) === tokenName.length - '_lineheight'.length) {
            const finalName = token.keys.path.slice(0).join(' ').replace(' lineheight', '');
            contentfulTokens.lineHeight[finalName] = token.values.cssProperty;
        }

        if (tokenName.indexOf(`${prefix}_background`) === 0) {
            contentfulTokens.color[leafName] = token.values.cssProperty;
        }

        if (tokenName.indexOf(`${prefix}_text`) === 0) {
            contentfulTokens.textColor[leafName] = token.values.cssProperty;
        }

        if (
            tokenName.indexOf(`${prefix}_border_width`) !== 0 &&
            tokenName.indexOf(`${prefix}_border_radius`) !== 0 &&
            tokenName.indexOf(`${prefix}_border`) === 0
        ) {
            contentfulTokens.border[leafName] = {
                width: hydratedTokens[`${prefix}_border_width_sm`].values.cssProperty,
                style: 'solid',
                color: token.values.cssProperty
            }
        }
    }


    return contentfulTokens;
}