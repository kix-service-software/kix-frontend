import { TreeNode, FormInputComponentState } from "../../../../../../core/model";

export class ComponentState extends FormInputComponentState<string[]> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNodes: TreeNode[] = null,
        public placeholder: string = ''
    ) {
        super();
    }

}
