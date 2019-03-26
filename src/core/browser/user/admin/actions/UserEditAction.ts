import { AbstractAction } from '../../../../model';

export class UserEditAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Edit Agent';
        this.icon = 'kix-icon-edit';
    }

}
