
export default function findExposedChildren(node: any, exposedChildren: any[] = []) {
    if (node.children) {
        node.children.map((child: any) => {
            if (child.isExposedInstance === true) {
                exposedChildren.push(child);
            }
            findExposedChildren(child, exposedChildren)
        })
    }
    return exposedChildren;
}