

export default function semanticTokens(hydratedTokens, prefix) {

    // order matters...
    const semanticKeys = [
        'text',
        'border_radius', 'border_width', 'border',
        'padding', 'margin', 'gap',
        'background',
        'icon',
        'type_family', 'type_weight', 'type'
        // 'display', 'heading', 'body', 'label'
    ];

    const filters = [
        'hover', 'selected', 'pressed', 'disabled'
    ]

    const semantic = {};
    for (const [key, token] of Object.entries(hydratedTokens)) {
        const globalKey = token.keys.global;
        let semanticKey, isFiltered;
        semanticKeys.find(key => {
            if (!semanticKey && globalKey.indexOf(`${prefix}_${key}_`) === 0) {
                semanticKey = key;
            }
            filters.find(filter => {
                if (globalKey.indexOf(filter) !== -1) {
                    isFiltered = true;
                    return true;
                }
                return false;
            });
            return false;
        });
        
        if (!isFiltered && semanticKey) {
            const semanticName = toTitleCase( globalKey.split(semanticKey).pop(), "_" );
            const semanticObjName = semanticKey;
            if (!semantic[semanticObjName]) semantic[semanticObjName] = {};
            // semantic[semanticObjName][` `] = '';
            semantic[semanticObjName][semanticName] = token.keys.global;
        }
    };

    return semantic;
}

function toTitleCase(str, splitter = ' ') {
    return str.toLowerCase().split(splitter).map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ').trim();
}