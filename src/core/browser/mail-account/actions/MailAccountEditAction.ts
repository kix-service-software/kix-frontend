import { AbstractAction, FormInstance, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { FormService } from '../../form';
import { ContextService } from '../../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class MailAccountEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/communication/mailaccounts/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-mail-account-form', false);
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.MAIL_ACCOUNT, ContextMode.EDIT_ADMIN, null, true
        );
    }

}
