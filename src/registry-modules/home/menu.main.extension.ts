import { IMainMenuExtension } from '../../core/extensions';
import { HomeContext } from '../../core/browser/home';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class Extensions implements IMainMenuExtension {

    public mainContextId: string = HomeContext.CONTEXT_ID;

    public contextIds: string[] = [HomeContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-home";

    public text: string = "Translatable#Home";

    public permissions: UIComponentPermission[] = [];

}

module.exports = (data, host, options) => {
    return new Extensions();
};
