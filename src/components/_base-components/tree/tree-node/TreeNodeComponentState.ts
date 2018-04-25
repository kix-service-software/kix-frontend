import { TreeNode } from '@kix/core/dist/model';

export class TreeNodeComponentState {

    public constructor(
        public node: TreeNode,
        public filterValue: string = null,
        public activeNode: TreeNode = null,
        public treeParent: any = null
    ) { }

}
