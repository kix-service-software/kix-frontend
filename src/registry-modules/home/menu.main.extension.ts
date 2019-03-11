import { IMainMenuExtension } from '../../core/extensions';
import { HomeContext } from '../../core/browser/home';

export class Extensions implements IMainMenuExtension {

    public mainContextId: string = HomeContext.CONTEXT_ID;

    public contextIds: string[] = [HomeContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-home";

    public text: string = "Translatable#Home";

}

module.exports = (data, host, options) => {
    return new Extensions();
};
