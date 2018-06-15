import { TreeNode, KIXObjectType } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public formId: string = null,
        public objectType: KIXObjectType = null,
        public searchInputs: any[] = [1, 2, 3, 4, 5],
        public propertyNodes: TreeNode[] = [],
        public currentPropertyNode: TreeNode = null,
        public operationNodes: TreeNode[] = [],
        public currentOperationNode: TreeNode = null
    ) { }

}
