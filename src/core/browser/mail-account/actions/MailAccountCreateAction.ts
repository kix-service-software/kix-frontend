import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class MailAccountCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/communication/mailaccounts', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Account';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.MAIL_ACCOUNT, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Communication: Email', undefined, 'new-mail-account-form'
        );
    }

}
