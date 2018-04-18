import { TreeNode } from "@kix/core/dist/model";

export class TreeComponentState {

    public constructor(
        public tree: TreeNode[] = [],
        public displayTree: TreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = null,
        public activeNode: TreeNode = null,
        public subTree: boolean = false
    ) { }

}
