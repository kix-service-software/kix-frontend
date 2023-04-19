/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { FAQArticleProperty } from '../../../model/FAQArticleProperty';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { ContextPreference } from '../../../../../model/ContextPreference';

export class FAQContext extends Context {

    public static CONTEXT_ID: string = 'faq';

    public categoryId: number;

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        super.initContext();

        if (this.categoryId) {
            this.loadFAQArticles();
        }
    }

    public getIcon(): string {
        return 'kix-icon-faq';
    }

    public async getDisplayText(): Promise<string> {
        let text = await TranslationService.translate('Translatable#FAQ');
        if (this.categoryId) {
            const categoryName = await LabelService.getInstance().getPropertyValueDisplayText(
                KIXObjectType.FAQ_ARTICLE, FAQArticleProperty.CATEGORY_ID, this.categoryId
            );
            text = await TranslationService.translate('FAQ: {0}', [categoryName]);
        }
        return text;
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        this.handleURLParams(urlParams);
    }

    private handleURLParams(urlParams: URLSearchParams): void {
        this.setFAQCategoryId(urlParams?.has('categoryId') ? Number(urlParams.get('categoryId')) : null, false);
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];

            const params = [];
            if (this.categoryId) {
                params.push(`categoryId=${this.categoryId}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async setFAQCategoryId(categoryId: number, history: boolean = true): Promise<void> {
        if (!this.categoryId || this.categoryId !== categoryId) {
            this.categoryId = categoryId;

            EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);

            await this.loadFAQArticles();

            if (history) {
                ContextService.getInstance().setDocumentHistory(true, this, this, null);
            }
        }

        const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
        if (isStored) {
            ContextService.getInstance().updateStorage(this.instanceId);
        }
    }

    private async loadFAQArticles(limit: number = 20): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.limit = limit;

        loadingOptions.filter = [
            new FilterCriteria(
                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, 1
            )
        ];
        loadingOptions.includes = [FAQArticleProperty.VOTES];
        loadingOptions.expands = [FAQArticleProperty.VOTES];

        if (this.categoryId) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    FAQArticleProperty.CATEGORY_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, this.categoryId
                )
            );
        }

        const faqArticles = await KIXObjectService.loadObjects(
            KIXObjectType.FAQ_ARTICLE, null, loadingOptions, null, false, undefined, undefined, this.contextId
        ).catch((error) => []);
        this.setObjectList(KIXObjectType.FAQ_ARTICLE, faqArticles);
    }

    public reloadObjectList(
        objectType: KIXObjectType | string, silent: boolean = false, limit?: number
    ): Promise<void> {
        if (objectType === KIXObjectType.FAQ_ARTICLE) {
            return this.loadFAQArticles(limit);
        }
    }

    public async addStorableAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.addStorableAdditionalInformation(contextPreference);
        contextPreference['CATEGORY_ID'] = this.categoryId;
    }

    public async loadAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.loadAdditionalInformation(contextPreference);
        this.categoryId = contextPreference['CATEGORY_ID'];
    }

}
