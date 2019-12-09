/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";
import { FAQArticle } from "../../../model/FAQArticle";
import { BreadcrumbInformation } from "../../../../../model/BreadcrumbInformation";
import { FAQContext } from "./FAQContext";
import { KIXObject } from "../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";

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
        objectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE, reload: boolean = false
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
            ['Links']
        );

        const faqArticleId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load FAQ Article'
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
