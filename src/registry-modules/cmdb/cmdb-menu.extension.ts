import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { CMDBContext, ConfigItemDetailsContext } from '@kix/core/dist/browser/cmdb';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = CMDBContext.CONTEXT_ID;

    public contextIds: string[] = [CMDBContext.CONTEXT_ID, ConfigItemDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-cmdb";

    public text: string = "CMDB";

}

module.exports = (data, host, options) => {
    return new Extension();
};
