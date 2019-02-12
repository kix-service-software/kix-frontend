import { TreeNode, FormInputComponentState } from "../../../../../core/model";

export class ComponentState extends FormInputComponentState<number[]> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNodes: TreeNode[] = []
    ) {
        super();
    }

}
