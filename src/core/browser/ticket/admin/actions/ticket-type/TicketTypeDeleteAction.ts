import { AbstractAction } from "../../../../../model";

export class TicketTypeDeleteAction extends AbstractAction {

    public initAction(): void {
        this.text = "Löschen";
        this.icon = "kix-icon-trash";
    }

}
