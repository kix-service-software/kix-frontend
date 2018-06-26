import { TreeNode, FormInputComponentState } from "@kix/core/dist/model";

export class ComponentState extends FormInputComponentState<number[]> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNodes: TreeNode[] = [],
        public multiselect: boolean = false
    ) {
        super();
    }

}
