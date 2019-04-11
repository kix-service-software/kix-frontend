import { AbstractAction } from '../../../model';

export class ConfigItemVersionMaximizeAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Large View';
        this.icon = 'kix-icon-arrow-split2';
    }

}
