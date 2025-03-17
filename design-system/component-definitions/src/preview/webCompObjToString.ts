

export default function webCompObjToString(
  tag: string,
  webCompObj: any,
  propertyMappings?: {[key:string]: string}
) {
  const attrs: string[] = [];
  Object.entries(webCompObj).map(entry => {
    const name = entry[0];
    const value = entry[1];
    const attrName = propertyMappings ? propertyMappings[name] || name : name;
    if (attrName && value) {
      attrs.push(`${attrName}="${`${value}`.replace(/"/g, "&quot;")}"`);
    }else if (attrName) {
      attrs.push(attrName);
    }
  })
  return `<${tag} ${attrs.join(' ')}></${tag}>`;
}