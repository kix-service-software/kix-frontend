import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { HomeContext } from '@kix/core/dist/browser/home';

export class Extensions implements IMainMenuExtension {

    public mainContextId: string = HomeContext.CONTEXT_ID;

    public contextIds: string[] = [HomeContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-home";

    public text: string = "Home";

}

module.exports = (data, host, options) => {
    return new Extensions();
};
