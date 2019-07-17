import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class NotificationCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/communication/notifications', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Notification';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.NOTIFICATION, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Automation: Notification'
        );
    }

}
