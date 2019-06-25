import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../model';
import { ConfigItemDialogUtil } from '../../cmdb';

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
        ConfigItemDialogUtil.create();
    }

}
