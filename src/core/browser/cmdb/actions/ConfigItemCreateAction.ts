import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { ConfigItemDialogUtil } from '../ConfigItemDialogUtil';

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
        ConfigItemDialogUtil.create();
    }

}
