import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class TicketMergeAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Merge';
        this.icon = 'kix-icon-arrow-sumup';
    }

}
