import { TreeNode } from "@kix/core/dist/browser/model";

export class TreeNodeComponentState {

    public constructor(
        public node: TreeNode,
        public expanded: boolean = false,
    ) { }

}
