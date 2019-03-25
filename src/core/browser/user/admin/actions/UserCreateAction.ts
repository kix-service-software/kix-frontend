import { AbstractAction } from '../../../../model';

export class UserCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New Agent';
        this.icon = 'kix-icon-new-gear';
    }

}
