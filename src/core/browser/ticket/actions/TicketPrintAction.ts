import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class TicketPrintAction extends AbstractAction {

    public initAction(): void {
        this.text = "Drucken";
        this.icon = "kix-icon-print";
    }

}
