import { FormInputComponentState, TreeNode } from "../../../../../core/model";

export class CompontentState extends FormInputComponentState<string | number | string[] | number[]> {

    public constructor(
        public nodes: TreeNode[] = [],
        public selectedNodes: TreeNode[] = null,
        public asMultiselect: boolean = false
    ) {
        super();
    }

}
