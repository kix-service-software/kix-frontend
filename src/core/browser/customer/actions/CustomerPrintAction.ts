import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class CustomerPrintAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print';
        this.icon = "kix-icon-print";
    }

}
