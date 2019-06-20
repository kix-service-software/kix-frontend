import { AbstractAction, ConfigItem, CRUD } from "../../../model";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import { ConfigItemDialogUtil } from "../ConfigItemDialogUtil";

export class ConfigItemEditAction extends AbstractAction<ConfigItem> {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems/*/versions', [CRUD.CREATE]),
        new UIComponentPermission('cmdb/configitems/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        ConfigItemDialogUtil.edit();
    }

}
