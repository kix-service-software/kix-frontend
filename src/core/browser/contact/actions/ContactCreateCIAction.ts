import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { ContextMode, KIXObjectType } from '../../../model';

export class ContactCreateCIAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Config Item';
        this.icon = 'kix-icon-cmdb';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.CONFIG_ITEM, ContextMode.CREATE, null, true,
            undefined, undefined, 'new-config-item-form'
        );
    }

}
