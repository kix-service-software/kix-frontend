import { FormInputComponentState, TreeNode } from "@kix/core/dist/model";

export class CompontentState extends FormInputComponentState<number> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public loading: boolean = true,
        public error: string = null
    ) {
        super();
    }

}
