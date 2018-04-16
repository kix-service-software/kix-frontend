import { FormField, TreeNode } from "@kix/core/dist/model";

export class TicketInputQueueComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public field: FormField = null
    ) { }

}
