import { TreeNode } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public classNodes: TreeNode[] = [],
        public currentClassNode: TreeNode = null
    ) { }

}
