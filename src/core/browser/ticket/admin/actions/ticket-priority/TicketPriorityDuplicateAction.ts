import { AbstractAction } from "../../../../../model";

export class TicketPriorityDuplicateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Duplizieren";
        this.icon = "kix-icon-copy";
    }

}
