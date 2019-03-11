import { AbstractAction } from "../../../../../model";

export class TicketTypeEditTextmodulesAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

}
