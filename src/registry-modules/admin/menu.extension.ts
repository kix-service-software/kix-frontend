import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { AdminContext } from '@kix/core/dist/browser/admin';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = AdminContext.CONTEXT_ID;

    public contextIds: string[] = [AdminContext.CONTEXT_ID];

    public primaryMenu: boolean = false;

    public icon: string = "kix-icon-admin";

    public text: string = "Admin";



}

module.exports = (data, host, options) => {
    return new Extension();
};
