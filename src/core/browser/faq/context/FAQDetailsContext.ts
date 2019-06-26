import {
    KIXObjectType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions
} from "../../../model";
import { Context } from '../../../model/components/context/Context';
import { FAQArticle } from "../../../model/kix/faq";
import { FAQContext } from "./FAQContext";
import { KIXObjectService } from "../../kix";
import { EventService } from "../../event";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";

export class FAQDetailsContext extends Context {

    public static CONTEXT_ID = 'faq-details';

    public getIcon(): string {
        return 'kix-icon-faq';
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<FAQArticle>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<FAQArticle>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation(this.getIcon(), [FAQContext.CONTEXT_ID], text);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE, reload: boolean = false
    ): Promise<O> {
        const object = await this.loadFAQArticle() as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.FAQ_ARTICLE)
            );
        }

        return object;
    }

    private async loadFAQArticle(): Promise<FAQArticle> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            ['Attachments', 'Votes', 'Links', 'History'],
            ['Links', 'Votes']
        );

        const faqArticleId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load FAQ Article ...`
            });
        }, 500);

        const faqArticles = await KIXObjectService.loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [faqArticleId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let faqArticle: FAQArticle;
        if (faqArticles && faqArticles.length) {
            faqArticle = faqArticles[0];
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        return faqArticle;
    }
}
