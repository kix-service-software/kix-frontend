import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class TicketMergeAction extends AbstractAction {

    public initAction(): void {
        this.text = "Zusammenfassen";
        this.icon = "kix-icon-arrow-sumup";
    }

}
