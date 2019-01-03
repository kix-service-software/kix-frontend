import { AbstractAction } from "../../../../../model";

export class TicketTypeDuplicateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Duplizieren";
        this.icon = "kix-icon-copy";
    }

}
