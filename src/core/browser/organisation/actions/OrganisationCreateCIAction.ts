import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class OrganisationCreateCIAction extends AbstractAction {

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
