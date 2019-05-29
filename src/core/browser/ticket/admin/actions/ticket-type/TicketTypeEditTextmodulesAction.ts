import { AbstractAction } from "../../../../../model";

export class TicketTypeEditTextmodulesAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

}
