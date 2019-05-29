import { AbstractAction } from '../../../../model';

export class ConfigItemClassImportAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Import';
        this.icon = 'kix-icon-import';
    }

}
