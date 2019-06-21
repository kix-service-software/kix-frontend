import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContactDialogUtil } from '../ContactDialogUtil';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../model';

export class ContactEditAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('contacts/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        ContactDialogUtil.edit();
    }

}
