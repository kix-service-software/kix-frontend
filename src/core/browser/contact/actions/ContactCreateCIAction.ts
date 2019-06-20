import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class ContactCreateCIAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems/*', [CRUD.CREATE]),
        new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.CREATE]),
        new UIComponentPermission('cmdb/classes', [CRUD.READ])
    ];

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
