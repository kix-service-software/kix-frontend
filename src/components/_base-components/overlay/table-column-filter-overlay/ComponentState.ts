import { TreeNode } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public hasListFilter: boolean = false,
        public nodes: TreeNode[] = [],
        public selectedNodes: TreeNode[] = [],
        public placeholder: string = ''
    ) { }

}
