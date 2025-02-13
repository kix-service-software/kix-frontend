/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdditionalTableObjectsHandler } from '../../../base-components/webapp/core/IAdditionalTableObjectsHandler';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FAQArticle } from '../../../faq/model/FAQArticle';
import { Ticket } from '../../model/Ticket';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { IKIXObjectService } from '../../../base-components/webapp/core/IKIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { AdditionalTableObjectsHandlerConfiguration } from '../../../base-components/webapp/core/AdditionalTableObjectsHandlerConfiguration';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { ObjectFormHandler } from '../../../object-forms/webapp/core/ObjectFormHandler';
import { FAQService } from '../../../faq/webapp/core';

export class SuggestedFAQHandler implements IAdditionalTableObjectsHandler {

    public handlerId: string = 'SuggestedFAQHandler';

    public objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public async determineObjects(
        handlerConfig: AdditionalTableObjectsHandlerConfiguration, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<FAQArticle[]> {
        let articles = [];

        if (handlerConfig && Array.isArray(handlerConfig.dependencyProperties)) {
            const filter: FilterCriteria[] = await this.getFilter(handlerConfig);
            if (filter?.length) {
                this.applyValidFilter(handlerConfig, filter);

                loadingOptions.filter = filter;
                const preparedLoadingOptions = KIXObjectLoadingOptions.clone(loadingOptions);
                articles = await KIXObjectService.loadObjects<FAQArticle>(
                    KIXObjectType.FAQ_ARTICLE, null, preparedLoadingOptions
                ).catch(() => []);
            }
        }
        return articles;
    }

    private applyValidFilter(
        handlerConfig: AdditionalTableObjectsHandlerConfiguration, filter: FilterCriteria[]
    ): void {
        const needValid = handlerConfig.handlerConfiguration && handlerConfig.handlerConfiguration.onlyValid;
        if (needValid) {
            filter.push(
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, 1
                )
            );
        }
    }

    private async getFilter(handlerConfig: AdditionalTableObjectsHandlerConfiguration): Promise<FilterCriteria[]> {

        const context = ContextService.getInstance().getActiveContext();
        const ticket = await context.getObject<Ticket>();
        const formHandler = await context.getFormManager().getObjectFormHandler();

        let filter: FilterCriteria[] = [];

        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.FAQ_ARTICLE);
        if (service) {
            const minLength = handlerConfig?.handlerConfiguration?.minLenght || 3;
            const stopWords = await this.getStopWords();
            for (const p of handlerConfig?.dependencyProperties || []) {
                if (ticket && ticket[p] && typeof ticket[p] === 'string') {
                    filter = await this.setFilter(filter, ticket[p], service, minLength, stopWords);
                } else if (formHandler) {
                    const formValue = formHandler.getObjectFormCreator().findFormValue(p);
                    if (typeof formValue?.value === 'string') {
                        filter = await this.setFilter(filter, formValue.value, service, minLength, stopWords);
                    }
                }
            }
        }
        return filter;
    }

    private async setFilter(
        filter: FilterCriteria[], value: string, service: IKIXObjectService, minLength: any, stopWords: string[]
    ): Promise<FilterCriteria[]> {
        const searchWords = value
            .replace(/[.,!?"(){}\[\]:;<>@#$%^&*-+=_`~]/g, '')
            .replace(/\\/g, ' ')
            .split(' ')
            .filter((word) => word.length > 0);
        filter = await this.buildFilterForSearchWords(searchWords, service, minLength, stopWords);
        return filter;
    }

    private async buildFilterForSearchWords(
        searchWords: string[], service: IKIXObjectService, minLength: number, stopWords: string[]
    ): Promise<FilterCriteria[]> {
        let filter = [];
        for (const w of searchWords) {
            if (w.length >= minLength && !stopWords.some((sw) => sw === w)) {
                const fullTextFilter = await (service as FAQService).prepareFullTextFilter(w, FilterType.OR);
                filter = [
                    ...filter,
                    ...fullTextFilter
                ];
            }
        }
        return filter;
    }

    private async getStopWords(): Promise<string[]> {
        let stopWords = [];

        const language = await TranslationService.getUserLanguage();
        const key = SysConfigKey.TICKET_SEARCH_INDEX_STOPWORDS + '###' + language;
        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [key]
        ).catch((): SysConfigOption[] => []);

        if (sysconfigOptions?.length) {
            stopWords = sysconfigOptions[0].Value;
        }

        return stopWords;
    }

}
