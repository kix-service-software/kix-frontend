import { AbstractAction } from '../../../model';

export class ConfigItemPrintAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print';
        this.icon = 'kix-icon-print';
    }

}
