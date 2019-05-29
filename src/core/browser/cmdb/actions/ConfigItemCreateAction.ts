import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode, CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class ConfigItemCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems', [CRUD.CREATE]),
        new UIComponentPermission('cmdb/classes', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Config Item';
        this.icon = 'kix-icon-new-ci';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.CONFIG_ITEM, ContextMode.CREATE, null, true,
            undefined, undefined, 'new-config-item-form'
        );
    }

}
