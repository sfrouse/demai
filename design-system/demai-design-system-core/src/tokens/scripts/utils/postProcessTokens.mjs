
export default function postProcessTokens(tsTokens, valueMapping) {
    if (typeof tsTokens === "string") return;
    Object.entries(tsTokens).map(entry => {
        const value = entry [1];
        // fonts can be all jammed together
        if (
            value && 
            value.family &&
            value.lineheight &&
            value.size &&
            value.weight
        ) {
            value['font'] = `${value.weight} ${value.size}/${value.lineheight} ${value.family}`;
            valueMapping[value['font']] = `${
                valueMapping[value.weight]} ${
                valueMapping[value.size]}/${
                valueMapping[value.lineheight]} ${
                valueMapping[value.family]}`
        }else{
            postProcessTokens(value, valueMapping);
        }
    });
}