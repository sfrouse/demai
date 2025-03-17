

export default function findInstanceOfProp(node: any, propName: string, instanceArr: any[] = []) {
    if (node.componentPropertyReferences?.mainComponent === propName) {
        instanceArr.push(node);
    }
    if (node.children) {
        node.children.map((child: any) => {
            findInstanceOfProp(child, propName, instanceArr);
        })
    }
    return instanceArr;
}