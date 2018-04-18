import { FormField, FormDropdownItem, TreeNode } from "@kix/core/dist/model";

export class TicketInputServiceComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public field: FormField = null
    ) { }

}
