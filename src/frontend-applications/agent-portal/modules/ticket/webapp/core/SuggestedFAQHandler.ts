/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IObjectReferenceHandler } from "../../../base-components/webapp/core/IObjectReferenceHandler";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FAQArticle } from "../../../faq/model/FAQArticle";
import { Ticket } from "../../model/Ticket";
import { ServiceRegistry } from "../../../base-components/webapp/core/ServiceRegistry";
import { IKIXObjectService } from "../../../base-components/webapp/core/IKIXObjectService";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { FormService } from "../../../base-components/webapp/core/FormService";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { FAQArticleProperty } from "../../../faq/model/FAQArticleProperty";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { DynamicFormFieldOption } from "../../../dynamic-fields/webapp/core";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";
import { SysConfigOption } from "../../../sysconfig/model/SysConfigOption";
import { SysConfigKey } from "../../../sysconfig/model/SysConfigKey";

export class SuggestedFAQHandler implements IObjectReferenceHandler {

    public name: string = 'SuggestedFAQHandler';

    public objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public async determineObjects(ticket: Ticket, config: any): Promise<FAQArticle[]> {
        let articles = [];

        if (ticket && config && config.properties && Array.isArray(config.properties)) {
            let filter = [];
            const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.FAQ_ARTICLE);
            if (service) {

                const stopWords = await this.getStopWords();

                const minLength = config.minLenght ? config.minLength : 3;
                for (const p of config.properties) {
                    if (ticket[p] && typeof ticket[p] === 'string') {
                        const searchWords = ticket[p].split(" ");
                        filter = await this.buildFilterForSearchWords(
                            searchWords, service, minLength, stopWords
                        );
                    }
                }
            }

            if (filter && filter.length) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    filter, null, null, [FAQArticleProperty.VOTES]
                );
                articles = await KIXObjectService.loadObjects<FAQArticle>(
                    KIXObjectType.FAQ_ARTICLE, null, loadingOptions
                ).catch(() => []);
            }
        }

        return articles;
    }

    public async determineObjectsByForm(formId: string, ticket: Ticket, config: any): Promise<FAQArticle[]> {
        let articles = [];
        if (config && config.properties && Array.isArray(config.properties)) {
            const minLength = config.minLenght ? config.minLength : 3;
            const formInstance = await FormService.getInstance().getFormInstance(formId);
            let filter: FilterCriteria[] = [];
            const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.FAQ_ARTICLE);
            if (service) {

                const stopWords = await this.getStopWords();

                for (const p of config.properties) {
                    const formField = await formInstance.getFormFieldByProperty(p);
                    if (formField) {
                        const value = await formInstance.getFormFieldValueByProperty(p);
                        if (value && value.value && typeof value.value === 'string') {
                            const searchWords = value.value.split(" ");
                            filter = await this.buildFilterForSearchWords(
                                searchWords, service, minLength, stopWords
                            );
                        }
                    } else {
                        if (ticket && ticket[p] && typeof ticket[p] === 'string') {
                            const searchWords = ticket[p].split(" ");
                            filter = await this.buildFilterForSearchWords(
                                searchWords, service, minLength, stopWords
                            );
                        }
                    }
                }
            }

            if (filter && filter.length) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    filter, null, null, [FAQArticleProperty.VOTES]
                );
                articles = await KIXObjectService.loadObjects<FAQArticle>(
                    KIXObjectType.FAQ_ARTICLE, null, loadingOptions
                ).catch(() => []);
            }

        }
        return articles;
    }

    public isPossibleFormField(formField: FormFieldConfiguration, config: any): boolean {
        if (formField && config && config.properties && Array.isArray(config.properties)) {
            if (formField.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                const dfNameOption = formField.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                if (dfNameOption) {
                    return config.properties.some((p) => p === 'DynamicFields.' + dfNameOption.value);
                }
            }

            return config.properties.some((p) => p === formField.property);
        }

        return false;
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
