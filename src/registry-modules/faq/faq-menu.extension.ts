import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { ContextMode, KIXObjectType } from '@kix/core/dist/model';
import { FAQContext } from '@kix/core/dist/browser/faq';

export class DashboardMainMenuExtension implements IMainMenuExtension {

    public link: string = "/faq";

    public icon: string = "faq";

    public text: string = "FAQ";

    public contextId: string = FAQContext.CONTEXT_ID;

    public contextMode: ContextMode = ContextMode.DASHBOARD;

    public KIXObjectType: KIXObjectType = KIXObjectType.ANY;

}

module.exports = (data, host, options) => {
    return new DashboardMainMenuExtension();
};
