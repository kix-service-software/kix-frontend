import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../model';

export class ContactCreateCIAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems/*', [CRUD.UPDATE]),
        new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.CREATE]),
        new UIComponentPermission('cmdb/classes', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Config Item';
        this.icon = 'kix-icon-cmdb';
    }

}
