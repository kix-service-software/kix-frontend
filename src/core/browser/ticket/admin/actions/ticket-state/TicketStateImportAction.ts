import { AbstractAction } from "../../../../../model";

export class TicketStateImportAction extends AbstractAction {

    public initAction(): void {
        this.text = "Import";
        this.icon = 'kix-icon-import';
    }

}
