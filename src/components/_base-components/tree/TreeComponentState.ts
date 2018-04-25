import { TreeNode } from "@kix/core/dist/model";

export class TreeComponentState {

    public constructor(
        public tree: TreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = null,
        public activeNode: TreeNode = null,
        public treeParent: any = null
    ) { }

}
