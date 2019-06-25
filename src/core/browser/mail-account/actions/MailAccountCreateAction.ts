import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class MailAccountCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Email Account';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.MAIL_ACCOUNT, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Communication: Email'
        );
    }

}
