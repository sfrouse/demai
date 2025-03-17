

export default function getPropertyJSDocValues(property) {
    const jsDocs = property.getJsDocs();
    const jsDocsResults = {
        description: undefined,
        label: undefined,
        content: undefined,
        max: undefined,
        min: undefined,
    }
    if (jsDocs) {
        jsDocs.map(jsDoc => {
            const tags = jsDoc.getTags();
            tags.map(tag => {
                const tagName = tag.getTagName();
                const value = tag.getComment();
                switch (tagName.toLowerCase()) {
                    case 'label':
                    case 'cdeflabel':
                        jsDocsResults.label = value;
                        break;
                    case 'description':
                    case 'cdefdescription':
                        jsDocsResults.description = value;
                        break;
                    case 'content':
                    case 'cdefcontent':
                        jsDocsResults.content = value === 'false' ? undefined : true;
                        break;
                    case 'min':
                    case 'cdefmin':
                        jsDocsResults.min = parseInt(value);
                        break;
                    case 'max':
                    case 'cdefmax':
                        jsDocsResults.max = parseInt(value);
                        break;
                    
                }
            })
        })
    }
    return jsDocsResults;
}