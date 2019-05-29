import { AbstractAction } from '../../../../model';

export class UserRoleTableDeleteAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Delete';
        this.icon = 'kix-icon-trash';
    }

}
