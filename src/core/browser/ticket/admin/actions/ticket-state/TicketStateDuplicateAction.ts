import { AbstractAction } from "../../../../../model";

export class TicketStateDuplicateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Duplizieren";
        this.icon = "kix-icon-copy";
    }

}
