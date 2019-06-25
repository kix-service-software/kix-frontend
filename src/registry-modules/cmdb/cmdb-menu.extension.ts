import { IMainMenuExtension } from '../../core/extensions';
import { CMDBContext, ConfigItemDetailsContext } from '../../core/browser/cmdb';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { CRUD } from '../../core/model';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = CMDBContext.CONTEXT_ID;

    public contextIds: string[] = [CMDBContext.CONTEXT_ID, ConfigItemDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-cmdb";

    public text: string = "Translatable#CMDB";

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems', [CRUD.READ])
    ];
}

module.exports = (data, host, options) => {
    return new Extension();
};
