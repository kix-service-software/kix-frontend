import { FormField, TreeNode, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputQueueComponentState extends FormInputComponentState<number> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null
    ) {
        super();
    }

}
