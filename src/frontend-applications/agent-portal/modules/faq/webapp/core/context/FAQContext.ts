/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { FAQCategory } from "../../../model/FAQCategory";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { KIXObjectProperty } from "../../../../../model/kix/KIXObjectProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { FAQArticleProperty } from "../../../model/FAQArticleProperty";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";

export class FAQContext extends Context {

    public static CONTEXT_ID: string = 'faq';

    public faqCategory: FAQCategory;

    public getIcon(): string {
        return 'kix-icon-faq';
    }

    public async getDisplayText(): Promise<string> {
        return 'FAQ Dashboard';
    }

    public async setFAQCategory(faqCategory: FAQCategory): Promise<void> {
        if (faqCategory) {
            if (!this.faqCategory || faqCategory.ID !== this.faqCategory.ID) {
                this.faqCategory = faqCategory;
                await this.loadFAQArticles();
                this.listeners.forEach(
                    (l) => l.objectChanged(
                        this.faqCategory ? this.faqCategory.ID : null,
                        this.faqCategory,
                        KIXObjectType.FAQ_CATEGORY)
                );
            }
        } else if (this.faqCategory || typeof this.faqCategory === 'undefined') {
            this.faqCategory = null;
            await this.loadFAQArticles();
        }
    }

    private async loadFAQArticles(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, 1
                )
            ], null, 1000, [FAQArticleProperty.VOTES], [FAQArticleProperty.VOTES]
        );
        if (this.faqCategory) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    FAQArticleProperty.CATEGORY_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, this.faqCategory.ID
                )
            );
        }

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load FAQ Articles'
            });
        }, 500);


        const faqArticles = await KIXObjectService.loadObjects(
            KIXObjectType.FAQ_ARTICLE, null, loadingOptions, null, false
        ).catch((error) => []);
        window.clearTimeout(timeout);
        this.setObjectList(KIXObjectType.FAQ_ARTICLE, faqArticles);

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    public reset(): void {
        super.reset();
        this.faqCategory = null;
        this.loadFAQArticles();
    }

    public reloadObjectList(objectType: KIXObjectType | string): Promise<void> {
        if (objectType === KIXObjectType.FAQ_ARTICLE) {
            return this.loadFAQArticles();
        }
    }

}
