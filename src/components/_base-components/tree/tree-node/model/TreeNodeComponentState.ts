import { TreeNode } from "./TreeNode";

export class TreeNodeComponentState {

    public constructor(
        public node: TreeNode,
        public expanded: boolean = false,
    ) { }

}
