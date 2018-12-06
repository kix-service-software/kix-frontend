import { WidgetComponentState, TreeNode } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public activeNode: TreeNode = null,
        public filterValue: string = null
    ) {
        super();
    }
}
