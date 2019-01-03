import { TreeNodeProperty } from "./TreeNodeProperty";
import { ObjectIcon } from "../..";

export class TreeNode {
    public constructor(
        public id: any = null,
        public label: string = null,
        public icon: string | ObjectIcon = null,
        public secondaryIcon: string | ObjectIcon = null,
        public children?: TreeNode[],
        public parent?: TreeNode,
        public nextNode?: TreeNode,
        public previousNode?: TreeNode,
        public properties?: TreeNodeProperty[],
        public expanded: boolean = false,
        public visible: boolean = false,
        public expandOnClick: boolean = false
    ) { }
}
