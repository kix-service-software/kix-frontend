import { TableTreeNode } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public node: TableTreeNode,
        public filterValue: string = null,
        public activeNode: TableTreeNode = null,
        public treeParent: any = null,
        public treeId: string = null,
        public nodeId: string = null,
        public title: boolean = false
    ) { }

}
