/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { AdditionalTableObjectsHandlerConfiguration } from '../../../base-components/webapp/core/AdditionalTableObjectsHandlerConfiguration';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';

export class SuggestedFAQHandler implements IAdditionalTableObjectsHandler {

    public handlerId: string = 'SuggestedFAQHandler';

    public objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public async determineObjects(
        handlerConfig: AdditionalTableObjectsHandlerConfiguration, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<FAQArticle[]> {
        let articles = [];

        if (handlerConfig && Array.isArray(handlerConfig.dependencyProperties)) {
            const context = ContextService.getInstance().getActiveContext();
            const ticket = await context.getObject<Ticket>();
            const formId = context.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
            const formInstance = formId ? await context?.getFormManager()?.getFormInstance() : null;
            const filter: FilterCriteria[] = await this.getFilter(handlerConfig, ticket, formInstance);

            if (filter && filter.length) {
                if (
                    handlerConfig.handlerConfiguration
                    && handlerConfig.handlerConfiguration.onlyValid
                ) {
                    filter.push(
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.AND, 1
                        )
                    );
                }
                const preparedLoadingOptions = new KIXObjectLoadingOptions(
                    filter, null, null, loadingOptions ? loadingOptions.includes : null,
                    loadingOptions ? loadingOptions.expands : null
                );
                articles = await KIXObjectService.loadObjects<FAQArticle>(
                    KIXObjectType.FAQ_ARTICLE, null, preparedLoadingOptions
                ).catch(() => []);
            }
        }
        return articles;
    }

    private async getFilter(
        handlerConfig: AdditionalTableObjectsHandlerConfiguration, ticket: Ticket, formInstance?: FormInstance
    ): Promise<FilterCriteria[]> {
        let filter: FilterCriteria[] = [];

        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.FAQ_ARTICLE);
        if (service) {
            const minLength = handlerConfig.handlerConfiguration
                && handlerConfig.handlerConfiguration.minLenght
                ? handlerConfig.handlerConfiguration.minLenght : 3;
            const stopWords = await this.getStopWords();

            for (const p of handlerConfig.dependencyProperties) {
                const formField = formInstance ? formInstance.getFormFieldByProperty(p) : null;
                if (formField) {
                    const value = await formInstance.getFormFieldValueByProperty(p);
                    if (value && value.value && typeof value.value === 'string') {
                        const searchWords = value.value.replace(/;/g, '').split(' ');
                        filter = await this.buildFilterForSearchWords(
                            searchWords, service, minLength, stopWords
                        );
                    }
                } else if (ticket && ticket[p] && typeof ticket[p] === 'string') {
                    const searchWords = ticket[p].replace(/;/g, '').split(' ');
                    filter = await this.buildFilterForSearchWords(
                        searchWords, service, minLength, stopWords
                    );
                }
            }
        }
        return filter;
    }

    private async buildFilterForSearchWords(
        searchWords: string[], service: IKIXObjectService, minLenght: number, stopWords: string[]
    ): Promise<FilterCriteria[]> {
        let filter = [];
        for (const w of searchWords) {
            if (w.length >= minLenght && !stopWords.some((sw) => sw === w)) {
                const fullTextFilter = await service.prepareFullTextFilter(w);
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
        ).catch((): SysConfigOption[] => null);

        if (sysconfigOptions && sysconfigOptions.length) {
            stopWords = sysconfigOptions[0].Value;
        }

        return stopWords;
    }

}
