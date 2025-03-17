


export default function findSlotChildren(node: any, slotChildren: any[] = []) {
    if (node.children) {
        node.children.map((child: any) => {
            if (
                child.type === 'INSTANCE' &&
                ( 
                    child.mainComponent?.name === '_slot' ||
                    child.mainComponent?.parent?.name === '_slot'
                )
            ) {
                slotChildren.push(child);
            }else{
                // Overengineering...only allow in root.
                // not entirely recursive...
                // the slot will be process on it's own
                // findSlotChildren(child, slotChildren);
            }
        })
    }
    return slotChildren;
}

export function findTextChildren(node: any, textChildren: any[] = []) {
    if (node.children) {
        node.children.map((child: any) => {
            console.log('child.type', child.type);
            if (
                child.type === 'TEXT' &&
                child.name === '_text'
            ) {
                textChildren.push(child);
            }else{
                // Overengineering...only allow in root.
                // not entirely recursive...
                // the slot will be process on it's own
                // findSlotChildren(child, textChildren);
            }
        })
    }
    return textChildren;
}

// export function processSlotChildren(node: any, slotFunk: (slot: any) => void) {
//     const slots = findSlotChildren(node);
//     slots.map(slotFunk);
// }

export async function processSlotChildren(node: any, slotFunk: (slot: any) => Promise<void> | void) {
    const slots = findSlotChildren(node);
    // Use a for loop to handle async function, and await if necessary
    for (const slot of slots) {
        // If slotFunk is asynchronous, await its result; otherwise, just call it
        await slotFunk(slot);
    }
}

export async function processTextChildren(node: any, textFunk: (text: any) => Promise<void> | void) {
    const texts = findTextChildren(node);
    // Use a for loop to handle async function, and await if necessary
    for (const text of texts) {
        // If slotFunk is asynchronous, await its result; otherwise, just call it
        await textFunk(text);
    }
}