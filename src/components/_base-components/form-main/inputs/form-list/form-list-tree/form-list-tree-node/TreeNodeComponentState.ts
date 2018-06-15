import { TreeNode } from '@kix/core/dist/model';

export class TreeNodeComponentState {

    public constructor(
        public node: TreeNode,
        public filterValue: string = null,
        public activeNodes: TreeNode[] = null,
        public treeParent: any = null,
        public treeId: string = null,
        public nodeId: string = null
    ) { }

}
