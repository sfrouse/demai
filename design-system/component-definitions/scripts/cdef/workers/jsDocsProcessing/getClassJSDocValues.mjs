

export default async function getClassJSDocValues(cls) {
    const jsDocs = cls.getJsDocs();
    const jsDocsResults = {
        hiddenProperties: [],
        examples: [],
        figmaComponent: undefined,
        slots: [],
        name: undefined,
        import: undefined,
    }
    if (jsDocs) {
        jsDocs.map(jsDoc => {
            const tags = jsDoc.getTags();
            tags.map(tag => {
                const tagName = tag.getTagName();
                const value = tag.getComment();
                switch (tagName.toLowerCase()) {
                    case 'hidden':
                    case 'cdefhidden':
                        jsDocsResults.hiddenProperties.push(`${value}`.trim());
                        break;
                    case 'example':
                    case 'cdefexample':
                        const example = value.split(',');
                        // TODO: find file and move to destination, rewrite path to $id
                        jsDocsResults.examples.push({
                            name: `${example[0]}`.trim(),
                            path: `${example[1]}`.trim(),
                            description: `${example[2]}`.trim(),
                        });
                        break;
                    case 'figmacomponent':
                    case 'cdeffigmacomponent':
                        jsDocsResults.figmaComponent = value;
                        break;
                    case 'name':
                    case 'cdefname':
                        jsDocsResults.name = value;
                        break;
                    case 'import':
                    case 'cdefimport':
                        jsDocsResults.import = value;
                        break;
                    case 'slot':
                    case 'cdefslot':
                        const slot = value.split(',');
                        jsDocsResults.slots.push({
                            label: `${slot[0]}`.trim(),
                            property: `${slot[1]}`.trim(),
                            defaultSlot: `${slot[2]}`.trim() === 'true',
                        });
                        break;
                }
            })
        })
    }
    return jsDocsResults;
}