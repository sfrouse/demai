
export type LayoutInfo = {
    layoutMode: AutoLayoutMixin["layoutMode"],
    layoutAlign: AutoLayoutChildrenMixin["layoutAlign"],
    layoutGrow: number,
    layoutPositioning: AutoLayoutChildrenMixin["layoutPositioning"],
    layoutSizingVertical: LayoutMixin["layoutSizingVertical"],
    layoutSizingHorizontal: LayoutMixin["layoutSizingHorizontal"],
}

export function captureLocalLayout(node : InstanceNode | ComponentNode): LayoutInfo {
    return {
        layoutMode: node.layoutMode,
        layoutPositioning: node.layoutPositioning,
        layoutAlign: node.layoutAlign,
        layoutGrow: node.layoutGrow,
        layoutSizingVertical: node.layoutSizingVertical,
        layoutSizingHorizontal: node.layoutSizingHorizontal,
    }
}

export function applyLocalLayout(node : InstanceNode | ComponentNode, layout: LayoutInfo) {
    node.layoutMode = layout.layoutMode;
    node.layoutPositioning = layout.layoutPositioning;
    node.layoutAlign = layout.layoutAlign;
    node.layoutGrow = layout.layoutGrow;
    node.layoutSizingVertical = layout.layoutSizingVertical;
    node.layoutSizingHorizontal = layout.layoutSizingHorizontal;
}