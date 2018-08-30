import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { ContextMode, KIXObjectType } from '@kix/core/dist/model';
import { CMDBContext } from '@kix/core/dist/browser/cmdb';

export class Extension implements IMainMenuExtension {

    public link: string = "/cmdb";

    public icon: string = "cmdb";

    public text: string = "CMDB";

    public contextId: string = CMDBContext.CONTEXT_ID;

    public contextMode: ContextMode = ContextMode.DASHBOARD;

    public KIXObjectType: KIXObjectType = KIXObjectType.ANY;

}

module.exports = (data, host, options) => {
    return new Extension();
};
