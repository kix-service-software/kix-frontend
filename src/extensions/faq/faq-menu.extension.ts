import { IMainMenuExtension } from '../../core/extensions';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { CRUD } from '../../core/model';
import { FAQContext } from '../../core/browser/faq/context/FAQContext';
import { FAQDetailsContext } from '../../core/browser/faq/context/FAQDetailsContext';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = FAQContext.CONTEXT_ID;

    public contextIds: string[] = [FAQContext.CONTEXT_ID, FAQDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-faq";

    public text: string = "Translatable#FAQ";

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles', [CRUD.READ])
    ];

    public orderRang: number = 400;

}

module.exports = (data, host, options) => {
    return new Extension();
};
