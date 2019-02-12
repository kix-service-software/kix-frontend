import { TableTreeNodeLabel } from "./TableTreeNodeLabel";

export class TableTreeNode {
    public constructor(
        public id: any = null,
        public labels: TableTreeNodeLabel[] = [],
        public children?: TableTreeNode[],
        public parent?: TableTreeNode,
        public nextNode?: TableTreeNode,
        public previousNode?: TableTreeNode,
        public expanded: boolean = false,
        public visible: boolean = true
    ) { }
}
