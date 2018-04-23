import { FormField, TreeNode, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputQueueComponentState extends FormInputComponentState {

    public constructor(public nodes: TreeNode[] = []) {
        super();
    }

}
