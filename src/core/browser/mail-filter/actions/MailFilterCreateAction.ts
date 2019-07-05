import { AbstractAction, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class MailFilterCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Filter';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.MAIL_FILTER, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Communication: Email', undefined, 'new-mail-filter-form'
        );
    }

}
