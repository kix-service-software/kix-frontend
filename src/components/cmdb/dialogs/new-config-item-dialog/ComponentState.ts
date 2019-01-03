import { TreeNode } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public classNodes: TreeNode[] = [],
        public currentClassNode: TreeNode = null,
        public formId: string = null
    ) { }

}
