import { IMainMenuExtension } from '../../core/extensions';
import { FAQContext, FAQDetailsContext } from '../../core/browser/faq';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = FAQContext.CONTEXT_ID;

    public contextIds: string[] = [FAQContext.CONTEXT_ID, FAQDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-faq";

    public text: string = "FAQ";



}

module.exports = (data, host, options) => {
    return new Extension();
};
