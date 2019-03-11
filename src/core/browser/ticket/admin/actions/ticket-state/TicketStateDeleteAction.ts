import { AbstractAction } from "../../../../../model";

export class TicketStateDeleteAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Delete';
        this.icon = "kix-icon-trash";
    }

}
