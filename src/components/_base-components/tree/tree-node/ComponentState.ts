import { TreeNode } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public node: TreeNode,
        public filterValue: string = null,
        public activeNode: TreeNode = null,
        public treeParent: any = null,
        public treeId: string = null,
        public nodeId: string = null
    ) { }

}
