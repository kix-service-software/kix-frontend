import { KIXObjectType, TreeNode } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public formId: string = null,
        public objectType: KIXObjectType = null,
        public multiple: boolean = false,
        public propertyNodes: TreeNode[] = [],
        public currentPropertyNode: TreeNode = null,
        public operationNodes: TreeNode[] = [],
        public currentOperationNode: TreeNode = null
    ) { }

}
