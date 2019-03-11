import { AbstractAction } from '../../../model';

export class ConfigItemVersionMaximizeAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Large View';
        this.icon = 'kix-icon-arrow-split2';
    }

}
