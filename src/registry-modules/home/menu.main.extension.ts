import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { HomeContext } from '@kix/core/dist/browser/home';
import { ContextMode, KIXObjectType } from '@kix/core/dist/model';

export class DashboardMainMenuExtension implements IMainMenuExtension {

    public link: string = "/home";

    public icon: string = "home";

    public text: string = "Home";

    public contextId: string = HomeContext.CONTEXT_ID;

    public contextMode: ContextMode = ContextMode.LIST;

    public KIXObjectType: KIXObjectType = KIXObjectType.ANY;

}

module.exports = (data, host, options) => {
    return new DashboardMainMenuExtension();
};
